import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Position, Trade, Order, AgentSignal, AgentDiagnostic, PortfolioStats, Portfolio } from "../types/trading";
import { SocketStatus, binanceWebsocketService } from "../services/binanceService";

interface TradingStore {
  selectedAsset: string;
  setSelectedAsset: (symbol: string) => void;
  
  chartTimeframe: string;
  setChartTimeframe: (tf: string) => void;
  chartPreferences: Record<string, unknown> | null;
  setChartPreferences: (prefs: Record<string, unknown>) => void;

  // Real-time market prices streamed from socket (UI ONLY)
  prices: Record<string, number>;
  priceChanges: Record<string, number>;
  socketStatus: SocketStatus;
  updateSocketStatus: (status: SocketStatus) => void;

  // Authoritative Portfolio state from Backend
  balance: number;
  totalValue: number;
  unrealizedPnL: number;
  realizedPnL: number;
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
      // Pre-seed agent diagnostic states matching the beautiful UI
      const initialDiagnostics: AgentDiagnostic[] = [
        {
          id: "market-analysis", name: "Market Analysis Agent", role: "Fundamental & Macro scanning", icon: "📊", status: "ANALYZING", confidence: 84, health: "HEALTHY", latency: "18ms", uptime: "99.98%",
          activity: ["Parsed FED transcripts: hawkish tone expected.", "Scanning volume profiles for BTC block zones."],
        },
        {
          id: "technical-analysis", name: "Technical Analysis Agent", role: "Indicator & Candlestick analytics", icon: "📈", status: "EXECUTING", confidence: 91, health: "HEALTHY", latency: "8ms", uptime: "100.0%",
          activity: ["Computing EMA crossover configurations.", "Scanned MACD trend vectors on BTC 1m kline stream."],
        },
        {
          id: "sentiment-analysis", name: "Sentiment Analysis Agent", role: "News feeds & Social media parsing", icon: "💬", status: "ACTIVE", confidence: 76, health: "HEALTHY", latency: "35ms", uptime: "99.92%",
          activity: ["Compiled news articles: crypto ETF flows positive.", "Fear & Greed Index parsed: 64 (Greed)."],
        },
        {
          id: "risk-management", name: "Risk Management Agent", role: "Stop loss & Capital allocation constraints", icon: "🛡️", status: "ACTIVE", confidence: 98, health: "HEALTHY", latency: "5ms", uptime: "100.0%",
          activity: ["Margin allocations checked. Net leverage nominal.", "Maximum loss buffers established."],
        },
        {
          id: "portfolio-allocation", name: "Portfolio Allocation Agent", role: "Weight distribution optimizer", icon: "💼", status: "ACTIVE", confidence: 88, health: "HEALTHY", latency: "22ms", uptime: "99.95%",
          activity: ["Simulating mean-variance rebalancing loops.", "Optimal Cash buffer calculated: 55.0%."],
        },
        {
          id: "consensus-coordinator", name: "Consensus Coordinator", role: "Multi-agent decision aggregation", icon: "🧠", status: "ACTIVE", confidence: 100, health: "HEALTHY", latency: "2ms", uptime: "100.0%",
          activity: ["Awaiting sub-agent evaluations.", "Consensus engine initialized."],
        },
        {
          id: "execution-agent", name: "Execution Agent", role: "Order sizing & routing", icon: "⚡", status: "ACTIVE", confidence: 100, health: "HEALTHY", latency: "1ms", uptime: "100.0%",
          activity: ["Standing by for execution directives.", "Order routing systems online."],
        },
      ];

