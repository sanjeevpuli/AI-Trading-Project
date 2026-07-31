import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const user = getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") || "json";

  try {
    const metrics = await prisma.portfolioMetrics.findMany({
      where: { userId: user.id },
      orderBy: { timestamp: "asc" },
    });

    if (format === "csv") {
      const csvLines = [
        "Date,TotalValue,Cash,RealizedPnL,UnrealizedPnL,Drawdown"
      ];
      
      metrics.forEach(m => {
        csvLines.push(
          `${m.timestamp.toISOString()},${m.totalValue},${m.cash},${m.realizedPnL},${m.unrealizedPnL},${m.drawDown}`
        );
      });

      return new NextResponse(csvLines.join("\n"), {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": 'attachment; filename="portfolio_history.csv"',
        }
      });
    }

    // Default to JSON
    return NextResponse.json(metrics, {
      headers: {
        "Content-Disposition": 'attachment; filename="portfolio_history.json"',
      }
    });

  } catch (error) {
    console.error("GET /api/portfolio/export error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
