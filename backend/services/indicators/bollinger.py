import pandas as pd
from typing import Dict, Any
from .base_indicator import BaseIndicator


class BollingerBandsIndicator(BaseIndicator):
    """Bollinger Bands indicator."""

    @property
    def name(self) -> str:
        return "bollinger"

    def calculate(self, df: pd.DataFrame, **kwargs) -> Dict[str, Any]:
        period = kwargs.get("period", 20)
        std_dev = kwargs.get("std_dev", 2.0)

        close = df["close"]
        sma = close.rolling(window=period).mean()
        rolling_std = close.rolling(window=period).std()

        upper = sma + (rolling_std * std_dev)
        lower = sma - (rolling_std * std_dev)

        latest_upper = upper.iloc[-1]
        latest_middle = sma.iloc[-1]
        latest_lower = lower.iloc[-1]
        price = close.iloc[-1]

        # Band width and %B (percent B)
        if pd.notna(latest_upper) and pd.notna(latest_lower) and (latest_upper - latest_lower) != 0:
            bandwidth = (latest_upper - latest_lower) / latest_middle
            percent_b = (price - latest_lower) / (latest_upper - latest_lower)
        else:
            bandwidth = None
            percent_b = None

        return {
            "indicator": "bollinger",
            "period": period,
            "std_dev": std_dev,
            "upper": round(float(latest_upper), 6) if pd.notna(latest_upper) else None,
            "middle": round(float(latest_middle), 6) if pd.notna(latest_middle) else None,
            "lower": round(float(latest_lower), 6) if pd.notna(latest_lower) else None,
            "bandwidth": round(float(bandwidth), 6) if bandwidth is not None else None,
            "percent_b": round(float(percent_b), 6) if percent_b is not None else None,
            "price": round(float(price), 6),
        }
