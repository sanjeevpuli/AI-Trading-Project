from fastapi import APIRouter, Query, HTTPException
from typing import List, Dict, Any
from models.schemas import MarketPrice
from services.market_data.market_service import market_service
from datetime import datetime

router = APIRouter(prefix="/market", tags=["Market"])

@router.get("/price", response_model=List[MarketPrice])
async def get_market_prices():
    """Get live prices for BTCUSDT, ETHUSDT, and SOLUSDT from Binance."""
    prices = []
    for symbol in ["BTCUSDT", "ETHUSDT", "SOLUSDT"]:
        try:
            ticker = market_service.get_ticker(symbol)
            prices.append(
                MarketPrice(
                    symbol=ticker["symbol"],
                    price=ticker["current_price"],
                    change_24h=ticker["price_change_percent_24h"],
                    timestamp=datetime.utcnow()
                )
            )
        except Exception as e:
            # Propagate HTTP Exception if major failure, or fallback
            raise HTTPException(status_code=502, detail=f"Failed to fetch market data: {str(e)}")
    return prices

@router.get("/ticker/{symbol}", response_model=Dict[str, Any])
async def get_ticker(symbol: str):
    """Get live ticker details for a specific supported symbol."""
    try:
        return market_service.get_ticker(symbol)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))

@router.get("/candles/{symbol}", response_model=List[Dict[str, Any]])
async def get_candles(
    symbol: str,
    interval: str = Query("1m", description="Candle interval (e.g., 1m, 5m, 1h, 1d)"),
    limit: int = Query(100, description="Limit on number of candles to return", ge=1, le=1000)
):
    """Get live candle data for a specific supported symbol."""
    try:
        return market_service.get_candles(symbol, interval, limit)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=502, detail=str(e))
