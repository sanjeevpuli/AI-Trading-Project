from agents.base_agent import BaseAgent
from agents.types import AgentState
from tools.tool_registry import tool_registry
from typing import Dict, Any

class PortfolioAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="portfolio-allocation",
            agent_name="Portfolio Allocation Agent",
            description="Weight distribution and exposure optimizer"
        )

    def initialize(self) -> None:
        self.status = AgentState.READY

    def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        self.status = AgentState.RUNNING
        
        # Use PortfolioTool via registry
        port_tool = tool_registry.get_tool("portfolio_tool")
        port_data = port_tool.execute({}) if port_tool else {}
        
        return {
            "rebalance_suggested": False,
            "target_cash_pct": 55.0,
            "reasoning": f"Mock: Simulating mean-variance rebalancing loops. Current Equity: {port_data.get('equity')}.",
            "portfolio_data": port_data
        }

    def shutdown(self) -> None:
        self.status = AgentState.STOPPED
