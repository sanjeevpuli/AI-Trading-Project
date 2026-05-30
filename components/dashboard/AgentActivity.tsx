import { agentActivities } from "@/lib/mockData";

export default function AgentActivity() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg flex flex-col h-[400px]">
      <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
        <h2 className="text-zinc-100 font-medium text-sm">Agent Activity Log</h2>
        <span className="flex items-center gap-1.5 text-xs text-zinc-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Live
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {agentActivities.map((activity) => (
          <div key={activity.id} className="flex gap-3 text-sm">
            <div className="mt-0.5">
              {activity.type === 'success' && <div className="text-emerald-500">✓</div>}
              {activity.type === 'warning' && <div className="text-amber-500">!</div>}
              {activity.type === 'info' && <div className="text-blue-500">i</div>}
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-medium text-zinc-200">{activity.agent}</span>
                <span className="text-xs text-zinc-500">{activity.time}</span>
              </div>
              <p className="text-zinc-400 mt-0.5">{activity.action}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
