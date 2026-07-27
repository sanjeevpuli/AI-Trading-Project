from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from datetime import datetime
from agents.types import AgentState, AgentMetadata

class BaseAgent(ABC):
    def __init__(self, agent_id: str, agent_name: str, description: str):
        self.agent_id: str = agent_id
        self.agent_name: str = agent_name
        self.description: str = description
        self.status: AgentState = AgentState.STOPPED
        self.last_active: datetime = datetime.utcnow()

    @abstractmethod
    def initialize(self) -> None:
        """Initialise resources, variables, memory, and database configurations."""
        self.status = AgentState.INITIALIZING
        self.last_active = datetime.utcnow()

    @abstractmethod
    def execute(self, params: Dict[str, Any]) -> Any:
        """Perform core operations of the Agent based on params."""
        self.last_active = datetime.utcnow()
        pass

    @abstractmethod
    def shutdown(self) -> None:
        """Properly close resources, connections, and files."""
        self.status = AgentState.STOPPED
        self.last_active = datetime.utcnow()

    def get_status(self) -> AgentMetadata:
        """Retrieve runtime stats, uptime, health, and status info."""
        return AgentMetadata(
            id=self.agent_id,
            name=self.agent_name,
            description=self.description,
            status=self.status,
            last_active=self.last_active
        )
