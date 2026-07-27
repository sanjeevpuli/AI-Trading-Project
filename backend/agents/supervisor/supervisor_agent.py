from agents.base_agent import BaseAgent
from agents.types import AgentState, FinalDecision
from agents.supervisor.decision_engine import DecisionEngine
from agents.agent_registry import registry
from typing import Dict, Any

class SupervisorAgent(BaseAgent):
    def __init__(self, weights: Dict[str, float] = None):
        super().__init__(
            agent_id="supervisor-agent",
            agent_name="Supervisor Agent",
            description="Orchestrator checking results from all active trading agents and producing consensus choices."
        )
        self.decision_engine = DecisionEngine(weights)
        self.received_outputs: Dict[str, Any] = {}

    def initialize(self) -> None:
        self.status = AgentState.READY
        self.received_outputs.clear()

    def receive_output(self, agent_id: str, output: Any) -> None:
        """Receive and store the output from a registered agent."""
        self.received_outputs[agent_id] = output

    def execute(self, params: Dict[str, Any]) -> FinalDecision:
        self.status = AgentState.RUNNING
        
        # Use provided outputs if in params, otherwise fall back to received_outputs
        agent_outputs = params.get("agent_outputs")
        if agent_outputs is None:
            agent_outputs = self.received_outputs.copy()
            
        # Get list of registered agents (excluding supervisor itself)
        registered_agents = [agent.agent_id for agent in registry.list_agents() if agent.agent_id != self.agent_id]
        
        # Detect missing agent outputs
        missing = [agent_id for agent_id in registered_agents if agent_id not in agent_outputs or agent_outputs[agent_id] is None]
        
        # Generate the aggregated decision
        decision_dict = self.decision_engine.evaluate(agent_outputs)
        
        action = decision_dict["action"]
        confidence = decision_dict["confidence"]
        reasoning = decision_dict["reasoning"]
        metadata = {
            "evaluated_agents": list(agent_outputs.keys()),
            "missing_agents": missing
        }
        
        if missing:
            reasoning += f" | Warning: Missing agent data for: {', '.join(missing)}"
            
        self.status = AgentState.READY
        return FinalDecision(
            action=action,
            confidence=confidence,
            reasoning=reasoning,
            metadata=metadata
        )

    def shutdown(self) -> None:
        self.status = AgentState.STOPPED
        self.received_outputs.clear()
