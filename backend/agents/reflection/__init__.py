from agents.base_agent import BaseAgent
from agents.types import AgentState
from tools.tool_registry import tool_registry
from memory.memory_registry import memory_registry
from typing import Dict, Any

class ReflectionAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="reflection-agent",
            agent_name="Reflection Agent",
            description="Post-trade log analyzer and memory integration"
        )

    def initialize(self) -> None:
        self.status = AgentState.READY

    def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        self.status = AgentState.RUNNING
        
        # Use SharedMemory via memory_registry
        shared_mem = memory_registry.get_memory("shared_memory")
        if shared_mem:
            # Store lessons and log entries in shared memory
            shared_mem.store("reflection_entry", {"observations": ["Reflective analysis completed on mock execution"], "score": 0.95})
            mem_result = shared_mem.retrieve("reflection_entry")
        else:
            mem_result = {}
            
        return {
            "performance_score": 0.95,
            "observations": mem_result.get("observations", ["Mock observation"]) if isinstance(mem_result, dict) else ["Mock observation"]
        }

    def shutdown(self) -> None:
        self.status = AgentState.STOPPED
