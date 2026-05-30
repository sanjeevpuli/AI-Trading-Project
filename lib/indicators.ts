/**
 * Calculate Exponential Moving Average (EMA)
 */
export function calculateEMA(prices: number[], period: number): number[] {
  if (prices.length < period) return [];
  
  const k = 2 / (period + 1);
  const ema = [];
  
  // First EMA is SMA of the first 'period' elements
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += prices[i];
  }
  let prevEMA = sum / period;
  
  // Pad the beginning with nulls/zeros or just align indices
  // We'll align by keeping the array length same, padding start with NaN
  for (let i = 0; i < period - 1; i++) {
    ema.push(NaN);
  }
  ema.push(prevEMA);
  
  for (let i = period; i < prices.length; i++) {
    const currentEMA = (prices[i] - prevEMA) * k + prevEMA;
    ema.push(currentEMA);
    prevEMA = currentEMA;
  }
  
  return ema;
}

/**
 * Calculate Relative Strength Index (RSI)
 */
export function calculateRSI(prices: number[], period: number = 14): number[] {
  if (prices.length <= period) return [];
  
  const rsi = [];
  for (let i = 0; i < period; i++) {
    rsi.push(NaN);
  }
  
  let gains = 0;
  let losses = 0;
  
  // Initial average gain/loss
  for (let i = 1; i <= period; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) gains += change;
    else losses -= change; // keep positive
  }
  
  let avgGain = gains / period;
  let avgLoss = losses / period;
  
  let rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  rsi.push(avgLoss === 0 ? 100 : 100 - (100 / (1 + rs)));
  
  for (let i = period + 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? -change : 0;
    
    avgGain = ((avgGain * (period - 1)) + gain) / period;
    avgLoss = ((avgLoss * (period - 1)) + loss) / period;
    
    rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi.push(avgLoss === 0 ? 100 : 100 - (100 / (1 + rs)));
  }
  
  return rsi;
}

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 */
export function calculateMACD(prices: number[], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9) {
  const fastEMA = calculateEMA(prices, fastPeriod);
  const slowEMA = calculateEMA(prices, slowPeriod);
  
  const macdLine = [];
  for (let i = 0; i < prices.length; i++) {
    if (isNaN(fastEMA[i]) || isNaN(slowEMA[i])) {
      macdLine.push(NaN);
    } else {
      macdLine.push(fastEMA[i] - slowEMA[i]);
    }
  }
  
  // Filter out NaNs for signal calculation
  const validMacdStartIndex = macdLine.findIndex(val => !isNaN(val));
  const validMacd = macdLine.slice(validMacdStartIndex);
  
  const signalLineValid = calculateEMA(validMacd, signalPeriod);
  
  const signalLine = [];
  for (let i = 0; i < validMacdStartIndex; i++) {
    signalLine.push(NaN);
  }
  signalLine.push(...signalLineValid);
  
  const histogram = [];
  for (let i = 0; i < prices.length; i++) {
    if (isNaN(macdLine[i]) || isNaN(signalLine[i])) {
      histogram.push(NaN);
    } else {
      histogram.push(macdLine[i] - signalLine[i]);
    }
  }
  
  return { macdLine, signalLine, histogram };
}
