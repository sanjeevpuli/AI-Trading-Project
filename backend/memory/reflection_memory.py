from memory.base_memory import BaseMemory
from typing import Dict, Any

class ReflectionMemory(BaseMemory):
    def __init__(self):
        super().__init__(memory_name="reflection_memory")
        self._store: Dict[str, Any] = {}

    def store(self, key: str, value: Any) -> None:
        self._store[key] = value

    def retrieve(self, key: str) -> Any:
        if key not in self._store:
            return {"lessons": ["Ensure MACD confirmation", "Risk buffer validation limit checked"]}
        return self._store.get(key)

    def delete(self, key: str) -> None:
        self._store.pop(key, None)

    def clear(self) -> None:
        self._store.clear()
