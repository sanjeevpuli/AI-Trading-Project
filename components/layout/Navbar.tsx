"use client";

export default function Navbar() {
  return (
    <nav className="h-16 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center lg:hidden">
        <span className="text-lg font-bold text-zinc-100 flex items-center gap-2">
          <span className="text-blue-500">◆</span> QuantAI
        </span>
      </div>
      
      <div className="hidden lg:flex items-center gap-4 flex-1">
        <div className="relative w-96">
          <input
            type="text"
            placeholder="Search symbols, agents, or trades..."
            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-zinc-700 focus:border-zinc-700 placeholder:text-zinc-500"
          />
          <div className="absolute left-3 top-2.5 text-zinc-500">
            🔍
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="text-zinc-400 hover:text-zinc-100 p-2">
          🔔
        </button>
        <div className="h-8 w-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-sm font-medium text-zinc-300">
          U
        </div>
      </div>
    </nav>
  );
}
