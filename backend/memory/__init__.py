from memory.memory_registry import memory_registry
from memory.trade_memory import TradeMemory
from memory.reflection_memory import ReflectionMemory
from memory.market_memory import MarketMemory
from memory.shared_memory import SharedMemory

# Instantiate and register all memories
trade_mem = TradeMemory()
reflection_mem = ReflectionMemory()
market_mem = MarketMemory()
shared_mem = SharedMemory()

memories_list = [trade_mem, reflection_mem, market_mem, shared_mem]

for memory in memories_list:
    memory_registry.register_memory(memory)
