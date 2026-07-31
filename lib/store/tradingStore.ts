import { create } from "zustand";
import { Position, Trade, AgentSignal, AgentDiagnostic, PortfolioStats, Portfolio } from "../types/trading";
import { executeSimulatedOrder, closeSimulatedPosition } from "../services/tradingEngine";
import { syncPortfolio, syncTrade, syncPosition, deletePosition } from "../services/dbSync";
import { calculatePortfolioStats, SEED_CLOSED_TRADES } from "../services/portfolioService";
import { validateOrderExecution, checkMarginLiquidation } from "../services/riskManager";
import { coordinateAgentConsensus } from "../services/agentCoordinator";
import { SocketStatus, binanceWebsocketService } from "../services/binanceService";

interface TradingStore {
  selectedAsset: string;
  setSelectedAsset: (symbol: string) => void;
  
  // Real-time market prices streamed from socket
  prices: Record<string, number>;
  priceChanges: Record<string, number>;
  socketStatus: SocketStatus;
  updateSocketStatus: (status: SocketStatus) => void;

  // Paper Trading & Portfolio state
  balance: number;
  positions: Position[];
  history: Trade[];
  
  // AI Agent states
  agentDiagnostics: AgentDiagnostic[];
  agentSignals: Record<string, AgentSignal>;
  latestConsensusReasoning: string;
  latestConsensusConfidence: number;

  watchlistSymbols: string[];
  portfolioMetrics: { timestamp: string; totalValue: number; cash: number; realizedPnL: number; unrealizedPnL: number; drawDown: number }[];
  isDashboardLoading: boolean;
  dashboardError: string | null;
  isMarketLoading: boolean;
  marketError: string | null;

  // Actions
  fetchDashboardData: () => Promise<void>;
  fetchMarketData: (symbols: string[]) => Promise<void>;
  updatePrice: (symbol: string, price: number, changePercent: number) => void;
  updateKlineClose: (symbol: string, closePrice: number, historyPrices: number[]) => void;
  executeOrder: (order: { symbol: string; type: "LONG" | "SHORT"; amount: number; price: number; stopLoss?: number; takeProfit?: number }) => { success: boolean; error?: string };
  closePosition: (id: string, reason?: "MANUAL" | "STOP_LOSS" | "TAKE_PROFIT") => void;
  resetStore: () => void;
  
  // Analytics selector
  getStats: () => PortfolioStats;
}

const INITIAL_BALANCE = 100000;

