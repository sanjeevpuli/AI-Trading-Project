import { prisma } from "@/lib/db";
import { OrderType, PositionType, OrderStatus, ExitReason, Prisma } from "@prisma/client";
import { calculatePositionPnL } from "../tradingEngine";
import { getAuthoritativePrices, marketCache } from "./marketDataCache";

const TAKER_FEE_PCT = 0.04;

export function calculateSlippage(price: number): { percentage: number; amount: number } {
  const percentage = 0.02 + Math.random() * 0.06;
  const amount = (price * percentage) / 100;
  return { percentage, amount };
}

export async function placeOrder(userId: string, orderData: {
  symbol: string;
  type: PositionType;
  orderType: OrderType;
  amount: number;
  price?: number; // Make price optional for MARKET orders
  stopLoss?: number;
  takeProfit?: number;
}) {
  let executionMarketPrice = 0;
  let limitPrice = orderData.price;

  if (orderData.orderType === "MARKET") {
    // 1a. Validate freshness
    const prices = await getAuthoritativePrices([orderData.symbol]);
    const price = prices[orderData.symbol];
    if (!price) {
      throw new Error(`Failed to fetch authoritative market price for ${orderData.symbol}. Order rejected.`);
    }
    const now = Date.now();
    if (now - marketCache.lastUpdated > 10000) {
      throw new Error(`Market price for ${orderData.symbol} is too stale (>10s). Order rejected.`);
    }
    executionMarketPrice = price;
  } else {
    if (limitPrice === undefined) {
      throw new Error("LIMIT orders require a trigger price.");
    }
    executionMarketPrice = limitPrice;
  }

  return await prisma.$transaction(async (tx) => {
    // 1. Get user's portfolio
    const portfolio = await tx.portfolio.findUnique({
      where: { userId }
    });
    
    if (!portfolio) throw new Error("Portfolio not found");

    if (orderData.orderType === "LIMIT") {
      // Create pending order
      const order = await tx.order.create({
        data: {
          userId,
          symbol: orderData.symbol,
          type: orderData.type,
          orderType: orderData.orderType,
          status: "PENDING",
          amount: orderData.amount,
          price: limitPrice!,
          stopLoss: orderData.stopLoss,
          takeProfit: orderData.takeProfit,
        }
      });
      return { success: true, order, portfolio };
    }

    // 2. Execute Market Order
    const { amount: slippageAmount } = calculateSlippage(executionMarketPrice);
    const executionPrice = orderData.type === "LONG" 
      ? executionMarketPrice + slippageAmount 
      : executionMarketPrice - slippageAmount;

    const positionSizeUsd = orderData.amount * executionPrice;
    const fee = (positionSizeUsd * TAKER_FEE_PCT) / 100;
    const totalCost = positionSizeUsd + fee;

    if (portfolio.cash < totalCost) {
      throw new Error(`Insufficient cash. Required: $${totalCost.toFixed(2)}, Available: $${portfolio.cash.toFixed(2)}`);
    }

    // 3. Update or Create Position
    const existingPosition = await tx.position.findFirst({
      where: { userId, symbol: orderData.symbol }
    });

    let position;
    if (existingPosition) {
      if (existingPosition.type !== orderData.type) {
        throw new Error("Opposing position already exists. Close it first.");
      }
      const newAmount = existingPosition.amount + orderData.amount;
      const newCostBasis = (existingPosition.entryPrice * existingPosition.amount) + (executionPrice * orderData.amount);
      const newEntryPrice = newCostBasis / newAmount;
      
      position = await tx.position.update({
        where: { id: existingPosition.id },
        data: {
          amount: newAmount,
          entryPrice: newEntryPrice,
          currentPrice: executionMarketPrice,
          stopLoss: orderData.stopLoss ?? existingPosition.stopLoss,
          takeProfit: orderData.takeProfit ?? existingPosition.takeProfit,
        }
      });
    } else {
      position = await tx.position.create({
        data: {
          userId,
          symbol: orderData.symbol,
          type: orderData.type,
          entryPrice: executionPrice,
          currentPrice: executionMarketPrice,
          amount: orderData.amount,
          stopLoss: orderData.stopLoss,
          takeProfit: orderData.takeProfit,
        }
      });
    }

    // 4. Record Trade History
    const trade = await tx.trade.create({
      data: {
        userId,
        symbol: orderData.symbol,
        type: orderData.type,
        entryPrice: executionPrice,
        exitPrice: executionPrice,
        amount: orderData.amount,
        pnl: 0,
        pnlPercentage: 0,
        entryTime: new Date(),
        exitTime: new Date(),
        exitReason: "MANUAL",
        fee,
        slippage: slippageAmount
      }
    });

    // 5. Update Portfolio Cash
    const newCash = portfolio.cash - totalCost;
    const updatedPortfolio = await tx.portfolio.update({
      where: { id: portfolio.id },
      data: { 
        cash: newCash,
        totalValue: newCash + position.amount * position.currentPrice // naive
      }
    });

    // 6. Mark Order as Filled
    const order = await tx.order.create({
      data: {
        userId,
        symbol: orderData.symbol,
        type: orderData.type,
        orderType: orderData.orderType,
        status: "FILLED",
        amount: orderData.amount,
        price: executionPrice,
        stopLoss: orderData.stopLoss,
        takeProfit: orderData.takeProfit,
      }
    });

    return { success: true, order, position, trade, portfolio: updatedPortfolio };
  }, { maxWait: 20000, timeout: 20000, isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}

export async function closePosition(userId: string, positionId: string, exitPrice: number | undefined, reason: ExitReason) {
  return await prisma.$transaction(async (tx) => {
    const position = await tx.position.findUnique({
      where: { id: positionId }
    });
    if (!position || position.userId !== userId) throw new Error("Position not found");

    const portfolio = await tx.portfolio.findUnique({
      where: { userId }
    });
    if (!portfolio) throw new Error("Portfolio not found");

    let executionExitPrice = exitPrice;

    if (executionExitPrice === undefined) {
      // 1a. Validate freshness
      const prices = await getAuthoritativePrices([position.symbol]);
      const fetchedPrice = prices[position.symbol];
      if (!fetchedPrice) {
        throw new Error(`Failed to fetch authoritative market price for ${position.symbol}. Close rejected.`);
      }
      const now = Date.now();
      if (now - marketCache.lastUpdated > 10000) {
        throw new Error(`Market price for ${position.symbol} is too stale (>10s). Close rejected.`);
      }
      executionExitPrice = fetchedPrice;
    }

    const { amount: exitSlippageAmount } = calculateSlippage(executionExitPrice);
    const finalExitPrice = position.type === "LONG" ? executionExitPrice - exitSlippageAmount : executionExitPrice + exitSlippageAmount;

    const exitPositionSizeUsd = position.amount * finalExitPrice;
    const fee = (exitPositionSizeUsd * TAKER_FEE_PCT) / 100;

    const { pnl, pnlPercentage } = calculatePositionPnL(position.type, position.entryPrice, finalExitPrice, position.amount);
    const costBasis = position.entryPrice * position.amount;
    const cashReturn = costBasis + pnl - fee;

    const trade = await tx.trade.create({
      data: {
        userId,
        symbol: position.symbol,
        type: position.type,
        entryPrice: position.entryPrice,
        exitPrice: finalExitPrice,
        amount: position.amount,
        pnl,
        pnlPercentage,
        entryTime: position.timestamp,
        exitTime: new Date(),
        exitReason: reason,
        fee,
        slippage: exitSlippageAmount
      }
    });

    await tx.position.delete({
      where: { id: positionId }
    });

    const newCash = portfolio.cash + cashReturn;
    const newRealizedPnL = portfolio.realizedPnL + pnl;
    const updatedPortfolio = await tx.portfolio.update({
      where: { id: portfolio.id },
      data: {
        cash: newCash,
        realizedPnL: newRealizedPnL
      }
    });

    return { success: true, trade, portfolio: updatedPortfolio, pnl };
  }, { maxWait: 20000, timeout: 20000, isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
}
