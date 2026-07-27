from fastapi import APIRouter
from workflows.graph import trading_workflow
from typing import Dict, Any

router = APIRouter(prefix="/workflow", tags=["Workflow"])

@router.get("", response_model=Dict[str, Any])
async def execute_agent_workflow():
    # Initial state inputs
    initial_state = {
        "market_data": {
            "symbol": "BTCUSDT",
            "price": 68210.0
        },
        "technical_signal": None,
        "sentiment_signal": None,
        "risk_signal": None,
        "portfolio_signal": None,
        "execution_signal": None,
        "reflection_signal": None,
        "final_decision": None,
        "metadata": {"session_id": "test_workflow_run"}
    }
    
    # Execute the LangGraph workflow
    result = trading_workflow.invoke(initial_state)
    
    return {
        "status": "success",
        "final_state": result
    }
