from pydantic import BaseModel, Field
from typing import List, Dict, Optional
from datetime import datetime

# Market Models
class MarketPrice(BaseModel):
    symbol: str
    price: float
    change_24h: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class MarketHistory(BaseModel):
    symbol: str
    prices: List[float]
    timestamps: List[datetime]

# Portfolio Models
class PortfolioSummary(BaseModel):
    balance: float
    equity: float
    unrealized_pnl: float
    realized_pnl: float
    margin_ratio: float
    leverage: float
    risk_level: str

# Trade Models
class TradeRequest(BaseModel):
    symbol: str
    type: str = Field(..., description="LONG or SHORT")
    amount: float
    price: float
    stop_loss: Optional[float] = None
    take_profit: Optional[float] = None

class TradeResponse(BaseModel):
    id: str
    symbol: str
    type: str
    amount: float
    entry_price: float
    status: str = Field("FILLED", description="FILLED, REJECTED, PENDING")
    fee: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    error: Optional[str] = None

class ClosedTrade(BaseModel):
    id: str
    symbol: str
    type: str
    amount: float
    entry_price: float
    exit_price: float
    pnl: float
    pnl_percentage: float
    entry_time: datetime
    exit_time: datetime
    exit_reason: str

# Agent Models
class AgentStatus(BaseModel):
    id: str
    name: str
    role: str
    icon: str
    status: str = Field(..., description="ANALYZING, EXECUTING, ACTIVE, IDLE")
    confidence: float
    health: str = Field("HEALTHY", description="HEALTHY, DEGRADED, OFFLINE")
    latency: str
    uptime: str
    activity: List[str]
