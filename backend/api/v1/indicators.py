from fastapi import APIRouter, Query, HTTPException
from typing import Dict, Any, Optional
from services.indicators.indicator_service import indicator_service

router = APIRouter(prefix="/indicators", tags=["Indicators"])

@router.get("/{symbol}", response_model=Dict[str, Any])
async def get_indicators(
    symbol: str,
    indicators: Optional[str] = Query(None, description="Comma-separated list of indicators (e.g., ema,rsi,macd). Omit for all."),
    interval: str = Query("1h", description="Candle timeframe interval (e.g. 1m, 5m, 1h, 1d)"),
    limit: int = Query(200, description="Number of candles to calculate on", ge=20, le=1000)
):
    """Calculate technical indicators for a given symbol."""
    ind_list = None
    if indicators:
        ind_list = [i.strip() for i in indicators.split(",") if i.strip()]

    try:
        return indicator_service.calculate_indicators(
            symbol=symbol,
            indicators=ind_list,
            interval=interval,
            limit=limit
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error calculating indicators: {str(e)}")
