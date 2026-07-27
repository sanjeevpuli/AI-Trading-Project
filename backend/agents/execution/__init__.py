from agents.base_agent import BaseAgent
from agents.types import AgentState
from tools.tool_registry import tool_registry
from typing import Dict, Any

class ExecutionAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="execution-agent",
            agent_name="Execution Agent",
            description="Paper trading order execution and fill simulator"
        )

    def initialize(self) -> None:
        self.status = AgentState.READY

    def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        self.status = AgentState.RUNNING
        
        # Use ExecutionTool via registry
        exec_tool = tool_registry.get_tool("execution_tool")
        exec_result = exec_tool.execute(params) if exec_tool else {"success": False}
        
        return exec_result

    def shutdown(self) -> None:
        self.status = AgentState.STOPPED
