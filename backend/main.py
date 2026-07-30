from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings

# Import API v1 routers
from api.v1.health import router as health_router
from api.v1.market import router as market_router
from api.v1.portfolio import router as portfolio_router
from api.v1.trades import router as trades_router
from api.v1.agents import router as agents_router
from api.v1.workflow import router as workflow_router
from api.v1.indicators import router as indicators_router

# Database initialization
from database.database import engine
from database.base import Base
import models.db_models  # Import models to ensure they are registered on Base

# Create tables automatically on startup
Base.metadata.create_all(bind=engine)

# Trigger Agent initialization and registration
import llm
import memory
import tools
import agents

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for the Autonomous Multi-Agent Trading Intelligence System",
    version="0.1.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers under v1 prefix
app.include_router(health_router, prefix="/api/v1")
app.include_router(market_router, prefix="/api/v1")
app.include_router(portfolio_router, prefix="/api/v1")
app.include_router(trades_router, prefix="/api/v1")
app.include_router(agents_router, prefix="/api/v1")
app.include_router(workflow_router, prefix="/api/v1")
app.include_router(indicators_router, prefix="/api/v1")

