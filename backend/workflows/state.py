from typing import TypedDict, Dict, Any, Optional

class AgentWorkflowState(TypedDict):
    market_data: Dict[str, Any]
    technical_signal: Optional[Dict[str, Any]]
    sentiment_signal: Optional[Dict[str, Any]]
    risk_signal: Optional[Dict[str, Any]]
    portfolio_signal: Optional[Dict[str, Any]]
    execution_signal: Optional[Dict[str, Any]]
    reflection_signal: Optional[Dict[str, Any]]
    final_decision: Optional[Dict[str, Any]]
    metadata: Dict[str, Any]
