import pandas as pd
from typing import Dict, Any
from .base_indicator import BaseIndicator


class MACDIndicator(BaseIndicator):
    """Moving Average Convergence Divergence indicator."""

    @property
    def name(self) -> str:
        return "macd"

    def calculate(self, df: pd.DataFrame, **kwargs) -> Dict[str, Any]:
        fast = kwargs.get("fast", 12)
        slow = kwargs.get("slow", 26)
        signal_period = kwargs.get("signal", 9)

        close = df["close"]
        ema_fast = close.ewm(span=fast, adjust=False).mean()
        ema_slow = close.ewm(span=slow, adjust=False).mean()

        macd_line = ema_fast - ema_slow
        signal_line = macd_line.ewm(span=signal_period, adjust=False).mean()
        histogram = macd_line - signal_line

        latest_macd = macd_line.iloc[-1]
        latest_signal = signal_line.iloc[-1]
        latest_hist = histogram.iloc[-1]
        prev_hist = histogram.iloc[-2] if len(histogram) > 1 else None

        # Determine trend
        if pd.notna(latest_macd) and pd.notna(latest_signal):
            trend = "bullish" if latest_macd > latest_signal else "bearish"
        else:
            trend = "insufficient_data"

        return {
            "indicator": "macd",
            "fast": fast,
            "slow": slow,
            "signal_period": signal_period,
            "macd": round(float(latest_macd), 6) if pd.notna(latest_macd) else None,
            "signal": round(float(latest_signal), 6) if pd.notna(latest_signal) else None,
            "histogram": round(float(latest_hist), 6) if pd.notna(latest_hist) else None,
            "previous_histogram": round(float(prev_hist), 6) if prev_hist is not None and pd.notna(prev_hist) else None,
            "trend": trend,
        }
