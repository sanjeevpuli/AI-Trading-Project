from abc import ABC, abstractmethod
from typing import Any

class BaseMemory(ABC):
    def __init__(self, memory_name: str):
        self.memory_name: str = memory_name

    @abstractmethod
    def store(self, key: str, value: Any) -> None:
        """Store value with key in memory."""
        pass

    @abstractmethod
    def retrieve(self, key: str) -> Any:
        """Retrieve value from memory by key."""
        pass

    @abstractmethod
    def delete(self, key: str) -> None:
        """Delete value from memory by key."""
        pass

    @abstractmethod
    def clear(self) -> None:
        """Clear all contents of this memory."""
        pass
