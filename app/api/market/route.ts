import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbolsParam = searchParams.get("symbols");
  
  // Default to core symbols if none provided
  let symbols = ["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT", "ADAUSDT", "XRPUSDT"];
  if (symbolsParam) {
    try {
      const parsed = JSON.parse(symbolsParam);
      if (Array.isArray(parsed) && parsed.length > 0) {
        symbols = parsed;
      }
    } catch (e) {
      // Fallback if parsing fails, maybe comma-separated
      symbols = symbolsParam.split(",").map(s => s.trim()).filter(Boolean);
    }
  }

  // Deduplicate and ensure uppercase
  symbols = Array.from(new Set(symbols.map(s => s.toUpperCase())));

  try {
    const formattedSymbols = JSON.stringify(symbols);
    const binanceUrl = `https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(formattedSymbols)}`;
    
    const response = await fetch(binanceUrl, { next: { revalidate: 0 } });
    if (!response.ok) {
      throw new Error(`Binance API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    const formattedData = data.map((ticker: any) => ({
      symbol: ticker.symbol,
      asset: ticker.symbol.replace("USDT", ""),
      price: parseFloat(ticker.lastPrice),
      changePercent: parseFloat(ticker.priceChangePercent),
    }));

    return NextResponse.json({
      connection: "CONNECTED",
      provider: "Binance REST",
      latency: "N/A",
      symbols: formattedData,
      timestamp: new Date().toISOString(),
    }, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });

  } catch (error: any) {
    console.error("Market API Error:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch market data", details: error.message },
      { status: 500 }
    );
  }
}
