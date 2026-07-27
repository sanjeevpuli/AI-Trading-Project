from agents.base_agent import BaseAgent
from agents.types import AgentState, AgentSignal
from tools.tool_registry import tool_registry
from memory.memory_registry import memory_registry
from typing import Dict, Any

class SentimentAgent(BaseAgent):
    def __init__(self):
        super().__init__(
            agent_id="sentiment-analysis",
            agent_name="Sentiment Analysis Agent",
            description="News feeds & Social media parsing to generate sentiment signals"
        )

    def initialize(self) -> None:
        self.status = AgentState.READY

    def execute(self, params: Dict[str, Any]) -> AgentSignal:
        self.status = AgentState.RUNNING
        symbol = params.get("symbol", "BTCUSDT")
        
        # Use SharedMemory instead of hardcoded tool directly for memory retrieve
        shared_mem = memory_registry.get_memory("shared_memory")
        mem_data = shared_mem.retrieve("lessons_learned") if shared_mem else {}
        
        reasoning = "Mock: Compiled news articles: crypto ETF flows positive. Fear & Greed Index is 64."
        if mem_data and isinstance(mem_data, dict):
            reasoning += f" Relevant context: {', '.join(mem_data.get('lessons', []))}"

        return AgentSignal(
            agent_id=self.agent_id,
            symbol=symbol,
            signal_type="BUY",
            confidence=76.0,
            reasoning=reasoning,
            metadata={"sentiment_score": 0.72}
        )

    def shutdown(self) -> None:
        self.status = AgentState.STOPPED
