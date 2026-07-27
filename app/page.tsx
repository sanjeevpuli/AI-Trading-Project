import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "QuantAI — AI-Powered Paper Trading Platform",
  description:
    "Trade smarter with QuantAI. AI agents, real-time Binance data, advanced backtesting, and comprehensive portfolio analytics. Start with $100,000 virtual capital.",
};

const features = [
  {
    icon: "🤖",
    title: "5 AI Agents",
    description:
      "Technical, Sentiment, Risk, Portfolio & Consensus agents work together 24/7 to generate high-confidence trade signals.",
  },
  {
    icon: "📡",
    title: "Live Binance Feed",
    description:
      "Real-time WebSocket streams from Binance for BTC, ETH, SOL and more. Sub-second price updates drive your analysis.",
  },
  {
    icon: "📈",
    title: "Paper Trading Engine",
    description:
      "Execute simulated orders with real market prices. Stop-loss, take-profit, and auto-liquidation fully supported.",
  },
  {
    icon: "🧪",
    title: "Strategy Backtesting",
    description:
      "Test any strategy against historical data. Get full performance metrics including Sharpe Ratio, Max Drawdown & Win Rate.",
  },
  {
    icon: "💼",
    title: "Portfolio Analytics",
    description:
      "Track your equity curve, allocation, risk exposure, and performance over time with interactive charts.",
  },
  {
    icon: "🛡️",
    title: "Risk Management",
    description:
      "Built-in margin liquidation engine, position sizing limits, and Value at Risk calculations protect your capital.",
  },
];

const stats = [
  { value: "5", label: "AI Agents" },
  { value: "$100K", label: "Starting Capital" },
  { value: "Real-time", label: "Binance Feed" },
  { value: "0%", label: "Commission" },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-blue-500 text-xl">◆</span>
            <span className="text-xl font-bold text-zinc-100">QuantAI</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
            <Link href="/features" className="hover:text-zinc-100 transition">Features</Link>
            <Link href="/about" className="hover:text-zinc-100 transition">About</Link>
            <Link href="/contact" className="hover:text-zinc-100 transition">Contact</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-zinc-400 hover:text-zinc-100 transition px-3 py-1.5"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 px-4 sm:px-6 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-blue-600/8 rounded-full blur-3xl" />
          <div className="absolute top-20 left-1/4 w-[400px] h-[300px] bg-indigo-600/6 rounded-full blur-3xl" />
          <div className="absolute top-20 right-1/4 w-[400px] h-[300px] bg-cyan-600/6 rounded-full blur-3xl" />
        </div>

        {/* Grid overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 text-blue-400 text-sm font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Live Binance WebSocket Feed Active
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight mb-6">
            <span className="text-zinc-100">AI Trading.</span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
              Zero Risk.
            </span>
          </h1>

          <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Five AI agents analyze markets in real-time, generate consensus signals, and execute paper trades — so you can build strategy intuition without risking a single dollar.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/signup"
              className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition text-lg shadow-lg shadow-blue-600/20"
            >
              Start Trading Free →
            </Link>
            <Link
              href="/login"
              className="px-8 py-4 bg-zinc-900 hover:bg-zinc-800 text-zinc-100 font-semibold rounded-xl border border-zinc-700 transition text-lg"
            >
              Sign In
            </Link>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto mt-20">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl font-extrabold text-zinc-100">{s.value}</div>
                <div className="text-sm text-zinc-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-4 sm:px-6 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-zinc-100 mb-4">
              Everything you need to trade smarter
            </h2>
            <p className="text-zinc-400 text-lg max-w-xl mx-auto">
              A professional-grade trading platform powered by real AI — completely free to use.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="group bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 hover:bg-zinc-800/60 transition-all duration-200"
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-semibold text-zinc-100 mb-2">{f.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-blue-600/8 rounded-full blur-3xl" />
        </div>
        <div className="max-w-2xl mx-auto text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-zinc-100 mb-4">
            Ready to start trading?
          </h2>
          <p className="text-zinc-400 text-lg mb-8">
            Join QuantAI today. Create a free account, get $100,000 in virtual capital, and start building winning strategies.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition text-lg shadow-lg shadow-blue-600/20"
          >
            Get Started Free →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800 py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-zinc-500">
          <div className="flex items-center gap-2">
            <span className="text-blue-500">◆</span>
            <span className="font-bold text-zinc-400">QuantAI</span>
            <span className="ml-2">© 2026 — AI-Powered Paper Trading</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/features" className="hover:text-zinc-300 transition">Features</Link>
            <Link href="/about" className="hover:text-zinc-300 transition">About</Link>
            <Link href="/contact" className="hover:text-zinc-300 transition">Contact</Link>
            <Link href="/login" className="hover:text-zinc-300 transition">Sign In</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}