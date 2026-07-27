from fastapi import APIRouter
from models.schemas import PortfolioSummary

router = APIRouter(prefix="/portfolio", tags=["Portfolio"])

@router.get("", response_model=PortfolioSummary)
async def get_portfolio_summary():
    # Realistic mock portfolio data
    return PortfolioSummary(
        balance=100000.0,
        equity=102450.75,
        unrealized_pnl=2450.75,
        realized_pnl=1200.50,
        margin_ratio=2.45,
        leverage=1.0,
        risk_level="LOW"
    )
