import pandas as pd
from typing import Dict, Any
from .base_indicator import BaseIndicator


class VolumeIndicator(BaseIndicator):
    """Volume statistics indicator."""

    @property
    def name(self) -> str:
        return "volume"

    def calculate(self, df: pd.DataFrame, **kwargs) -> Dict[str, Any]:
        period = kwargs.get("period", 20)
        volume = df["volume"]

        vol_mean = volume.rolling(window=period).mean()
        vol_std = volume.rolling(window=period).std()

        latest_vol = volume.iloc[-1]
        avg_vol = vol_mean.iloc[-1]
        std_vol = vol_std.iloc[-1]

        # Volume ratio: current vs average
        ratio = (latest_vol / avg_vol) if pd.notna(avg_vol) and avg_vol != 0 else None

        # Volume trend: is volume increasing over last 5 bars?
        if len(volume) >= 5:
            recent_5 = volume.iloc[-5:]
            trend = "increasing" if recent_5.iloc[-1] > recent_5.iloc[0] else "decreasing"
        else:
            trend = "insufficient_data"

        return {
            "indicator": "volume",
            "period": period,
            "latest": round(float(latest_vol), 4),
            "average": round(float(avg_vol), 4) if pd.notna(avg_vol) else None,
            "std_dev": round(float(std_vol), 4) if pd.notna(std_vol) else None,
            "ratio": round(float(ratio), 4) if ratio is not None else None,
            "trend": trend,
        }
