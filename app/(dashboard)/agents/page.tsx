"use client";

import AgentsDashboard from "@/components/agents/AgentsDashboard";

export default function AgentsPage() {
  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto">
      <AgentsDashboard />
    </div>
  );
}
