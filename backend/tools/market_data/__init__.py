from tools.base_tool import BaseTool
from services.market_data.market_service import market_service
from typing import Dict, Any

class MarketDataTool(BaseTool):
    def __init__(self):
        super().__init__(
            tool_name="market_data_tool",
            description="Fetches live or historical cryptocurrency market data"
        )

    def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        symbol = params.get("symbol", "BTCUSDT")
        try:
            ticker = market_service.get_ticker(symbol)
            return {
                "symbol": ticker["symbol"],
                "current_price": ticker["current_price"],
                "high_24h": ticker["high_24h"],
                "low_24h": ticker["low_24h"],
                "volume_24h": ticker["volume_24h"]
            }
        except Exception as e:
            # Graceful fallback or raise depending on requirements
            # Let's return fallback mock values or propagate the error
            raise ValueError(f"Error fetching market data for {symbol}: {str(e)}")
