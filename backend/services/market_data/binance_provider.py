import httpx
from typing import Dict, List, Any
from .provider import Provider

class BinanceProvider(Provider):
    def __init__(self):
        self.base_url = "https://api.binance.com/api/v3"

    def get_ticker(self, symbol: str) -> Dict[str, Any]:
        """Fetch 24hr ticker data for the symbol from Binance."""
        url = f"{self.base_url}/ticker/24hr"
        with httpx.Client(timeout=10.0) as client:
            response = client.get(url, params={"symbol": symbol})
            response.raise_for_status()
            return response.json()

    def get_candles(self, symbol: str, interval: str, limit: int) -> List[Dict[str, Any]]:
        """Fetch candles/klines data for the symbol from Binance."""
        url = f"{self.base_url}/klines"
        with httpx.Client(timeout=10.0) as client:
            response = client.get(url, params={"symbol": symbol, "interval": interval, "limit": limit})
            response.raise_for_status()
            raw_candles = response.json()
            
            # Standardize output format
            candles = []
            for c in raw_candles:
                candles.append({
                    "open_time": c[0],
                    "open": float(c[1]),
                    "high": float(c[2]),
                    "low": float(c[3]),
                    "close": float(c[4]),
                    "volume": float(c[5]),
                    "close_time": c[6]
                })
            return candles

    def get_orderbook(self, symbol: str, limit: int) -> Dict[str, Any]:
        """Fetch orderbook depth data for the symbol from Binance."""
        url = f"{self.base_url}/depth"
        with httpx.Client(timeout=10.0) as client:
            response = client.get(url, params={"symbol": symbol, "limit": limit})
            response.raise_for_status()
            raw_depth = response.json()
            
            return {
                "lastUpdateId": raw_depth.get("lastUpdateId"),
                "bids": [[float(b[0]), float(b[1])] for b in raw_depth.get("bids", [])],
                "asks": [[float(a[0]), float(a[1])] for a in raw_depth.get("asks", [])]
            }
