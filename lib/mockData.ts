export const portfolioStats = {
  totalValue: "$124,562.89",
  dailyPnL: "+$1,234.50",
  dailyPnLPercentage: "+1.02%",
  activeAgents: 3,
  openPositions: 12,
  isPositive: true,
};

export const recentTrades = [
  { id: "TRD-1", symbol: "NVDA", type: "BUY", price: "$1,120.50", amount: 10, time: "10:24 AM", pnl: "-" },
  { id: "TRD-2", symbol: "AAPL", type: "SELL", price: "$189.20", amount: 50, time: "09:15 AM", pnl: "+$145.00" },
  { id: "TRD-3", symbol: "TSLA", type: "BUY", price: "$175.40", amount: 20, time: "08:42 AM", pnl: "-" },
  { id: "TRD-4", symbol: "BTC-USD", type: "SELL", price: "$68,420.00", amount: 0.5, time: "Yesterday", pnl: "+$850.20" },
  { id: "TRD-5", symbol: "MSFT", type: "BUY", price: "$420.15", amount: 15, time: "Yesterday", pnl: "-" },
];

export const agentActivities = [
  { id: "ACT-1", agent: "Alpha-1", action: "Executed BUY order for NVDA at $1,120.50", time: "2m ago", type: "success" },
  { id: "ACT-2", agent: "RiskManager", action: "Adjusted stop-loss for TSLA to $170.00", time: "15m ago", type: "warning" },
  { id: "ACT-3", agent: "MomentumBot", action: "Scanning tech sector for breakout patterns", time: "1h ago", type: "info" },
  { id: "ACT-4", agent: "Alpha-1", action: "Closed AAPL position taking +$145.00 profit", time: "3h ago", type: "success" },
  { id: "ACT-5", agent: "System", action: "Daily portfolio reconciliation completed", time: "5h ago", type: "info" },
];

export const watchlist = [
  { symbol: "NVDA", price: "$1,125.40", change: "+2.4%", isPositive: true },
  { symbol: "AMD", price: "$164.20", change: "-1.2%", isPositive: false },
  { symbol: "BTC-USD", price: "$68,210.00", change: "+0.8%", isPositive: true },
  { symbol: "ETH-USD", price: "$3,850.50", change: "+1.5%", isPositive: true },
  { symbol: "META", price: "$475.10", change: "-0.4%", isPositive: false },
];
