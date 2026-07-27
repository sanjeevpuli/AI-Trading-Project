import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — QuantAI Trading Platform",
  description: "Learn about the QuantAI platform — built for traders who want to learn algorithmic trading without financial risk.",
};

const team = [
  { initial: "Q", name: "QuantAI Engine", role: "AI Consensus System", color: "bg-blue-600" },
  { initial: "T", name: "Technical Agent", role: "Chart Analysis & Indicators", color: "bg-indigo-600" },
  { initial: "S", name: "Sentiment Agent", role: "News & Social Analytics", color: "bg-purple-600" },
  { initial: "R", name: "Risk Agent", role: "Capital Protection", color: "bg-emerald-600" },
  { initial: "P", name: "Portfolio Agent", role: "Allocation Optimizer", color: "bg-amber-600" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-blue-500 text-xl">◆</span>
            <span className="text-xl font-bold text-zinc-100">QuantAI</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
            <Link href="/features" className="hover:text-zinc-100 transition">Features</Link>
            <Link href="/about" className="text-zinc-100 font-medium">About</Link>
            <Link href="/contact" className="hover:text-zinc-100 transition">Contact</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-zinc-400 hover:text-zinc-100 transition px-3 py-1.5">Sign In</Link>
            <Link href="/signup" className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition">Get Started</Link>
          </div>
        </div>
      </nav>

      <main className="pt-28 pb-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-zinc-100 mb-4">About QuantAI</h1>
            <p className="text-zinc-400 text-xl max-w-2xl mx-auto">
              Built for traders who want to master algorithmic trading — without putting real capital at risk.
            </p>
          </div>

          <div className="space-y-12">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-zinc-100 mb-4">Our Mission</h2>
              <p className="text-zinc-400 leading-relaxed">
                QuantAI was built to democratize algorithmic trading education. Traditional trading platforms either require real capital (risking financial loss) or provide unrealistic simulations. QuantAI bridges this gap by connecting live Binance WebSocket feeds to a sophisticated paper trading engine powered by real AI agents.
              </p>
              <p className="text-zinc-400 leading-relaxed mt-4">
                Every price you see is real. Every trade you execute reflects actual market conditions. The only difference? Your capital is virtual — giving you the freedom to experiment, learn, and build confidence without financial risk.
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-zinc-100 mb-6">The AI Agent Team</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {team.map((agent) => (
                  <div key={agent.name} className="flex items-center gap-4 p-4 bg-zinc-800/50 rounded-xl border border-zinc-700/50">
                    <div className={`w-10 h-10 rounded-full ${agent.color} flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
                      {agent.initial}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-zinc-100">{agent.name}</div>
                      <div className="text-xs text-zinc-500">{agent.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
              <h2 className="text-2xl font-bold text-zinc-100 mb-4">Technology Stack</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {["Next.js 16", "React 19", "TypeScript", "Tailwind CSS v4", "Zustand", "Prisma ORM", "JWT Auth", "Binance API"].map((tech) => (
                  <div key={tech} className="text-center py-3 px-4 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-sm font-medium text-zinc-300">
                    {tech}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link href="/signup" className="inline-flex items-center gap-2 px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition text-lg">
              Start Trading Free →
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
