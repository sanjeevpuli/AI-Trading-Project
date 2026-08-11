import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Position, Trade, Order, AgentSignal, AgentDiagnostic, PortfolioStats, Portfolio } from "../types/trading";
import { executeSimulatedOrder, closeSimulatedPosition } from "../services/tradingEngine";
import { syncPortfolio, syncTrade, syncPosition, deletePosition, syncOrder, deleteOrder, syncSignals } from "../services/dbSync";
import { calculatePortfolioStats } from "../services/portfolioService";
import { validateOrderExecution, checkMarginLiquidation } from "../services/riskManager";
import { evaluatePendingOrders } from "../services/tradingEngine";
import { coordinateAgentConsensus } from "../services/agentCoordinator";
import { evaluateExecution } from "../services/ai/execution";
import { agentMemory } from "../services/ai/agentMemory";
import { SocketStatus, binanceWebsocketService } from "../services/binanceService";

interface TradingStore {
  selectedAsset: string;
  setSelectedAsset: (symbol: string) => void;
  
  chartTimeframe: string;
  setChartTimeframe: (tf: string) => void;
  chartPreferences: Record<string, unknown> | null;
  setChartPreferences: (prefs: Record<string, unknown>) => void;

  // Real-time market prices streamed from socket
  prices: Record<string, number>;
  priceChanges: Record<string, number>;
  socketStatus: SocketStatus;
  updateSocketStatus: (status: SocketStatus) => void;

  // Paper Trading & Portfolio state
  balance: number;
  positions: Position[];
  pendingOrders: Order[];
  history: Trade[];
  
  // AI Agent states
  agentDiagnostics: AgentDiagnostic[];
  agentSignals: Record<string, AgentSignal>;
  latestConsensusReasoning: string;
  latestConsensusConfidence: number;

  watchlistSymbols: string[];
  setWatchlistSymbols: (symbols: string[]) => void;
  portfolioMetrics: { timestamp: string; totalValue: number; cash: number; realizedPnL: number; unrealizedPnL: number; drawDown: number }[];
  isDashboardLoading: boolean;
  dashboardError: string | null;
  isMarketLoading: boolean;
  marketError: string | null;

  // Actions
  fetchDashboardData: () => Promise<void>;
  fetchMarketData: (symbols: string[]) => Promise<void>;
  updatePrice: (symbol: string, price: number, changePercent: number) => void;
  // AI and Data History
  historicalKlines: Record<string, number[]>;
  isWarmingUp: boolean;
  setHistoricalKlines: (symbol: string, klines: number[]) => void;
  updateKlineClose: (symbol: string, price: number, historyPrices: number[]) => void;
  executeOrder: (order: { symbol: string; type: "LONG" | "SHORT"; orderType: "MARKET" | "LIMIT"; amount: number; price: number; stopLoss?: number; takeProfit?: number }) => Promise<{ success: boolean; error?: string }>;
  cancelOrder: (id: string) => Promise<void>;
  closePosition: (id: string, reason?: "MANUAL" | "STOP_LOSS" | "TAKE_PROFIT" | "LIQUIDATION") => Promise<void>;
  resetStore: () => void;
  
  // Analytics selector
  getStats: () => PortfolioStats;
}

const INITIAL_BALANCE = 100000;

