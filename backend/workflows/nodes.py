from .state import AgentWorkflowState
from agents.agent_registry import registry
from llm.factory import ProviderFactory
from typing import Dict, Any

def technical_node(state: AgentWorkflowState) -> Dict[str, Any]:
    provider = ProviderFactory.get_provider()
    provider.initialize()
    llm_res = provider.generate("Analyze technical charts for Buy/Sell signals")
    
    agent = registry.get_agent("technical-analysis")
    result = agent.execute({"symbol": state["market_data"].get("symbol", "BTCUSDT")}) if agent else None
    
    signal = {
        "agent_id": result.agent_id,
        "signal_type": result.signal_type,
        "confidence": result.confidence,
        "reasoning": f"{result.reasoning} | LLM Insight: {llm_res}",
        "metadata": result.metadata
    } if result else None
    
    supervisor = registry.get_agent("supervisor-agent")
    if supervisor and signal:
        supervisor.receive_output("technical-analysis", signal)
    
    return {
        "technical_signal": signal
    }

def sentiment_node(state: AgentWorkflowState) -> Dict[str, Any]:
    provider = ProviderFactory.get_provider()
    provider.initialize()
    llm_res = provider.generate("Parse sentiment indicator")
    
    agent = registry.get_agent("sentiment-analysis")
    result = agent.execute({"symbol": state["market_data"].get("symbol", "BTCUSDT")}) if agent else None
    
    signal = {
        "agent_id": result.agent_id,
        "signal_type": result.signal_type,
        "confidence": result.confidence,
        "reasoning": f"{result.reasoning} | LLM Insight: {llm_res}",
        "metadata": result.metadata
    } if result else None
    
    supervisor = registry.get_agent("supervisor-agent")
    if supervisor and signal:
        supervisor.receive_output("sentiment-analysis", signal)
    
    return {
        "sentiment_signal": signal
    }

def risk_node(state: AgentWorkflowState) -> Dict[str, Any]:
    agent = registry.get_agent("risk-management")
    result = agent.execute({"symbol": state["market_data"].get("symbol", "BTCUSDT")}) if agent else None
    
    supervisor = registry.get_agent("supervisor-agent")
    if supervisor and result:
        supervisor.receive_output("risk-management", result)
        
    return {
        "risk_signal": result
    }

def portfolio_node(state: AgentWorkflowState) -> Dict[str, Any]:
    agent = registry.get_agent("portfolio-allocation")
    result = agent.execute({"symbol": state["market_data"].get("symbol", "BTCUSDT")}) if agent else None
    
    supervisor = registry.get_agent("supervisor-agent")
    if supervisor and result:
        supervisor.receive_output("portfolio-allocation", result)
        
    return {
        "portfolio_signal": result
    }

def supervisor_node(state: AgentWorkflowState) -> Dict[str, Any]:
    agent_outputs = {
        "technical-analysis": state.get("technical_signal"),
        "sentiment-analysis": state.get("sentiment_signal"),
        "risk-management": state.get("risk_signal"),
        "portfolio-allocation": state.get("portfolio_signal"),
        "reflection-agent": state.get("reflection_signal")
    }
    
    supervisor = registry.get_agent("supervisor-agent")
    decision = supervisor.execute({"agent_outputs": agent_outputs}) if supervisor else {"action": "HOLD", "confidence": 50.0, "reasoning": "Supervisor offline"}
    
    return {
        "final_decision": decision
    }

def execution_node(state: AgentWorkflowState) -> Dict[str, Any]:
    decision = state.get("final_decision") or {"action": "HOLD", "confidence": 50.0, "reasoning": "No supervisor decision"}
    
    agent = registry.get_agent("execution-agent")
    params = {
        "symbol": state["market_data"].get("symbol", "BTCUSDT"),
        "price": state["market_data"].get("price", 68000.0),
        "decision": decision
    }
    result = agent.execute(params) if agent else None
    
    return {
        "execution_signal": result
    }

def reflection_node(state: AgentWorkflowState) -> Dict[str, Any]:
    agent = registry.get_agent("reflection-agent")
    result = agent.execute({"execution": state.get("execution_signal")}) if agent else None
    
    supervisor = registry.get_agent("supervisor-agent")
    if supervisor and result:
        supervisor.receive_output("reflection-agent", result)
        
    return {
        "reflection_signal": result
    }
