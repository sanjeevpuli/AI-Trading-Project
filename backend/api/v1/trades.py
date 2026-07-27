from fastapi import APIRouter, HTTPException
from typing import List
from models.schemas import TradeRequest, TradeResponse, ClosedTrade
from datetime import datetime, timedelta
import uuid

router = APIRouter(prefix="/trades", tags=["Trades"])

@router.get("", response_model=List[ClosedTrade])
async def get_trade_history():
    # Realistic mock historical closed trades
    now = datetime.utcnow()
    return [
        ClosedTrade(
            id=str(uuid.uuid4()),
            symbol="BTCUSDT",
            type="LONG",
            amount=0.5,
            entry_price=67500.0,
            exit_price=68100.0,
            pnl=300.0,
            pnl_percentage=0.88,
            entry_time=now - timedelta(hours=2),
            exit_time=now - timedelta(minutes=15),
            exit_reason="TAKE_PROFIT"
        ),
        ClosedTrade(
            id=str(uuid.uuid4()),
            symbol="ETHUSDT",
            type="SHORT",
            amount=2.0,
            entry_price=3900.0,
            exit_price=3860.0,
            pnl=80.0,
            pnl_percentage=1.02,
            entry_time=now - timedelta(hours=5),
            exit_time=now - timedelta(hours=4),
            exit_reason="MANUAL"
        )
    ]

@router.post("/execute", response_model=TradeResponse)
async def execute_trade(request: TradeRequest):
    # Simulated execution
    if request.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be greater than zero")
        
    fee = request.price * request.amount * 0.001  # 0.1% simulated fee
    
    return TradeResponse(
        id=str(uuid.uuid4()),
        symbol=request.symbol,
        type=request.type,
        amount=request.amount,
        entry_price=request.price,
        status="FILLED",
        fee=fee,
        timestamp=datetime.utcnow()
    )