export const useTradingStore = create<TradingStore>((set, get) => {
  // Client-side hydration helper
  const isClient = typeof window !== "undefined";
  const savedBalance = isClient ? localStorage.getItem("quant_balance_z") : null;
  const savedPositions = isClient ? localStorage.getItem("quant_positions_z") : null;
  const savedHistory = isClient ? localStorage.getItem("quant_history_z") : null;

  const initialBalance = savedBalance ? parseFloat(savedBalance) : INITIAL_BALANCE;
  const initialPositions = savedPositions ? JSON.parse(savedPositions) : [];
  const initialHistory = savedHistory ? JSON.parse(savedHistory) : SEED_CLOSED_TRADES;


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
  ];

  return {
    selectedAsset: "BTCUSDT",
    prices: { BTCUSDT: 68210.0, ETHUSDT: 3850.5, SOLUSDT: 164.2 }, // Mocked fallbacks for UI
    priceChanges: { BTCUSDT: 0.8, ETHUSDT: 1.5, SOLUSDT: -1.2 }, // Mocked fallbacks for UI
    socketStatus: "DISCONNECTED",
    balance: initialBalance,
    positions: initialPositions,
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
        const [dashRes, sigRes, agentsRes] = await Promise.all([
          fetch("/api/dashboard"),
          fetch("/api/signals"),
          fetch("/api/agents")
        ]);

        if (!dashRes.ok) throw new Error("Failed to load dashboard data");
        
        const dashData = await dashRes.json();
        const sigData = await sigRes.json();
        const agentsData = await agentsRes.json();

        // Check if there is portfolio data, otherwise fallback to local initial state
        const nextBalance = dashData.portfolio?.balance ?? initialBalance;
        const nextPositions = dashData.activePositions ?? initialPositions;
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
      const evaluatedPositions = nextPositions.filter((pos) => {
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
          const { closedTrade, cashReturn } = closeSimulatedPosition(pos, price, trigger);
          nextBalance += cashReturn;
          nextHistory = [closedTrade, ...nextHistory];
          closedPositions.push(pos.id);
          return false; // Remove from list
        }

        return true;
      });

      // 3. Margin safety calculations / liquidation stop-outs
      const liquidationCheck = checkMarginLiquidation(nextBalance, evaluatedPositions);
      let finalPositions = evaluatedPositions;

      if (liquidationCheck.liquidateAll) {
        // Force close all open perp contracts at current mark prices!
        evaluatedPositions.forEach((pos) => {
          const currentMarkPrice = nextPrices[pos.symbol] || pos.currentPrice;
          const { closedTrade, cashReturn } = closeSimulatedPosition(pos, currentMarkPrice, "STOP_LOSS");
          nextBalance += cashReturn;
          nextHistory = [closedTrade, ...nextHistory];
        });
        finalPositions = [];
        console.warn(liquidationCheck.message);
      }

      // Persist values to localStorage (client only)
      if (isClient) {
        localStorage.setItem("quant_balance_z", nextBalance.toString());
        localStorage.setItem("quant_positions_z", JSON.stringify(finalPositions));
        localStorage.setItem("quant_history_z", JSON.stringify(nextHistory));
      }

      // Update state
      set({
        prices: nextPrices,
        priceChanges: nextPriceChanges,
        balance: nextBalance,
        positions: finalPositions,
        history: nextHistory,
      });
    },

    // Technical Candle stream close updater
    updateKlineClose: (symbol, closePrice, historyPrices) => {
      const state = get();
      // Run AI consensus engine on candle close!
      const stats = calculatePortfolioStats(state.balance, state.positions, state.history);
      const decision = coordinateAgentConsensus(
        symbol,
        historyPrices,
        stats.maxDrawdown,
        stats.exposure
      );

      // Update diagnostic action scrolling streams in the dashboard
      const nextDiagnostics = state.agentDiagnostics.map((agent) => {
        const signal = decision.agentSignals[agent.id];
        if (!signal) return agent;

        // Append new thought based on consensus
        const currentThoughts = agent.activity;
        const newThought = `[Auto Signal: ${signal.type}] ${signal.reason}`;
        const updatedThoughts = [newThought, ...currentThoughts.filter((t) => t !== newThought).slice(0, 2)];

        return {
          ...agent,
          confidence: signal.confidence,
          status: signal.type !== "HOLD" ? "EXECUTING" : "ACTIVE",
          activity: updatedThoughts,
        };
      });

      // Optional Auto execution of Agent signals (if we want the platform to simulate active trading bots!
      // That is an absolute WOW factor. If the Technical consensus BUY is generated, we can open a perp position automatically!
      // Let's implement an automated paper trading executor for AI signals!
      // This will let the user sit back and watch their bots trade live! Extremely premium.
      let nextBalance = state.balance;
      let nextPositions = [...state.positions];

      const alreadyHasAsset = state.positions.some((p) => p.symbol === symbol);

      if (decision.action !== "HOLD" && !alreadyHasAsset && decision.positionSizePercent > 0) {
        const targetRiskAllocUsd = (nextBalance * decision.positionSizePercent) / 100;
        const orderQty = targetRiskAllocUsd / closePrice;
        
        // Enforce bounds
        if (orderQty > 0.0001 && nextBalance >= targetRiskAllocUsd) {
          const riskCheck = validateOrderExecution(
            { symbol, type: decision.action === "BUY" ? "LONG" : "SHORT", amount: orderQty, price: closePrice },
            nextBalance,
            nextPositions
          );

          if (riskCheck.allowed) {
            // Open position
            const orderResult = executeSimulatedOrder(
              {
                symbol,
                type: decision.action === "BUY" ? "LONG" : "SHORT",
                amount: orderQty,
                price: closePrice,
                stopLoss: decision.action === "BUY" ? closePrice * 0.96 : closePrice * 1.04,
                takeProfit: decision.action === "BUY" ? closePrice * 1.08 : closePrice * 0.92,
              },
              nextBalance
            );

            if (orderResult.success && orderResult.position) {
              nextBalance -= (orderQty * orderResult.executionPrice + orderResult.fee);
              nextPositions = [orderResult.position, ...nextPositions];
              
              if (isClient) {
                localStorage.setItem("quant_balance_z", nextBalance.toString());
                localStorage.setItem("quant_positions_z", JSON.stringify(nextPositions));
              }
            }
          }
        }
      }

      set({
        agentDiagnostics: nextDiagnostics as AgentDiagnostic[],
        agentSignals: { ...state.agentSignals, ...decision.agentSignals },
        latestConsensusReasoning: decision.reasoning,
        latestConsensusConfidence: decision.confidence,
        balance: nextBalance,
        positions: nextPositions,
      });
    },

    // Manual Trade Execution action
    executeOrder: (order) => {
      const state = get();
      
      // 1. Validate Order Risk Limits first
      const riskValidation = validateOrderExecution(order, state.balance, state.positions);
      if (!riskValidation.allowed) {
        return { success: false, error: riskValidation.error };
      }

      // 2. Compute fill slippage and taker exchange fees
      const result = executeSimulatedOrder(order, state.balance);
      if (!result.success || !result.position) {
        return { success: false, error: result.error };
      }

      const orderQty = order.amount;
      const fillCost = orderQty * result.executionPrice;
      const totalDebit = fillCost + result.fee;

      const nextBalance = state.balance - totalDebit;
      const nextPositions = [result.position, ...state.positions];

      set({
        balance: nextBalance,
        positions: nextPositions,
      });

      if (isClient) {
        localStorage.setItem("quant_balance_z", nextBalance.toString());
        localStorage.setItem("quant_positions_z", JSON.stringify(nextPositions));
      }

      // DB sync for order execution
      if (typeof window !== "undefined") {
        syncPortfolio({
          id: "",
          totalValue: nextBalance,
          cash: nextBalance,
          unrealizedPnL: 0,
          realizedPnL: 0,
          winRate: 0,
          sharpeRatio: 0,
          maxDrawdown: 0,
          leverage: 1,
          exposure: 0,
          netBeta: 0,
          valueAtRisk: 0,
          equityCurve: [] as { time: string; value: number }[],
        } as Portfolio);
        // Record the trade
        syncTrade({
          id: "",
          userId: "",
          symbol: order.symbol,
          type: order.type,
          entryPrice: order.price,
          exitPrice: order.price,
          amount: order.amount,
          pnl: 0,
          pnlPercentage: 0,
          entryTime: new Date().toISOString(),
          exitTime: new Date().toISOString(),
          exitReason: "MANUAL",
          fee: result.fee,
          slippage: 0,
        } as Trade);
        // Position sync
        nextPositions.forEach((p) => syncPosition(p));
      }

      return { success: true };
    },

    // Position Closing Action
    closePosition: (id, reason = "MANUAL") => {
      const state = get();
      const pos = state.positions.find((p) => p.id === id);
      if (!pos) return;

      const latestPrice = state.prices[pos.symbol] || pos.currentPrice;
      const { closedTrade, cashReturn } = closeSimulatedPosition(pos, latestPrice, reason);

      const nextBalance = state.balance + cashReturn;
      const nextPositions = state.positions.filter((p) => p.id !== id);
      const nextHistory = [closedTrade, ...state.history];

      set({
        balance: nextBalance,
        positions: nextPositions,
        history: nextHistory,
      });

      if (isClient) {
        localStorage.setItem("quant_balance_z", nextBalance.toString());
        localStorage.setItem("quant_positions_z", JSON.stringify(nextPositions));
        localStorage.setItem("quant_history_z", JSON.stringify(nextHistory));
      }

      // DB sync for position close
      if (typeof window !== "undefined") {
        syncPortfolio({
          id: "",
          totalValue: nextBalance,
          cash: nextBalance,
          unrealizedPnL: 0,
          realizedPnL: 0,
          winRate: 0,
          sharpeRatio: 0,
          maxDrawdown: 0,
          leverage: 1,
          exposure: 0,
          netBeta: 0,
          valueAtRisk: 0,
          equityCurve: [] as { time: string; value: number }[],
        } as Portfolio);
        syncTrade({
          id: "",
          userId: "",
          symbol: pos?.symbol ?? "",
          type: pos?.type ?? "LONG",
          entryPrice: pos?.entryPrice ?? 0,
          exitPrice: latestPrice,
          amount: pos?.amount ?? 0,
          pnl: cashReturn - (pos?.entryPrice ?? 0) * (pos?.amount ?? 0),
          pnlPercentage: 0,
          entryTime: new Date().toISOString(),
          exitTime: new Date().toISOString(),
          exitReason: reason,
          fee: 0,
          slippage: 0,
        } as Trade);
        if (pos) deletePosition(pos.id);
      }
    },

    // Reset paper account action
    resetStore: () => {
      set({
        balance: INITIAL_BALANCE,
        positions: [],
        history: SEED_CLOSED_TRADES,
      });
      if (isClient) {
        localStorage.setItem("quant_balance_z", INITIAL_BALANCE.toString());
        localStorage.setItem("quant_positions_z", JSON.stringify([]));
        localStorage.setItem("quant_history_z", JSON.stringify(SEED_CLOSED_TRADES));
      }
    },

    // Portfolio metrics aggregator (feeds analytics charts)
    getStats: () => {
      const state = get();
      return calculatePortfolioStats(state.balance, state.positions, state.history);
    },
  };
});
