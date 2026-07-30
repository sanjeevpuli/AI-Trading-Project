import pandas as pd
from typing import Dict, Any
from .base_indicator import BaseIndicator


class EMAIndicator(BaseIndicator):
    """Exponential Moving Average indicator."""

    @property
    def name(self) -> str:
        return "ema"

    def calculate(self, df: pd.DataFrame, **kwargs) -> Dict[str, Any]:
        period = kwargs.get("period", 20)
        close = df["close"]
        ema_series = close.ewm(span=period, adjust=False).mean()
        latest = ema_series.iloc[-1]
        prev = ema_series.iloc[-2] if len(ema_series) > 1 else None
        price = close.iloc[-1]

        return {
            "indicator": "ema",
            "period": period,
            "value": round(float(latest), 6),
            "previous": round(float(prev), 6) if prev is not None else None,
            "price": round(float(price), 6),
            "signal": "above" if price > latest else "below",
        }
