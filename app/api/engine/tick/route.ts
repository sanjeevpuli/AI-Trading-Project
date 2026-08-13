import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { updateAuthoritativePrice, getAuthoritativePrices } from "@/lib/services/marketDataCache";
import { evaluatePendingOrders } from "@/lib/services/tradingEngine";
import { placeOrder, closePosition } from "@/lib/services/backendTradingEngine";
import { checkMarginLiquidation } from "@/lib/services/riskManager";
import { coordinateAgentConsensus } from "@/lib/services/agentCoordinator";
import { calculatePortfolioStats } from "@/lib/services/portfolioService";

export async function POST(request: NextRequest) {
  const user = getSessionUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { symbol, price, isKlineClosed, historyPrices } = body;

    if (!symbol || price === undefined) {
      return NextResponse.json({ error: "Missing symbol or price" }, { status: 400 });
    }

    // 1. Update our backend cache with validation
    updateAuthoritativePrice(symbol, price);

    // Get current portfolio and active positions
    const portfolio = await prisma.portfolio.findUnique({ where: { userId: user.id } });
    if (!portfolio) {
      return NextResponse.json({ ok: true, msg: "No portfolio found" });
    }

    const positions = await prisma.position.findMany({ where: { userId: user.id } });
    const pendingOrders = await prisma.order.findMany({ 
      where: { userId: user.id, status: "PENDING" } 
    });

    // 2. Evaluate Auto Limits (Stop Loss / Take Profit)
    // We execute these sequentially to avoid transaction conflicts
    const positionsToClose: { id: string, trigger: "STOP_LOSS" | "TAKE_PROFIT" | "LIQUIDATION" }[] = [];
    
    let currentBalance = portfolio.cash;
    let evaluatedPositions = positions.map(pos => {
      // Map Prisma Position to our internal type
      const mappedPos = {
        ...pos,
        type: pos.type as "LONG" | "SHORT"
      };

      if (pos.symbol === symbol) {
        let trigger: "STOP_LOSS" | "TAKE_PROFIT" | null = null;
        if (pos.type === "LONG") {
          if (pos.stopLoss && price <= pos.stopLoss) trigger = "STOP_LOSS";
          if (pos.takeProfit && price >= pos.takeProfit) trigger = "TAKE_PROFIT";
        } else {
          if (pos.stopLoss && price >= pos.stopLoss) trigger = "STOP_LOSS";
          if (pos.takeProfit && price <= pos.takeProfit) trigger = "TAKE_PROFIT";
        }

        if (trigger) {
          positionsToClose.push({ id: pos.id, trigger });
          return null; // Will be removed
        }
      }
      return mappedPos;
    }).filter(Boolean) as any[];

    // 3. Margin Liquidation Check
    // Get all prices for active positions to check margin
    const symbolsToCheck = Array.from(new Set(evaluatedPositions.map(p => p.symbol)));
    const authoritativePrices = await getAuthoritativePrices(symbolsToCheck);
    
    // Update current prices for margin check
    evaluatedPositions = evaluatedPositions.map(pos => ({
      ...pos,
      currentPrice: authoritativePrices[pos.symbol] || pos.currentPrice,
    }));

    const liquidationCheck = checkMarginLiquidation(currentBalance, evaluatedPositions);
    if (liquidationCheck.liquidateAll) {
      evaluatedPositions.forEach(pos => {
        positionsToClose.push({ id: pos.id, trigger: "LIQUIDATION" });
      });
      evaluatedPositions = [];
      console.warn(`[Engine] User ${user.id} LIQUIDATION: ${liquidationCheck.message}`);
    }

    // Process all closings
    for (const action of positionsToClose) {
      try {
        await closePosition(user.id, action.id, price, action.trigger);
      } catch (err) {
        console.error(`[Engine] Failed to close position ${action.id}:`, err);
      }
    }

    // 4. Evaluate Pending Limit Orders
    // We pass our backend's authoritative prices here
    const pricesForOrders: Record<string, number> = { ...authoritativePrices, [symbol]: price };
    
    // Map Prisma orders to internal type 
    const mappedOrders = pendingOrders.map(o => ({
      ...o,
      type: o.type as "LONG" | "SHORT",
      orderType: o.orderType as "MARKET" | "LIMIT",
      status: o.status as "PENDING" | "FILLED" | "CANCELED",
      stopLoss: o.stopLoss ?? undefined,
      takeProfit: o.takeProfit ?? undefined,
      createdAt: o.createdAt.toISOString(),
      updatedAt: o.updatedAt.toISOString()
    }));

    const triggeredOrders = evaluatePendingOrders(mappedOrders, pricesForOrders);
    for (const order of triggeredOrders) {
      try {
        // Cancel the pending order first
        await prisma.order.delete({ where: { id: order.id } });
        // Execute market order at the trigger price
        await placeOrder(user.id, {
          symbol: order.symbol,
          type: order.type,
          orderType: "MARKET",
          amount: order.amount,
          price: pricesForOrders[order.symbol],
          stopLoss: order.stopLoss ?? undefined,
          takeProfit: order.takeProfit ?? undefined,
        });
      } catch (err) {
        console.error(`[Engine] Failed to execute pending order ${order.id}:`, err);
      }
    }

    // 5. AI Agent Consensus (only on Kline Close)
    let aiTriggered = false;
    if (isKlineClosed && historyPrices && historyPrices.length > 0) {
      // Need history to calculate stats
      const history = await prisma.trade.findMany({ where: { userId: user.id } });
      const metricsHistory = await prisma.portfolioMetrics.findMany({ 
        where: { userId: user.id },
        orderBy: { timestamp: "asc" },
        take: 100
      });

      // Recalculate stats using latest evaluatedPositions and cash
      const freshPortfolio = await prisma.portfolio.findUnique({ where: { userId: user.id } });
      const freshPositions = await prisma.position.findMany({ where: { userId: user.id } });
      
      const mappedFreshPositions = freshPositions.map(pos => ({
        ...pos,
        type: pos.type as "LONG" | "SHORT",
        stopLoss: pos.stopLoss ?? undefined,
        takeProfit: pos.takeProfit ?? undefined,
        timestamp: pos.timestamp.toISOString()
      }));

      const mappedHistory = history.map(t => ({
        ...t,
        type: t.type as "LONG" | "SHORT",
        exitReason: t.exitReason as "MANUAL" | "STOP_LOSS" | "TAKE_PROFIT" | "LIQUIDATION",
        entryTime: t.entryTime.toISOString(),
        exitTime: t.exitTime.toISOString()
      }));

      const mappedMetrics = metricsHistory.map(m => ({
        ...m,
        timestamp: m.timestamp.toISOString()
      }));

      const stats = calculatePortfolioStats(
        freshPortfolio?.cash || 100000, 
        mappedFreshPositions, 
        mappedHistory,
        mappedMetrics
      );
      
      const decision = coordinateAgentConsensus(symbol, historyPrices, stats.maxDrawdown, stats.exposure);

      // Save the signal and agents' states to the DB so the frontend can read them!
      // First, update agents
      const agentIds = [
        "market-analysis", "technical-analysis", "sentiment-analysis", 
        "risk-management", "portfolio-allocation", "consensus-coordinator", "execution-agent"
      ];
      
      // Upsert signals for the frontend to consume
      for (const [agentId, sig] of Object.entries(decision.agentSignals)) {
        if (!agentIds.includes(agentId)) continue;
        
        await prisma.agentSignal.create({
          data: {
            agentId,
            symbol,
            type: (sig as any).type,
            confidence: (sig as any).confidence,
            reason: (sig as any).reason,
            riskScore: (sig as any).riskScore || 50,
          }
        });
      }

      // In a real app we'd also run `evaluateExecution` here to place the order, 
      // but for this phase we just calculate the signal and persist it.
      // (evaluateExecution logic is currently in the frontend and would need to be migrated to the backend fully, 
      // but coordinateAgentConsensus covers the core AI part.)

      aiTriggered = true;
    }

    return NextResponse.json({ ok: true, limitsChecked: true, aiTriggered });
  } catch (error: any) {
    console.error("POST /api/engine/tick error:", error);
    return NextResponse.json({ ok: false, error: String(error.message || error) }, { status: 500 });
  }
}
