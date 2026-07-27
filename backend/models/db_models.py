from sqlalchemy import Column, String, Float, DateTime, JSON
from database.base import Base
from datetime import datetime
import uuid

def generate_uuid():
    return str(uuid.uuid4())

class Trade(Base):
    __tablename__ = "trades"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    symbol = Column(String(20), nullable=False)
    type = Column(String(10), nullable=False)  # LONG or SHORT
    amount = Column(Float, nullable=False)
    entry_price = Column(Float, nullable=False)
    exit_price = Column(Float, nullable=True)
    pnl = Column(Float, default=0.0)
    pnl_percentage = Column(Float, default=0.0)
    entry_time = Column(DateTime, default=datetime.utcnow)
    exit_time = Column(DateTime, nullable=True)
    exit_reason = Column(String(50), nullable=True)  # MANUAL, STOP_LOSS, TAKE_PROFIT
    status = Column(String(20), default="FILLED")  # FILLED, PENDING, REJECTED
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Position(Base):
    __tablename__ = "positions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    symbol = Column(String(20), nullable=False)
    type = Column(String(10), nullable=False)  # LONG or SHORT
    amount = Column(Float, nullable=False)
    entry_price = Column(Float, nullable=False)
    current_price = Column(Float, nullable=False)
    stop_loss = Column(Float, nullable=True)
    take_profit = Column(Float, nullable=True)
    pnl = Column(Float, default=0.0)
    pnl_percentage = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Portfolio(Base):
    __tablename__ = "portfolios"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    balance = Column(Float, default=100000.0)
    equity = Column(Float, default=100000.0)
    unrealized_pnl = Column(Float, default=0.0)
    realized_pnl = Column(Float, default=0.0)
    margin_ratio = Column(Float, default=0.0)
    leverage = Column(Float, default=1.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class AgentDecision(Base):
    __tablename__ = "agent_decisions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    symbol = Column(String(20), nullable=False)
    action = Column(String(10), nullable=False)  # BUY, SELL, HOLD
    confidence = Column(Float, nullable=False)
    reasoning = Column(String(500), nullable=False)
    agent_signals = Column(JSON, nullable=True)  # Store detail indicators or other agent status
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
