"use client";

import BacktestDashboard from "@/components/backtesting/BacktestDashboard";

export default function BacktestingPage() {
  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto">
      <BacktestDashboard />
    </div>
  );
}
