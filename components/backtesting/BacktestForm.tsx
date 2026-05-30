import { useState } from "react";
import { AVAILABLE_STRATEGIES } from "@/lib/strategies";

export interface BacktestParams {
  symbol: string;
  interval: string;
  strategyId: string;
  startDate: string;
  endDate: string;
}

interface BacktestFormProps {
  onRunBacktest: (params: BacktestParams) => void;
  isLoading: boolean;
}

export default function BacktestForm({ onRunBacktest, isLoading }: BacktestFormProps) {
  const [params, setParams] = useState<BacktestParams>({
    symbol: "BTCUSDT",
    interval: "1d",
    strategyId: "ema_crossover",
    startDate: new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString().split('T')[0], // 1 year ago
    endDate: new Date().toISOString().split('T')[0] // today
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onRunBacktest(params);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex flex-col gap-4">
      <h2 className="text-zinc-100 font-medium text-lg">Strategy Configuration</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-zinc-400">Asset</label>
          <select 
            value={params.symbol}
            onChange={e => setParams({...params, symbol: e.target.value})}
            className="bg-zinc-950 border border-zinc-800 text-zinc-100 rounded p-2 text-sm focus:outline-none focus:border-zinc-600"
          >
            <option value="BTCUSDT">BTC/USDT</option>
            <option value="ETHUSDT">ETH/USDT</option>
            <option value="SOLUSDT">SOL/USDT</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-zinc-400">Timeframe</label>
          <select 
            value={params.interval}
            onChange={e => setParams({...params, interval: e.target.value})}
            className="bg-zinc-950 border border-zinc-800 text-zinc-100 rounded p-2 text-sm focus:outline-none focus:border-zinc-600"
          >
            <option value="15m">15m</option>
            <option value="1h">1h</option>
            <option value="4h">4h</option>
            <option value="1d">1D</option>
            <option value="1w">1W</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5 lg:col-span-1">
          <label className="text-sm text-zinc-400">Strategy</label>
          <select 
            value={params.strategyId}
            onChange={e => setParams({...params, strategyId: e.target.value})}
            className="bg-zinc-950 border border-zinc-800 text-zinc-100 rounded p-2 text-sm focus:outline-none focus:border-zinc-600"
          >
            {Object.values(AVAILABLE_STRATEGIES).map(strategy => (
              <option key={strategy.id} value={strategy.id}>{strategy.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-zinc-400">Start Date</label>
          <input 
            type="date" 
            value={params.startDate}
            onChange={e => setParams({...params, startDate: e.target.value})}
            className="bg-zinc-950 border border-zinc-800 text-zinc-100 rounded p-2 text-sm focus:outline-none focus:border-zinc-600 [color-scheme:dark]"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm text-zinc-400">End Date</label>
          <input 
            type="date" 
            value={params.endDate}
            onChange={e => setParams({...params, endDate: e.target.value})}
            className="bg-zinc-950 border border-zinc-800 text-zinc-100 rounded p-2 text-sm focus:outline-none focus:border-zinc-600 [color-scheme:dark]"
          />
        </div>
      </div>

      <div className="flex justify-end mt-2">
        <button 
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading ? (
            <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
          ) : "▶"}
          {isLoading ? "Running..." : "Run Backtest"}
        </button>
      </div>
    </form>
  );
}