export const useTradingStore = create<TradingStore>()(
  persist(
    (set, get) => {
      // Client-side hydration helper
      const isClient = typeof window !== "undefined";
      const savedBalance = isClient ? localStorage.getItem("quant_balance_z") : null;
      const savedPositions = isClient ? localStorage.getItem("quant_positions_z") : null;
      const savedOrders = isClient ? localStorage.getItem("quant_orders_z") : null;
      const savedHistory = isClient ? localStorage.getItem("quant_history_z") : null;

      const initialBalance = savedBalance ? parseFloat(savedBalance) : INITIAL_BALANCE;
      const initialPositions = savedPositions ? JSON.parse(savedPositions) : [];
      const initialOrders = savedOrders ? JSON.parse(savedOrders) : [];
      const initialHistory = savedHistory ? JSON.parse(savedHistory) : [];

      // Pre-seed agent diagnostic states matching the beautiful UI
      const initialDiagnostics: AgentDiagnostic[] = [
        {
          id: "market-analysis",
          name: "Market Analysis Agent",
          role: "Fundamental & Macro scanning",
          icon: "📊",
          status: "ANALYZING",
          confidence: 84,
          health: "HEALTHY",
          latency: "18ms",
          uptime: "99.98%",
          activity: [
            "Parsed FED transcripts: hawkish tone expected.",
            "Scanning volume profiles for BTC block zones.",
          ],
        },
        {
          id: "technical-analysis",
          name: "Technical Analysis Agent",
          role: "Indicator & Candlestick analytics",
          icon: "📈",
          status: "EXECUTING",
          confidence: 91,
          health: "HEALTHY",
          latency: "8ms",
          uptime: "100.0%",
          activity: [
            "Computing EMA crossover configurations.",
            "Scanned MACD trend vectors on BTC 1m kline stream.",
          ],
        },
        {
          id: "sentiment-analysis",
          name: "Sentiment Analysis Agent",
          role: "News feeds & Social media parsing",
          icon: "💬",
          status: "ACTIVE",
          confidence: 76,
          health: "HEALTHY",
          latency: "35ms",
          uptime: "99.92%",
          activity: [
            "Compiled news articles: crypto ETF flows positive.",
            "Fear & Greed Index parsed: 64 (Greed).",
          ],
        },
        {
          id: "risk-management",
          name: "Risk Management Agent",
          role: "Stop loss & Capital allocation constraints",
          icon: "🛡️",
          status: "ACTIVE",
          confidence: 98,
          health: "HEALTHY",
          latency: "5ms",
          uptime: "100.0%",
          activity: [
            "Margin allocations checked. Net leverage nominal.",
            "Maximum loss buffers established.",
          ],
        },
        {
          id: "portfolio-allocation",
          name: "Portfolio Allocation Agent",
          role: "Weight distribution optimizer",
          icon: "💼",
          status: "ACTIVE",
          confidence: 88,
          health: "HEALTHY",
          latency: "22ms",
          uptime: "99.95%",
          activity: [
            "Simulating mean-variance rebalancing loops.",
            "Optimal Cash buffer calculated: 55.0%.",
          ],
        },
        {
          id: "consensus-coordinator",
          name: "Consensus Coordinator",
          role: "Multi-agent decision aggregation",
          icon: "🧠",
          status: "ACTIVE",
          confidence: 100,
          health: "HEALTHY",
          latency: "2ms",
          uptime: "100.0%",
          activity: [
            "Awaiting sub-agent evaluations.",
            "Consensus engine initialized.",
          ],
        },
        {
          id: "execution-agent",
          name: "Execution Agent",
          role: "Order sizing & routing",
          icon: "⚡",
          status: "ACTIVE",
          confidence: 100,
          health: "HEALTHY",
          latency: "1ms",
          uptime: "100.0%",
          activity: [
            "Standing by for execution directives.",
            "Order routing systems online.",
          ],
        },
      ];

      return {
        selectedAsset: "BTCUSDT",
        chartTimeframe: "60",
        prices: {},
        priceChanges: {},
        socketStatus: "DISCONNECTED",
        balance: initialBalance,
        positions: initialPositions,
        pendingOrders: initialOrders,
        history: initialHistory,
        agentDiagnostics: initialDiagnostics,
        agentSignals: {},
        latestConsensusReasoning: "Awaiting candle closing indicators to form weighted consensus trade actions.",
        latestConsensusConfidence: 50,
        watchlistSymbols: [],
        portfolioMetrics: [],
        isDashboardLoading: true,
        dashboardError: null,
        isMarketLoading: true,
        marketError: null,

        fetchDashboardData: async () => {
          set({ isDashboardLoading: true, dashboardError: null });
          try {
            const [dashRes, sigRes, agentsRes, ordersRes] = await Promise.all([
              fetch("/api/dashboard"),
              fetch("/api/signals"),
              fetch("/api/agents"),
              fetch("/api/orders")
            ]);

            let dashData: any = {};
            if (dashRes.ok) {
              dashData = await dashRes.json();
            } else {
              console.warn("Dashboard API failed.");
            }


            const sigData = sigRes.ok ? await sigRes.json() : { signals: [] };
            const agentsData = agentsRes.ok ? await agentsRes.json() : { agents: [] };
            const ordersData = ordersRes.ok ? await ordersRes.json() : [];

        // Check if there is portfolio data, otherwise fallback to local initial state
        const nextBalance = dashData.portfolio?.balance ?? initialBalance;
        const nextPositions = dashData.activePositions ?? initialPositions;
        const nextOrders = ordersData.length > 0 ? ordersData : initialOrders;
        const nextHistory = dashData.executionHistory ?? initialHistory;
        
        // Agent diagnostics merging: merge the static UI setup with real logs from DB
        const mergedDiagnostics = initialDiagnostics.map(diag => {
          const dbAgent = agentsData.agents?.find((a: any) => a.id === diag.id);
          return {
            ...diag,
            status: dbAgent?.status || diag.status,
            health: dbAgent?.health || diag.health,
            activity: dbAgent?.activity && dbAgent.activity.length > 0 ? dbAgent.activity : diag.activity,
          };
        });

        // Parse signals 
        // We expect /api/signals to return { signals: Record<string, AgentSignal>, consensus: { type, reasoning, confidence } }
        const parsedSignals = sigData.signals || {};
        const consensusStr = sigData.consensus?.reasoning || "Awaiting signal computations...";
        const consensusConf = sigData.consensus?.confidence || 50;

        set({
          balance: nextBalance,
          positions: nextPositions,
          pendingOrders: nextOrders,
          history: nextHistory,
          watchlistSymbols: dashData.watchlist || [],
          portfolioMetrics: dashData.metrics || [],
          agentDiagnostics: mergedDiagnostics,
          agentSignals: parsedSignals,
          latestConsensusReasoning: consensusStr,
          latestConsensusConfidence: consensusConf,
          isDashboardLoading: false,
        });

      } catch (err) {
        console.error("Dashboard fetch error:", err);
        set({ isDashboardLoading: false, dashboardError: String(err) });
      }
    },

    fetchMarketData: async (symbols) => {
      set({ isMarketLoading: true, marketError: null });
      try {
        const res = await fetch(`/api/market?symbols=${encodeURIComponent(JSON.stringify(symbols))}`);
        if (!res.ok) throw new Error("Failed to load market data");
        const data = await res.json();
        
        const state = get();
        const nextPrices = { ...state.prices };
        const nextPriceChanges = { ...state.priceChanges };
        
        if (data.symbols && Array.isArray(data.symbols)) {
          data.symbols.forEach((s: any) => {
            nextPrices[s.symbol] = s.price;
            nextPriceChanges[s.symbol] = s.changePercent;
          });
        }

        set({
          prices: nextPrices,
          priceChanges: nextPriceChanges,
          isMarketLoading: false,
        });

        // Initialize WebSockets for the live feed
        binanceWebsocketService.connect(symbols);

      } catch (err) {
        console.error("Market fetch error:", err);
        set({ isMarketLoading: false, marketError: String(err) });
      }
    },

    // UI Tab & Asset actions
    setSelectedAsset: (symbol) => set({ selectedAsset: symbol }),
    updateSocketStatus: (status) => set({ socketStatus: status }),

    // High frequency price updater (WebSockets ticker stream)
    updatePrice: (symbol, price, changePercent) => {
      const state = get();
      const nextPrices = { ...state.prices, [symbol]: price };
      const nextPriceChanges = { ...state.priceChanges, [symbol]: changePercent };
      
      let nextBalance = state.balance;
      let nextHistory = [...state.history];
      let nextOrders = [...state.pendingOrders];
      const closedPositions: string[] = [];

      // 1. Recalculate all open positions based on new mark-prices
      const nextPositions = state.positions.map((pos) => {
        if (pos.symbol !== symbol) return pos;

        // Compute unrealized pnl
        let pnl = 0;
        if (pos.type === "LONG") {
          pnl = (price - pos.entryPrice) * pos.amount;
        } else {
          pnl = (pos.entryPrice - price) * pos.amount;
        }

        const costBasis = pos.entryPrice * pos.amount;
        const pnlPercentage = (pnl / costBasis) * 100;

        return {
          ...pos,
          currentPrice: price,
          pnl,
          pnlPercentage,
        };
      });

      // 2. Evaluate Automatic SL/TP limits
      let evaluatedPositions = nextPositions.filter((pos) => {
        // If not matching symbol, keep it
        if (pos.symbol !== symbol) return true;

        // Check limits
        let trigger: "STOP_LOSS" | "TAKE_PROFIT" | null = null;
        if (pos.type === "LONG") {
          if (pos.stopLoss && price <= pos.stopLoss) trigger = "STOP_LOSS";
          if (pos.takeProfit && price >= pos.takeProfit) trigger = "TAKE_PROFIT";
        } else {
          if (pos.stopLoss && price >= pos.stopLoss) trigger = "STOP_LOSS";
          if (pos.takeProfit && price <= pos.takeProfit) trigger = "TAKE_PROFIT";
        }

        if (trigger) {
          // Auto close!
          get().closePosition(pos.id, trigger);
          return false; // Remove from list optimistically
        }

        return true;
      });

      // 3. Evaluate pending limit orders
      const triggeredOrders = evaluatePendingOrders(nextOrders, nextPrices);
      for (const order of triggeredOrders) {
        // Execute it as market order now that it crossed
        get().cancelOrder(order.id); // delete pending
        get().executeOrder({
          symbol: order.symbol,
          type: order.type,
          orderType: "MARKET",
          amount: order.amount,
          price: nextPrices[order.symbol],
          stopLoss: order.stopLoss,
          takeProfit: order.takeProfit
        });
        
        // Remove from pending orders list optimistically
        nextOrders = nextOrders.filter(o => o.id !== order.id);
      }

      // 4. Margin safety calculations / liquidation stop-outs
      const liquidationCheck = checkMarginLiquidation(nextBalance, evaluatedPositions);
      let finalPositions = evaluatedPositions;

      if (liquidationCheck.liquidateAll) {
        // Force close all open perp contracts at current mark prices!
        evaluatedPositions.forEach((pos) => {
          get().closePosition(pos.id, "LIQUIDATION");
        });
        finalPositions = [];
        console.warn(liquidationCheck.message);
      }

      // Persist values to localStorage (client only)
      if (isClient) {
        localStorage.setItem("quant_balance_z", nextBalance.toString());
        localStorage.setItem("quant_positions_z", JSON.stringify(finalPositions));
        localStorage.setItem("quant_orders_z", JSON.stringify(nextOrders));
        localStorage.setItem("quant_history_z", JSON.stringify(nextHistory));
      }

      // Update state
      set({
        prices: nextPrices,
        priceChanges: nextPriceChanges,
        balance: nextBalance,
        positions: finalPositions,
        pendingOrders: nextOrders,
        history: nextHistory,
      });
    },

    // Technical Candle stream close updater
    updateKlineClose: async (symbol, closePrice, historyPrices) => {
      const state = get();
      
      // Combine warmup historical klines with live websocket klines
      let combinedHistory = state.historicalKlines[symbol] || [];
      if (historyPrices && historyPrices.length > 0) {
        // Since historyPrices might just be recent websocket data, we append the latest closePrice
        // or just use historyPrices directly if it contains the full history.
        // Actually, binanceService.ts builds up `historyPrices` starting from the first websocket message.
        // So we can just concatenate them.
        combinedHistory = [...combinedHistory, ...historyPrices];
      } else {
        combinedHistory = [...combinedHistory, closePrice];
      }

      // Keep last 100 candles max
      if (combinedHistory.length > 100) {
        combinedHistory = combinedHistory.slice(combinedHistory.length - 100);
      }

      // Run AI consensus engine on candle close!
      const stats = calculatePortfolioStats(state.balance, state.positions, state.history, state.portfolioMetrics);
      const decision = coordinateAgentConsensus(
        symbol,
        combinedHistory,
        stats.maxDrawdown,
        stats.exposure
      );

      // Update diagnostic action scrolling streams in the dashboard
      const nextDiagnostics = state.agentDiagnostics.map((agent) => {
        if (agent.id === "consensus-coordinator") {
          const newThought = `[Consensus: ${decision.action}] Conf: ${decision.confidence}%. ${decision.reasoning}`;
          return {
            ...agent,
            confidence: decision.confidence,
            status: decision.action !== "HOLD" ? "EXECUTING" : "ACTIVE",
            activity: [newThought, ...agent.activity.filter(t => t !== newThought)].slice(0, 3)
          };
        }

        const signal = decision.agentSignals[agent.id];
        if (!signal) return agent;

        // Append new thought based on consensus
        const currentThoughts = agent.activity;
        const newThought = `[Auto Signal: ${signal.type}] ${signal.reason}`;
        const updatedThoughts = [newThought, ...currentThoughts.filter((t) => t !== newThought).slice(0, 3)];

        return {
          ...agent,
          confidence: signal.confidence,
          status: signal.type !== "HOLD" ? "EXECUTING" : "ACTIVE",
          activity: updatedThoughts,
        };
      });

      // 7. Execution Agent (Order Sizing and Execution)
      const hasExistingPosition = state.positions.some((p) => p.symbol === symbol);
      const executionDecision = evaluateExecution(
        symbol,
        closePrice,
        state.balance,
        hasExistingPosition,
        decision
      );

      // Record to Agent Memory
      agentMemory.addDecision(decision);

      if (executionDecision) {
        // Log execution thought
        nextDiagnostics.forEach(agent => {
          if (agent.id === "execution-agent") {
            agent.activity = [executionDecision.reason, ...agent.activity].slice(0, 3);
            agent.status = "EXECUTING";
          }
        });

        // Dispatch order via backend API
        const result = await get().executeOrder(executionDecision);
        if (!result.success && result.error) {
           agentMemory.recordRejection(result.error, decision);
        }
      } else if (decision.action !== "HOLD" && hasExistingPosition) {
         agentMemory.recordRejection("Already have an open position for this asset.", decision);
      }

      if (isClient) {
        syncSignals({
          signals: decision.agentSignals,
          consensus: {
            type: decision.action,
            confidence: decision.confidence,
            reasoning: decision.reasoning
          }
        });
      }

      set({
        agentDiagnostics: nextDiagnostics as AgentDiagnostic[],
        agentSignals: { ...state.agentSignals, ...decision.agentSignals },
        latestConsensusReasoning: decision.reasoning,
        latestConsensusConfidence: decision.confidence,
      });
    },

    // Manual Trade Execution action
    executeOrder: async (order) => {
      try {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(order)
        });
        
        const result = await res.json();
        
        if (!res.ok || !result.success) {
          return { success: false, error: result.error || "Order execution failed on server" };
        }

        // Fetch fresh state from single source of truth
        get().fetchDashboardData();
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message || String(err) };
      }
    },

    cancelOrder: async (id) => {
      try {
        await fetch(`/api/orders?id=${id}`, { method: "DELETE" });
        get().fetchDashboardData();
      } catch (err) {
        console.error("Cancel order error:", err);
      }
    },

    // Position Closing Action
    closePosition: async (id, reason = "MANUAL") => {
      const state = get();
      const pos = state.positions.find((p) => p.id === id);
      if (!pos) return;

      const latestPrice = state.prices[pos.symbol] || pos.currentPrice;
      
      // Optimistically remove
      set({ positions: state.positions.filter((p) => p.id !== id) });

      try {
        await fetch(`/api/positions?id=${id}&exitPrice=${latestPrice}&reason=${reason}`, { method: "DELETE" });
        get().fetchDashboardData();
      } catch (err) {
        console.error("Close position error:", err);
      }
    },

    resetStore: () => {
      set({
        balance: INITIAL_BALANCE,
        positions: [],
        pendingOrders: [],
        history: [],
      });
      if (isClient) {
        localStorage.setItem("quant_balance_z", INITIAL_BALANCE.toString());
        localStorage.setItem("quant_positions_z", JSON.stringify([]));
        localStorage.setItem("quant_orders_z", JSON.stringify([]));
        localStorage.setItem("quant_history_z", JSON.stringify([]));
      }
    },

    // Portfolio metrics aggregator (feeds analytics charts)
    getStats: () => {
      const state = get();
      return calculatePortfolioStats(state.balance, state.positions, state.history, state.portfolioMetrics);
    },
    


    historicalKlines: {},
    isWarmingUp: false,
    
    setChartTimeframe: (tf) => set({ chartTimeframe: tf }),
    chartPreferences: null,
    setChartPreferences: (prefs) => set({ chartPreferences: prefs }),

    setHistoricalKlines: (symbol: string, klines: number[]) => {
      set((state) => ({
        historicalKlines: { ...state.historicalKlines, [symbol]: klines },
        isWarmingUp: false,
      }));
    },

    setWatchlistSymbols: (symbols) => set({ watchlistSymbols: symbols }),
  };
  },
  {
    name: "quant-store",
    partialize: (state) => ({
      selectedAsset: state.selectedAsset,
      chartTimeframe: state.chartTimeframe,
      chartPreferences: state.chartPreferences,
      watchlistSymbols: state.watchlistSymbols,
      // Note: we can persist balance/orders/history here too, 
      // but they are already manually persisted so we'll leave them to avoid double storage for now.
    }),
  }
)
);
