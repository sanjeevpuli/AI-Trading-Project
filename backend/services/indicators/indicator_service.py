import pandas as pd
from typing import Dict, List, Any, Optional
from services.market_data.market_service import market_service
from .indicator_registry import indicator_registry

class IndicatorService:
    def __init__(self, market_svc=None, registry=None):
        self.market_service = market_svc or market_service
        self.registry = registry or indicator_registry

    def calculate_indicators(
        self,
        symbol: str,
        indicators: Optional[List[str]] = None,
        interval: str = "1h",
        limit: int = 200
    ) -> Dict[str, Any]:
        """Fetch historical candles via MarketService and calculate indicators."""
        # 1. Fetch historical candles from MarketService
        candles = self.market_service.get_candles(symbol, interval=interval, limit=limit)
        if not candles:
            return {
                "symbol": symbol.upper(),
                "interval": interval,
                "candle_count": 0,
                "indicators": {},
                "error": "No candle data retrieved"
            }

        # 2. Convert to pandas DataFrame
        df = pd.DataFrame(candles)
        for col in ["open", "high", "low", "close", "volume"]:
            if col in df.columns:
                df[col] = df[col].astype(float)

        # 3. Determine indicators to calculate
        if not indicators:
            requested = self.registry.list_all()
        else:
            requested = [ind.strip().lower() for ind in indicators if ind.strip()]

        results = {}
        for ind_name in requested:
            indicator_obj = self.registry.get(ind_name)
            if indicator_obj:
                try:
                    results[ind_name] = indicator_obj.calculate(df)
                except Exception as e:
                    results[ind_name] = {"error": f"Calculation failed: {str(e)}"}
            else:
                results[ind_name] = {"error": f"Unknown indicator '{ind_name}'"}

        return {
            "symbol": symbol.upper(),
            "interval": interval,
            "candle_count": len(df),
            "indicators": results
        }

# Global singleton
indicator_service = IndicatorService()
