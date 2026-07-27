from enum import Enum
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
from datetime import datetime

class AgentState(str, Enum):
    INITIALIZING = "INITIALIZING"
    READY = "READY"
    RUNNING = "RUNNING"
    ERROR = "ERROR"
    STOPPED = "STOPPED"

class AgentMetadata(BaseModel):
    id: str
    name: str
    description: str
    status: AgentState
    last_active: datetime = Field(default_factory=datetime.utcnow)

class AgentSignal(BaseModel):
    agent_id: str
    symbol: str
    signal_type: str  # BUY, SELL, HOLD
    confidence: float  # 0.0 to 100.0
    reasoning: str
    metadata: Dict[str, Any] = {}
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class FinalDecision(BaseModel):
    action: str  # BUY, SELL, HOLD
    confidence: float  # 0.0 to 100.0
    reasoning: str
    metadata: Dict[str, Any] = Field(default_factory=dict)
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    def __getitem__(self, item):
        return getattr(self, item)

    def get(self, item, default=None):
        return getattr(self, item, default)

