import pandas as pd
from typing import Dict, Any
from .base_indicator import BaseIndicator


class ATRIndicator(BaseIndicator):
    """Average True Range indicator."""

    @property
    def name(self) -> str:
        return "atr"

    def calculate(self, df: pd.DataFrame, **kwargs) -> Dict[str, Any]:
        period = kwargs.get("period", 14)

        high = df["high"]
        low = df["low"]
        close = df["close"]

        # True Range = max(H-L, |H-Cprev|, |L-Cprev|)
        prev_close = close.shift(1)
        tr1 = high - low
        tr2 = (high - prev_close).abs()
        tr3 = (low - prev_close).abs()
        true_range = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)

        atr = true_range.ewm(alpha=1.0 / period, min_periods=period, adjust=False).mean()

        latest = atr.iloc[-1]
        prev = atr.iloc[-2] if len(atr) > 1 else None
        price = close.iloc[-1]

        # ATR as percentage of price
        atr_pct = (latest / price * 100) if pd.notna(latest) and price != 0 else None

        return {
            "indicator": "atr",
            "period": period,
            "value": round(float(latest), 6) if pd.notna(latest) else None,
            "previous": round(float(prev), 6) if prev is not None and pd.notna(prev) else None,
            "atr_percent": round(float(atr_pct), 4) if atr_pct is not None else None,
            "volatility": "high" if atr_pct is not None and atr_pct > 3.0 else "low",
        }
