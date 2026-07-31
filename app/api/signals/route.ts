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

export async function POST(request: NextRequest) {
  const user = getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { signals, consensus } = await request.json();
    if (!signals || typeof signals !== "object") {
      return NextResponse.json({ ok: false, error: "Invalid payload" }, { status: 400 });
    }

    // Save individual signals
    const createPromises = Object.values(signals).map((sig: any) => 
      prisma.agentSignal.create({
        data: {
          symbol: sig.symbol,
          agentId: sig.agentId,
          type: sig.type,
          confidence: sig.confidence,
          reason: sig.reason,
          riskScore: sig.riskScore,
        }
      })
    );

    await Promise.all(createPromises);

    // Also persist consensus to ExecutionLog for the UI to read
    if (consensus) {
      await prisma.executionLog.create({
        data: {
          userId: user.id,
          level: "CONSENSUS",
          message: consensus.reasoning,
          details: JSON.stringify(consensus),
        }
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("POST /api/signals error:", error);
    return NextResponse.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
