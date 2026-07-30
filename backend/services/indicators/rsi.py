import pandas as pd
from typing import Dict, Any
from .base_indicator import BaseIndicator


class RSIIndicator(BaseIndicator):
    """Relative Strength Index indicator."""

    @property
    def name(self) -> str:
        return "rsi"

    def calculate(self, df: pd.DataFrame, **kwargs) -> Dict[str, Any]:
        period = kwargs.get("period", 14)
        close = df["close"]
        delta = close.diff()

        gain = delta.where(delta > 0, 0.0)
        loss = (-delta).where(delta < 0, 0.0)

        avg_gain = gain.ewm(alpha=1.0 / period, min_periods=period, adjust=False).mean()
        avg_loss = loss.ewm(alpha=1.0 / period, min_periods=period, adjust=False).mean()

        rs = avg_gain / avg_loss.replace(0, float("nan"))
        rsi = 100.0 - (100.0 / (1.0 + rs))

        latest = rsi.iloc[-1]
        prev = rsi.iloc[-2] if len(rsi) > 1 else None

        # Determine zone
        if pd.notna(latest):
            if latest >= 70:
                zone = "overbought"
            elif latest <= 30:
                zone = "oversold"
            else:
                zone = "neutral"
        else:
            zone = "insufficient_data"

        return {
            "indicator": "rsi",
            "period": period,
            "value": round(float(latest), 4) if pd.notna(latest) else None,
            "previous": round(float(prev), 4) if prev is not None and pd.notna(prev) else None,
            "zone": zone,
        }
