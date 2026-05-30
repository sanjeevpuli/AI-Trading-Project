import { recentTrades } from "@/lib/mockData";

export default function TradesTable() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-zinc-800">
        <h2 className="text-zinc-100 font-medium text-sm">Recent Trades</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-zinc-500 bg-zinc-900/50 border-b border-zinc-800">
            <tr>
              <th className="px-4 py-3 font-medium">Time</th>
              <th className="px-4 py-3 font-medium">Symbol</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium text-right">Price</th>
              <th className="px-4 py-3 font-medium text-right">Amount</th>
              <th className="px-4 py-3 font-medium text-right">P&L</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {recentTrades.map((trade) => (
              <tr key={trade.id} className="hover:bg-zinc-800/20 transition-colors">
                <td className="px-4 py-3 text-zinc-400">{trade.time}</td>
                <td className="px-4 py-3 font-medium text-zinc-200">{trade.symbol}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    trade.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                  }`}>
                    {trade.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-zinc-300">{trade.price}</td>
                <td className="px-4 py-3 text-right text-zinc-300">{trade.amount}</td>
                <td className={`px-4 py-3 text-right ${
                  trade.pnl.startsWith('+') ? 'text-emerald-500' : trade.pnl === '-' ? 'text-zinc-500' : 'text-rose-500'
                }`}>
                  {trade.pnl}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
