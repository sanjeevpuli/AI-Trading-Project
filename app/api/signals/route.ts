import { NextResponse } from "next/server";

export async function GET() {
  const signalsState = {
    consensusSignal: "BUY",
    consensusConfidence: "78%",
    volatilityRegime: "Normal",
    indicators: {
      rsi: 58.42,
      macdHistogram: 0.1245,
      ema20: 67980.20,
      ema50: 67250.40,
    },
    reasoning: "Weighted average consensus BUY signal declared. Bullish EMA20 crossover confirmed. Strong volume profile zones matching social sentiment bias.",
    riskScore: 2,
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(signalsState, {
    headers: {
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
