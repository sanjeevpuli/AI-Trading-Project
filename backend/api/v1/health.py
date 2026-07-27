from fastapi import APIRouter
from core.config import settings

router = APIRouter(tags=["Health"])

@router.get("/ping")
async def ping():
    return {"status": "ok", "message": "pong"}

@router.get("/health")
async def health():
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "version": "0.1.0"
    }
