import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Features — QuantAI Trading Platform",
  description: "Discover all the features of QuantAI: AI agents, real-time data, backtesting, portfolio analytics, and risk management.",
};

const sections = [
  {
    icon: "🤖",
    title: "Multi-Agent AI System",
    description: "Five specialized AI agents work in concert to analyze markets from every angle:",
    items: [
      "Market Analysis Agent — fundamental & macro scanning",
      "Technical Analysis Agent — EMA, RSI, MACD, candlestick patterns",
      "Sentiment Analysis Agent — news feeds & social media parsing",
      "Risk Management Agent — stop loss & capital allocation",
      "Portfolio Allocation Agent — weight distribution optimizer",
      "Consensus Engine — weighted voting across all agents",
    ],
  },
  {
    icon: "📡",
    title: "Real-Time Market Data",
    description: "Connected directly to Binance WebSocket streams:",
    items: [
      "Live ticker updates every ~1 second per symbol",
      "1-minute kline (candlestick) data streams",
      "BTC, ETH, SOL and more supported",
      "Automatic reconnection on network drops",
      "Price change percentage tracking",
    ],
  },
  {
    icon: "📈",
    title: "Paper Trading Engine",
    description: "Full-featured simulated trading with real market prices:",
    items: [
      "LONG and SHORT positions",
      "Stop-loss and take-profit automation",
      "Margin liquidation engine",
      "Realistic slippage and fee simulation",
      "Automatic position management",
      "Complete trade history",
    ],
  },
  {
    icon: "🧪",
    title: "Strategy Backtesting",
    description: "Validate strategies before going live:",
    items: [
      "Multiple built-in strategies (RSI, EMA Crossover, Breakout)",
      "Custom date range testing",
      "Full performance metrics dashboard",
      "Sharpe Ratio, Max Drawdown, Win Rate",
      "Equity curve visualization",
      "Trade-by-trade analysis",
    ],
  },
  {
    icon: "💼",
    title: "Portfolio Analytics",
    description: "Deep insight into your simulated portfolio:",
    items: [
      "Real-time equity curve",
      "Asset allocation chart",
      "Unrealized and realized PnL tracking",
      "Win rate analysis",
      "Exposure and leverage metrics",
      "Value at Risk calculation",
    ],
  },
  {
    icon: "🛡️",
    title: "Risk Management",
    description: "Institutional-grade risk controls:",
    items: [
      "Per-position size limits",
      "Portfolio exposure caps",
      "Automatic stop-loss enforcement",
      "Margin level monitoring",
      "Liquidation warnings",
      "Net Beta exposure tracking",
    ],
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-blue-500 text-xl">◆</span>
            <span className="text-xl font-bold text-zinc-100">QuantAI</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
            <Link href="/features" className="text-zinc-100 font-medium">Features</Link>
            <Link href="/about" className="hover:text-zinc-100 transition">About</Link>
            <Link href="/contact" className="hover:text-zinc-100 transition">Contact</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-zinc-400 hover:text-zinc-100 transition px-3 py-1.5">Sign In</Link>
            <Link href="/signup" className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition">Get Started</Link>
          </div>
        </div>
      </nav>

      <main className="pt-28 pb-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-zinc-100 mb-4">Platform Features</h1>
            <p className="text-zinc-400 text-xl max-w-2xl mx-auto">
              Everything you need to master algorithmic trading — completely free.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {sections.map((s) => (
              <div key={s.title} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
                <div className="text-4xl mb-4">{s.icon}</div>
                <h2 className="text-2xl font-bold text-zinc-100 mb-2">{s.title}</h2>
                <p className="text-zinc-400 text-sm mb-4">{s.description}</p>
                <ul className="space-y-2">
                  {s.items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-zinc-300">
                      <span className="text-blue-500 mt-0.5 shrink-0">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="text-center mt-16">
            <Link href="/signup" className="inline-flex items-center gap-2 px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition text-lg shadow-lg shadow-blue-600/20">
              Start Trading Free →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
