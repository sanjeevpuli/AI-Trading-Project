from typing import Dict, List, Optional
from memory.base_memory import BaseMemory

class MemoryRegistry:
    def __init__(self):
        self._memories: Dict[str, BaseMemory] = {}

    def register_memory(self, memory: BaseMemory) -> None:
        if memory.memory_name in self._memories:
            raise ValueError(f"Memory with name '{memory.memory_name}' already registered.")
        self._memories[memory.memory_name] = memory

    def get_memory(self, memory_name: str) -> Optional[BaseMemory]:
        return self._memories.get(memory_name)

    def list_memories(self) -> List[BaseMemory]:
        return list(self._memories.values())

# Global registry instance
memory_registry = MemoryRegistry()
