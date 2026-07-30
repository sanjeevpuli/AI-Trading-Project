from abc import ABC, abstractmethod
from typing import Dict, Any
import pandas as pd


class BaseIndicator(ABC):
    """Abstract base class for all technical indicators."""

    @property
    @abstractmethod
    def name(self) -> str:
        """Unique lowercase identifier for this indicator (e.g. 'ema', 'rsi')."""
        pass

    @abstractmethod
    def calculate(self, df: pd.DataFrame, **kwargs) -> Dict[str, Any]:
        """
        Calculate the indicator from an OHLCV DataFrame.

        Parameters
        ----------
        df : pd.DataFrame
            Must contain at least: open, high, low, close, volume columns.
        **kwargs
            Indicator-specific parameters (periods, etc.).

        Returns
        -------
        Dict[str, Any]
            Standardised JSON-serialisable result dict.
        """
        pass
