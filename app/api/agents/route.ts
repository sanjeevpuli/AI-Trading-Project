import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const user = getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const logs = await prisma.executionLog.findMany({
      where: { userId: user.id },
      orderBy: { timestamp: "desc" },
      take: 20,
    });

    // We merge logs to static agent representations since no Agent table exists
    const agents = [
      {
        id: "market-analysis",
        name: "Market Analysis Agent",
        status: "ANALYZING",
        health: "HEALTHY",
        activity: logs.filter(l => l.level === "MARKET").map(l => l.message),
      },
      {
        id: "technical-analysis",
        name: "Technical Analysis Agent",
        status: "EXECUTING",
        health: "HEALTHY",
        activity: logs.filter(l => l.level === "TECHNICAL").map(l => l.message),
      },
      {
        id: "sentiment-analysis",
        name: "Sentiment Analysis Agent",
        status: "ACTIVE",
        health: "HEALTHY",
        activity: logs.filter(l => l.level === "SENTIMENT").map(l => l.message),
      },
      {
        id: "risk-management",
        name: "Risk Management Agent",
        status: "ACTIVE",
        health: "HEALTHY",
        activity: logs.filter(l => l.level === "RISK").map(l => l.message),
      },
      {
        id: "portfolio-allocation",
        name: "Portfolio Allocation Agent",
        status: "ACTIVE",
        health: "HEALTHY",
        activity: logs.filter(l => l.level === "PORTFOLIO").map(l => l.message),
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
