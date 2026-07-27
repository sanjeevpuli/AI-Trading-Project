"use client";

import Link from "next/link";
import UserMenu from "./UserMenu";
import MarketTicker from "./MarketTicker";

export default function Navbar() {
  return (
    <nav className="h-16 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center lg:hidden">
        <span className="text-lg font-bold text-zinc-100 flex items-center gap-2">
          <span className="text-blue-500">◆</span> QuantAI
        </span>
      </div>
      
      <div className="hidden lg:flex items-center gap-4 flex-1">
        <div className="relative w-80">
          <input
            type="text"
            placeholder="Search symbols, agents, or trades..."
            className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 text-sm rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-zinc-700 focus:border-zinc-700 placeholder:text-zinc-500"
          />
          <div className="absolute left-3 top-2.5 text-zinc-500">
            🔍
          </div>
        </div>
        <div className="flex-1 flex justify-center">
          <MarketTicker />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Link href="/notifications" className="text-zinc-400 hover:text-zinc-100 p-2 block">
          🔔
        </Link>
        <UserMenu />
      </div>
    </nav>
  );
}
