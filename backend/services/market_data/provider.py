from abc import ABC, abstractmethod
from typing import Dict, List, Any

class Provider(ABC):
    @abstractmethod
    def get_ticker(self, symbol: str) -> Dict[str, Any]:
        """Fetch 24hr ticker data for the symbol."""
        pass

    @abstractmethod
    def get_candles(self, symbol: str, interval: str, limit: int) -> List[Dict[str, Any]]:
        """Fetch candle/klines data for the symbol."""
        pass

    @abstractmethod
    def get_orderbook(self, symbol: str, limit: int) -> Dict[str, Any]:
        """Fetch orderbook/depth data for the symbol."""
        pass
