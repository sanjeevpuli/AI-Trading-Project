from agents.base_agent import BaseAgent
from agents.types import AgentState
from tools.tool_registry import tool_registry
from typing import Dict, Any

class RiskAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="risk-management",
            agent_name="Risk Management Agent",
            description="Stop loss & Capital allocation constraints and risk verification"
        )

    def initialize(self) -> None:
        self.status = AgentState.READY

    def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        self.status = AgentState.RUNNING
        
        # Use PortfolioTool to get current metrics
        port_tool = tool_registry.get_tool("portfolio_tool")
        port_data = port_tool.execute({}) if port_tool else {}
        
        allowed = True
        reasoning = "Mock: Margin allocations checked. Net leverage nominal."
        if port_data and port_data.get("exposure_ratio", 0) > 0.8:
            allowed = False
            reasoning = "Mock: Risk limits breached. Exposure too high."

        return {
            "allowed": allowed,
            "max_allocation": 0.05,
            "reasoning": reasoning,
            "portfolio_metrics": port_data
        }

    def shutdown(self) -> None:
        self.status = AgentState.STOPPED
