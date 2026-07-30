from typing import Dict, Optional, List
from .base_indicator import BaseIndicator


class IndicatorRegistry:
    """Central registry that maps indicator names to their implementations."""

    def __init__(self):
        self._indicators: Dict[str, BaseIndicator] = {}

    def register(self, indicator: BaseIndicator) -> None:
        """Register an indicator instance under its name."""
        if indicator.name in self._indicators:
            raise ValueError(f"Indicator '{indicator.name}' is already registered.")
        self._indicators[indicator.name] = indicator

    def get(self, name: str) -> Optional[BaseIndicator]:
        """Retrieve an indicator by name (case-insensitive)."""
        return self._indicators.get(name.lower())

    def list_all(self) -> List[str]:
        """Return the names of all registered indicators."""
        return list(self._indicators.keys())


# Module-level singleton
indicator_registry = IndicatorRegistry()
