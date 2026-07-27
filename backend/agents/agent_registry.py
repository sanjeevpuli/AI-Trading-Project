from typing import Dict, List, Optional
from agents.base_agent import BaseAgent
from agents.types import AgentState, AgentMetadata

class AgentRegistry:
    def __init__(self):
        self._agents: Dict[str, BaseAgent] = {}

    def register_agent(self, agent: BaseAgent) -> None:
        if agent.agent_id in self._agents:
            raise ValueError(f"Agent with ID '{agent.agent_id}' already registered.")
        self._agents[agent.agent_id] = agent

    def unregister_agent(self, agent_id: str) -> Optional[BaseAgent]:
        return self._agents.pop(agent_id, None)

    def get_agent(self, agent_id: str) -> Optional[BaseAgent]:
        return self._agents.get(agent_id)

    def list_agents(self) -> List[BaseAgent]:
        return list(self._agents.values())

    def get_agent_status(self, agent_id: str) -> Optional[AgentMetadata]:
        agent = self.get_agent(agent_id)
        if agent:
            return agent.get_status()
        return None

# Global registry instance
registry = AgentRegistry()
