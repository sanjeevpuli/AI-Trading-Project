import { prisma } from '@/lib/db';
import type { Portfolio, Trade, Position } from '@/lib/types/trading';

/**
 * Synchronize portfolio updates to the database.
 * Called whenever the Zustand store's portfolio data changes.
 */
export async function syncPortfolio(portfolio: Portfolio) {
  try {
    await prisma.portfolio.update({
      where: { id: portfolio.id },
      data: {
        totalValue: portfolio.totalValue,
        cash: portfolio.cash,
        unrealizedPnL: portfolio.unrealizedPnL,
        realizedPnL: portfolio.realizedPnL,
        winRate: portfolio.winRate,
        sharpeRatio: portfolio.sharpeRatio,
        maxDrawdown: portfolio.maxDrawdown,
        leverage: portfolio.leverage,
        exposure: portfolio.exposure,
        netBeta: portfolio.netBeta,
        valueAtRisk: portfolio.valueAtRisk,
        equityCurve: portfolio.equityCurve,
        // UpdatedAt will be set automatically by Prisma @updatedAt field
      },
    });
  } catch (error) {
    console.error('Failed to sync portfolio:', error);
  }
}

/**
 * Persist a new trade record.
 */
export async function syncTrade(trade: Trade) {
  try {
    await prisma.trade.create({
      data: {
        id: trade.id,
        userId: trade.userId || "",
        symbol: trade.symbol,
        type: trade.type,
        entryPrice: trade.entryPrice,
        exitPrice: trade.exitPrice,
        amount: trade.amount,
        pnl: trade.pnl,
        pnlPercentage: trade.pnlPercentage,
        entryTime: trade.entryTime,
        exitTime: trade.exitTime,
        exitReason: trade.exitReason,
        fee: trade.fee ?? 0,
        slippage: trade.slippage ?? 0,
      },
    });
  } catch (error) {
    console.error('Failed to sync trade:', error);
  }
}

/**
 * Synchronize a position (open or updated).
 */
export async function syncPosition(position: Position) {
  try {
    // Upsert based on id – create if not exists, otherwise update
    await prisma.position.upsert({
      where: { id: position.id },
      create: {
        id: position.id,
        userId: position.userId || "",
        symbol: position.symbol,
        type: position.type,
        entryPrice: position.entryPrice,
        currentPrice: position.currentPrice,
        amount: position.amount,
        stopLoss: position.stopLoss ?? null,
        takeProfit: position.takeProfit ?? null,
        timestamp: position.timestamp,
        pnl: position.pnl ?? 0,
        pnlPercentage: position.pnlPercentage ?? 0,
      },
      update: {
        currentPrice: position.currentPrice,
        stopLoss: position.stopLoss ?? null,
        takeProfit: position.takeProfit ?? null,
        pnl: position.pnl ?? 0,
        pnlPercentage: position.pnlPercentage ?? 0,
        timestamp: position.timestamp,
      },
    });
  } catch (error) {
    console.error('Failed to sync position:', error);
  }
}
