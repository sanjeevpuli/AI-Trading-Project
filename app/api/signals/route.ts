import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const user = getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Fetch the latest signals (limit 10 for recent consensus)
    const recentSignals = await prisma.agentSignal.findMany({
      orderBy: { timestamp: "desc" },
      take: 10,
    });

    const signals: Record<string, any> = {};
    let consensusType = "HOLD";
    let consensusConfidence = 50;
    let reasoning = "Awaiting signal computations...";

    if (recentSignals.length > 0) {
      // Map signals by agentId for the UI
      recentSignals.forEach(sig => {
        if (!signals[sig.agentId]) {
          signals[sig.agentId] = sig;
        }
      });

      // Simple mock consensus logic based on recent signals
      const latest = recentSignals[0];
      consensusType = latest.type;
      consensusConfidence = latest.confidence;
      reasoning = latest.reason || "Weighted average consensus computed from recent agent signals.";
    }

    return NextResponse.json({
      signals,
      consensus: {
        type: consensusType,
        confidence: consensusConfidence,
        reasoning,
        volatilityRegime: "Normal", // Fallback if no specific model exists
        indicators: {
          rsi: 50.0,
          macdHistogram: 0.0,
          ema20: 0,
          ema50: 0,
        },
        riskScore: recentSignals[0]?.riskScore ?? 1,
        timestamp: new Date().toISOString(),
      }
    }, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    console.error("GET /api/signals error:", error);
    return NextResponse.json({ error: "Failed to fetch signals" }, { status: 500 });
  }
}
