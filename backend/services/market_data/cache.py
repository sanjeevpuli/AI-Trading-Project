import time
from typing import Dict, Any, Optional, Tuple

class Cache:
    def __init__(self):
        self._cache: Dict[str, Tuple[Any, float]] = {}

    def get(self, key: str) -> Optional[Any]:
        """Retrieve value from cache if it exists and has not expired."""
        if key not in self._cache:
            return None
        value, expiry = self._cache[key]
        if time.time() > expiry:
            del self._cache[key]
            return None
        return value

    def set(self, key: str, value: Any, ttl: float = 5.0) -> None:
        """Store value in cache with a TTL in seconds."""
        expiry = time.time() + ttl
        self._cache[key] = (value, expiry)

    def clear(self) -> None:
        """Clear all cached entries."""
        self._cache.clear()
