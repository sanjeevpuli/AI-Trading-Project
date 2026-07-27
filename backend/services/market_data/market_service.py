from typing import Dict, List, Any
from .binance_provider import BinanceProvider
from .cache import Cache

class MarketService:
    def __init__(self, provider=None, cache=None):
        self.provider = provider or BinanceProvider()
        self.cache = cache or Cache()
        self.supported_symbols = {"BTCUSDT", "ETHUSDT", "SOLUSDT"}

    def _normalize_and_validate_symbol(self, symbol: str) -> str:
        normalized = symbol.strip().upper()
        if normalized not in self.supported_symbols:
            raise ValueError(f"Symbol '{symbol}' is not supported. Supported symbols: {self.supported_symbols}")
        return normalized

    def get_ticker(self, symbol: str) -> Dict[str, Any]:
        """Get ticker data with validation, normalization, and 5s caching."""
        norm_symbol = self._normalize_and_validate_symbol(symbol)
        cache_key = f"ticker:{norm_symbol}"
        
        cached = self.cache.get(cache_key)
        if cached is not None:
            return cached

        data = self.provider.get_ticker(norm_symbol)
        
        # Standardize ticker response format
        result = {
            "symbol": norm_symbol,
            "current_price": float(data.get("lastPrice", 0.0)),
            "high_24h": float(data.get("highPrice", 0.0)),
            "low_24h": float(data.get("lowPrice", 0.0)),
            "volume_24h": float(data.get("volume", 0.0)),
            "price_change_percent_24h": float(data.get("priceChangePercent", 0.0)),
        }
        
        self.cache.set(cache_key, result, ttl=5.0)
        return result

    def get_candles(self, symbol: str, interval: str = "1m", limit: int = 100) -> List[Dict[str, Any]]:
        """Get candles data with validation, normalization, and 5s caching."""
        norm_symbol = self._normalize_and_validate_symbol(symbol)
        cache_key = f"candles:{norm_symbol}:{interval}:{limit}"
        
        cached = self.cache.get(cache_key)
        if cached is not None:
            return cached

        data = self.provider.get_candles(norm_symbol, interval, limit)
        self.cache.set(cache_key, data, ttl=5.0)
        return data

    def get_orderbook(self, symbol: str, limit: int = 100) -> Dict[str, Any]:
        """Get order book data with validation, normalization, and 5s caching."""
        norm_symbol = self._normalize_and_validate_symbol(symbol)
        cache_key = f"orderbook:{norm_symbol}:{limit}"
        
        cached = self.cache.get(cache_key)
        if cached is not None:
            return cached

        data = self.provider.get_orderbook(norm_symbol, limit)
        self.cache.set(cache_key, data, ttl=5.0)
        return data

# Global MarketService instance to share cache
market_service = MarketService()
