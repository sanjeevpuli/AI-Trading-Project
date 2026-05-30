export interface Trade {
  id: string;
  userId?: string; // optional for DB sync
  symbol: string;
  type: "LONG" | "SHORT";
  entryPrice: number;
  exitPrice: number;
  amount: number;
  pnl: number;
  pnlPercentage: number;
  entryTime: string;
  exitTime: string;
  exitReason: "MANUAL" | "STOP_LOSS" | "TAKE_PROFIT";
  fee: number;
  slippage: number;
}

export interface Position {
  id: string;
  userId?: string; // optional for DB sync
  symbol: string;
  type: "LONG" | "SHORT";
  entryPrice: number;
  currentPrice: number;
  amount: number;
  stopLoss?: number;
  takeProfit?: number;
  timestamp: string;
  pnl: number;
  pnlPercentage: number;
}

export interface Order {
  id: string;
  symbol: string;
  type: "LONG" | "SHORT";
  amount: number;
  price: number;
  stopLoss?: number;
  takeProfit?: number;
  timestamp: string;
}

export interface AgentSignal {
  id: string;
  agentId: string;
  symbol: string;
  type: "BUY" | "SELL" | "HOLD";
  confidence: number;
  reason: string;
  riskScore: number;
  timestamp: string;
}

export interface AgentDiagnostic {
  id: string;
  name: string;
  role: string;
  icon: string;
  status: "ACTIVE" | "IDLE" | "ANALYZING" | "EXECUTING";
  confidence: number;
  health: "HEALTHY" | "DEGRADED" | "OFFLINE";
  latency: string;
  uptime: string;
  activity: string[];
}

export interface Portfolio {
  id: string;
  userId?: string; // optional for DB sync
  totalValue: number;
  cash: number;
  unrealizedPnL: number;
  realizedPnL: number;
  winRate: number;
  sharpeRatio: number;
  maxDrawdown: number;
  leverage: number;
  exposure: number;
  netBeta: number;
  valueAtRisk: number;
  equityCurve: { time: string; value: number }[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface PortfolioStats {
  totalValue: number;
  cash: number;
  unrealizedPnL: number;
  realizedPnL: number;
  winRate: number;
  sharpeRatio: number;
  maxDrawdown: number;
  leverage: number;
  exposure: number;
  netBeta: number;
  valueAtRisk: number;
  equityCurve: { time: string; value: number }[];
}
