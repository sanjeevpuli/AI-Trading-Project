from agents.base_agent import BaseAgent
from agents.types import AgentState, AgentSignal
from tools.tool_registry import tool_registry
from typing import Dict, Any

class TechnicalAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="technical-analysis",
            agent_name="Technical Analysis Agent",
            description="Indicator & Candlestick analytics to generate technical signals"
        )

    def initialize(self) -> None:
        self.status = AgentState.READY

    def execute(self, params: Dict[str, Any]) -> AgentSignal:
        self.status = AgentState.RUNNING
        symbol = params.get("symbol", "BTCUSDT")
        
        # Use ToolRegistry
        market_tool = tool_registry.get_tool("market_data_tool")
        indicator_tool = tool_registry.get_tool("indicator_tool")
        
        market_data = market_tool.execute({"symbol": symbol}) if market_tool else {}
        indicator_data = indicator_tool.execute({}) if indicator_tool else {}
        
        reasoning = f"Mock: Fetched price {market_data.get('current_price')} for {symbol}. Indicators show: {indicator_data.get('ema_crossover')} and MACD is {indicator_data.get('macd')}."
        
        return AgentSignal(
            agent_id=self.agent_id,
            symbol=symbol,
            signal_type="BUY",
            confidence=91.0,
            reasoning=reasoning,
            metadata={"indicators": indicator_data, "market": market_data}
        )

    def shutdown(self) -> None:
        self.status = AgentState.STOPPED