      return {
        selectedAsset: "BTCUSDT",
        chartTimeframe: "60",
        prices: {},
        priceChanges: {},
        socketStatus: "DISCONNECTED",
        
        balance: INITIAL_BALANCE,
        totalValue: INITIAL_BALANCE,
        unrealizedPnL: 0,
        realizedPnL: 0,
        positions: [],
        pendingOrders: [],
        history: [],
        
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

            // Strict Backend as Single Source of Truth
            const nextBalance = dashData.portfolio?.balance ?? INITIAL_BALANCE;
            const nextTotalValue = dashData.portfolio?.totalValue ?? INITIAL_BALANCE;
            const nextUnrealizedPnL = dashData.portfolio?.unrealizedPnL ?? 0;
            const nextRealizedPnL = dashData.portfolio?.realizedPnL ?? 0;
            const nextPositions = dashData.activePositions ?? [];
            const nextOrders = ordersData.length > 0 ? ordersData : [];
            const nextHistory = dashData.executionHistory ?? [];
            
            const mergedDiagnostics = initialDiagnostics.map(diag => {
              const dbAgent = agentsData.agents?.find((a: any) => a.id === diag.id);
              return {
                ...diag,
                status: dbAgent?.status || diag.status,
                health: dbAgent?.health || diag.health,
                activity: dbAgent?.activity && dbAgent.activity.length > 0 ? dbAgent.activity : diag.activity,
              };
            });

            const parsedSignals = sigData.signals || {};
            const consensusStr = sigData.consensus?.reasoning || "Awaiting signal computations...";
            const consensusConf = sigData.consensus?.confidence || 50;

            set({
              balance: nextBalance,
              totalValue: nextTotalValue,
              unrealizedPnL: nextUnrealizedPnL,
              realizedPnL: nextRealizedPnL,
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

            binanceWebsocketService.connect(symbols);
          } catch (err) {
            console.error("Market fetch error:", err);
            set({ isMarketLoading: false, marketError: String(err) });
          }
        },

        setSelectedAsset: (symbol) => set({ selectedAsset: symbol }),
        updateSocketStatus: (status) => set({ socketStatus: status }),

        // Prices are updated strictly for UI (chart/ticker), but NOT for portfolio math
        updatePrice: (symbol, price, changePercent) => {
          const state = get();
          
          set({
            prices: { ...state.prices, [symbol]: price },
            priceChanges: { ...state.priceChanges, [symbol]: changePercent },
          });

          // Forward ticks to backend engine for authoritative limit/liquidation evaluation
          fetch("/api/engine/tick", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              symbol,
              price,
              isKlineClosed: false
            })
          }).then(res => res.json()).then(result => {
             // If limits or liquidations triggered on the backend, fetch fresh portfolio state
             if (result.ok && result.actionTriggered) {
                 get().fetchDashboardData();
             }
          }).catch(() => {});
        },

        updateKlineClose: async (symbol, closePrice, historyPrices) => {
          const state = get();
          
          let combinedHistory = state.historicalKlines[symbol] || [];
          if (historyPrices && historyPrices.length > 0) {
            combinedHistory = [...combinedHistory, ...historyPrices];
          } else {
            combinedHistory = [...combinedHistory, closePrice];
          }

          if (combinedHistory.length > 100) {
            combinedHistory = combinedHistory.slice(combinedHistory.length - 100);
          }
          
          set({ historicalKlines: { ...state.historicalKlines, [symbol]: combinedHistory } });

          // Forward kline close to backend engine for authoritative AI consensus
          try {
            const res = await fetch("/api/engine/tick", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                symbol,
                price: closePrice,
                isKlineClosed: true,
                historyPrices: combinedHistory
              })
            });
            const result = await res.json();
            
            // Re-fetch dashboard state to get fresh signals, agent states, and any new executions
            if (result.ok && (result.aiTriggered || result.limitsChecked)) {
                get().fetchDashboardData();
            }
          } catch (err) {
            console.error("Engine tick error:", err);
          }
        },

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

        closePosition: async (id, reason = "MANUAL") => {
          const state = get();
          const pos = state.positions.find((p) => p.id === id);
          if (!pos) return;

          const latestPrice = state.prices[pos.symbol] || pos.currentPrice;
          
          // Optimistically remove for snappier UI
          set({ positions: state.positions.filter((p) => p.id !== id) });

          try {
            await fetch(`/api/positions?id=${id}&exitPrice=${latestPrice}&reason=${reason}`, { method: "DELETE" });
            get().fetchDashboardData();
          } catch (err) {
            console.error("Close position error:", err);
            get().fetchDashboardData(); // revert optimistic on error
          }
        },

        resetStore: () => {
          set({
            balance: INITIAL_BALANCE,
            totalValue: INITIAL_BALANCE,
            unrealizedPnL: 0,
            realizedPnL: 0,
            positions: [],
            pendingOrders: [],
            history: [],
          });
        },

        // Portfolio metrics aggregator (returns backend authoritative values)
        getStats: () => {
          const state = get();
          return {
            totalValue: state.totalValue,
            cash: state.balance,
            unrealizedPnL: state.unrealizedPnL,
            realizedPnL: state.realizedPnL,
            winRate: 0, // Should be fetched from backend if needed
            sharpeRatio: 0,
            maxDrawdown: 0,
            leverage: 0,
            exposure: 0,
            netBeta: 0,
            valueAtRisk: 0,
            equityCurve: [] // Handled by portfolioMetrics
          };
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
        // ONLY persist UI preferences
        selectedAsset: state.selectedAsset,
        chartTimeframe: state.chartTimeframe,
        chartPreferences: state.chartPreferences,
        watchlistSymbols: state.watchlistSymbols,
      }),
    }
  )
);
