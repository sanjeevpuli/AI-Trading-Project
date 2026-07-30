import pandas as pd
from typing import Dict, Any
from .base_indicator import BaseIndicator


class SMAIndicator(BaseIndicator):
    """Simple Moving Average indicator."""

    @property
    def name(self) -> str:
        return "sma"

    def calculate(self, df: pd.DataFrame, **kwargs) -> Dict[str, Any]:
        period = kwargs.get("period", 20)
        close = df["close"]
        sma_series = close.rolling(window=period).mean()
        latest = sma_series.iloc[-1]
        prev = sma_series.iloc[-2] if len(sma_series) > 1 else None
        price = close.iloc[-1]

        return {
            "indicator": "sma",
            "period": period,
            "value": round(float(latest), 6) if pd.notna(latest) else None,
            "previous": round(float(prev), 6) if prev is not None and pd.notna(prev) else None,
            "price": round(float(price), 6),
            "signal": "above" if pd.notna(latest) and price > latest else "below",
        }
