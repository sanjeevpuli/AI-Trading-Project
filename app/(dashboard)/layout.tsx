"use client";

import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const mobileNavItems = [
  { name: "Dashboard", path: "/dashboard", icon: "📊" },
  { name: "Trading", path: "/trading", icon: "📈" },
  { name: "Agents", path: "/agents", icon: "🤖" },
  { name: "Portfolio", path: "/portfolio", icon: "💼" },
  { name: "Backtest", path: "/backtesting", icon: "🧪" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950 text-zinc-100 font-sans flex-col">
      <div className="flex-1 flex overflow-hidden min-h-0">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar />
          <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-zinc-950">
            {children}
          </main>
        </div>
      </div>
      
      {/* Mobile Bottom Navigation */}
      {mounted && (
        <nav className="lg:hidden flex items-center justify-around h-16 border-t border-zinc-800 bg-zinc-950/90 backdrop-blur-md px-2 z-50 shrink-0">
          {mobileNavItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <button
                key={item.name}
                onClick={() => router.push(item.path)}
                className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 text-center transition-colors cursor-pointer ${
                  isActive ? "text-blue-500 font-bold" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-[10px] tracking-tight">{item.name}</span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}
