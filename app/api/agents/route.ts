import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const user = getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const recentSignals = await prisma.agentSignal.findMany({
      orderBy: { timestamp: "desc" },
      take: 50,
    });

    const getAgentActivity = (agentId: string) => 
      recentSignals.filter(s => s.agentId === agentId).map(s => `[Auto Signal: ${s.type}] ${s.reason}`);

    // We merge logs to static agent representations since no Agent table exists
    const agents = [
      {
        id: "market-analysis",
        name: "Market Analysis Agent",
        status: "ANALYZING",
        health: "HEALTHY",
        activity: getAgentActivity("market-analysis"),
      },
      {
        id: "technical-analysis",
        name: "Technical Analysis Agent",
        status: "EXECUTING",
        health: "HEALTHY",
        activity: getAgentActivity("technical-analysis"),
      },
      {
        id: "sentiment-analysis",
        name: "Sentiment Analysis Agent",
        status: "ACTIVE",
        health: "HEALTHY",
        activity: getAgentActivity("sentiment-analysis"),
      },
      {
        id: "risk-management",
        name: "Risk Management Agent",
        status: "ACTIVE",
        health: "HEALTHY",
        activity: getAgentActivity("risk-management"),
      },
      {
        id: "portfolio-allocation",
        name: "Portfolio Allocation Agent",
        status: "ACTIVE",
        health: "HEALTHY",
        activity: getAgentActivity("portfolio-allocation"),
      }
    ];

    return NextResponse.json({
      systemStatus: "All agents operational",
      activeAgentsCount: 5,
      agents,
    }, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("GET /api/agents error:", error);
    return NextResponse.json({ error: "Failed to fetch agents data" }, { status: 500 });
  }
}
