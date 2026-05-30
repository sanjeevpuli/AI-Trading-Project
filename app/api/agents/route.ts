import { NextResponse } from "next/server";

export async function GET() {
  const agentsState = {
    systemStatus: "All agents operational",
    activeAgentsCount: 5,
    agents: [
      {
        id: "market-analysis",
        name: "Market Analysis Agent",
        role: "Fundamental & Volatility parsing",
        status: "ANALYZING",
        health: "HEALTHY",
        uptime: "99.98%",
        latency: "18ms",
      },
      {
        id: "technical-analysis",
        name: "Technical Analysis Agent",
        role: "EMA, RSI, MACD computing",
        status: "EXECUTING",
        health: "HEALTHY",
        uptime: "100.0%",
        latency: "8ms",
      },
      {
        id: "sentiment-analysis",
        name: "Sentiment Analysis Agent",
        role: "Google news & social trends scanner",
        status: "ACTIVE",
        health: "HEALTHY",
        uptime: "99.92%",
        latency: "35ms",
      },
      {
        id: "risk-management",
        name: "Risk Management Agent",
        role: "Stop level constraints advisor",
        status: "ACTIVE",
        health: "HEALTHY",
        uptime: "100.0%",
        latency: "5ms",
      },
      {
        id: "portfolio-allocation",
        name: "Portfolio Allocation Agent",
        role: "Weight distribution advisor",
        status: "ACTIVE",
        health: "HEALTHY",
        uptime: "99.95%",
        latency: "22ms",
      },
    ],
  };

  return NextResponse.json(agentsState, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
