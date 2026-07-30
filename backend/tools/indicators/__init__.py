from tools.base_tool import BaseTool
from services.indicators.indicator_service import indicator_service
from typing import Dict, Any

class IndicatorTool(BaseTool):
    def __init__(self):
        super().__init__(
            tool_name="indicator_tool",
            description="Calculates technical indicators such as EMA, MACD, and RSI"
        )

    def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        symbol = params.get("symbol", "BTCUSDT")
        indicators = params.get("indicators")
        interval = params.get("interval", "1h")
        limit = params.get("limit", 200)

        if isinstance(indicators, str):
            indicators = [i.strip() for i in indicators.split(",") if i.strip()]

        return indicator_service.calculate_indicators(
            symbol=symbol,
            indicators=indicators,
            interval=interval,
            limit=limit
        )
