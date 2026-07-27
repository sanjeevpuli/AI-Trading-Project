from fastapi import APIRouter
from typing import List
from models.schemas import AgentStatus

router = APIRouter(prefix="/agents", tags=["Agents"])

@router.get("/status", response_model=List[AgentStatus])
async def get_agents_status():
    return [
        AgentStatus(
            id="market-analysis",
            name="Market Analysis Agent",
            role="Fundamental & Macro scanning",
            icon="📊",
            status="ANALYZING",
            confidence=84.0,
            health="HEALTHY",
            latency="18ms",
            uptime="99.98%",
            activity=[
                "Parsed FED transcripts: hawkish tone expected.",
                "Scanning volume profiles for BTC block zones."
            ]
        ),
        AgentStatus(
            id="technical-analysis",
            name="Technical Analysis Agent",
            role="Indicator & Candlestick analytics",
            icon="📈",
            status="EXECUTING",
            confidence=91.0,
            health="HEALTHY",
            latency="8ms",
            uptime="100.0%",
            activity=[
                "Computing EMA crossover configurations.",
                "Scanned MACD trend vectors on BTC 1m kline stream."
            ]
        ),
        AgentStatus(
            id="sentiment-analysis",
            name="Sentiment Analysis Agent",
            role="News feeds & Social media parsing",
            icon="💬",
            status="ACTIVE",
            confidence=76.0,
            health="HEALTHY",
            latency="35ms",
            uptime="99.92%",
            activity=[
                "Compiled news articles: crypto ETF flows positive.",
                "Fear & Greed Index parsed: 64 (Greed)."
            ]
        ),
        AgentStatus(
            id="risk-management",
            name="Risk Management Agent",
            role="Stop loss & Capital allocation constraints",
            icon="🛡️",
            status="ACTIVE",
            confidence=98.0,
            health="HEALTHY",
            latency="5ms",
            uptime="100.0%",
            activity=[
                "Margin allocations checked. Net leverage nominal.",
                "Maximum loss buffers established."
            ]
        ),
        AgentStatus(
            id="portfolio-allocation",
            name="Portfolio Allocation Agent",
            role="Weight distribution optimizer",
            icon="💼",
            status="ACTIVE",
            confidence=88.0,
            health="HEALTHY",
            latency="22ms",
            uptime="99.95%",
            activity=[
                "Simulating mean-variance rebalancing loops.",
                "Optimal Cash buffer calculated: 55.0%."
            ]
        )
    ]
