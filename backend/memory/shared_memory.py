from memory.base_memory import BaseMemory
from memory.memory_registry import memory_registry
from typing import Any

class SharedMemory(BaseMemory):
    def __init__(self):
        super().__init__(memory_name="shared_memory")

    def store(self, key: str, value: Any) -> None:
        # Route to appropriate memory store depending on key prefixes or just store globally
        ref_mem = memory_registry.get_memory("reflection_memory")
        if ref_mem:
            ref_mem.store(key, value)

    def retrieve(self, key: str) -> Any:
        # Check in all memories or specific ones
        ref_mem = memory_registry.get_memory("reflection_memory")
        if ref_mem:
            val = ref_mem.retrieve(key)
            if val:
                return val
        return None

    def delete(self, key: str) -> None:
        ref_mem = memory_registry.get_memory("reflection_memory")
        if ref_mem:
            ref_mem.delete(key)

    def clear(self) -> None:
        for mem in memory_registry.list_memories():
            mem.clear()
