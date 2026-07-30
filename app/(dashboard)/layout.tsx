"use client";

import Sidebar from "@/components/layout/Sidebar";
import Navbar from "@/components/layout/Navbar";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

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
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-zinc-950 text-zinc-400">
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          <span className="text-sm font-medium">Verifying authentication…</span>
        </div>
      </div>
    );
  }

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
              <Link
                key={item.name}
                href={item.path}
                className={`flex flex-col items-center justify-center flex-1 h-full gap-0.5 text-center transition-colors ${
                  isActive ? "text-blue-500 font-bold" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-[10px] tracking-tight">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
