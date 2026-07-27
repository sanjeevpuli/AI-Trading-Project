from langgraph.graph import StateGraph, END
from .state import AgentWorkflowState
from .nodes import (
    technical_node,
    sentiment_node,
    risk_node,
    portfolio_node,
    supervisor_node,
    execution_node,
    reflection_node
)

# Initialize the state graph
workflow = StateGraph(AgentWorkflowState)

# Add all nodes
workflow.add_node("technical", technical_node)
workflow.add_node("sentiment", sentiment_node)
workflow.add_node("risk", risk_node)
workflow.add_node("portfolio", portfolio_node)
workflow.add_node("supervisor", supervisor_node)
workflow.add_node("execution", execution_node)
workflow.add_node("reflection", reflection_node)

# Set starting entry point
workflow.set_entry_point("technical")

# Add linear sequence of transitions
workflow.add_edge("technical", "sentiment")
workflow.add_edge("sentiment", "risk")
workflow.add_edge("risk", "portfolio")
workflow.add_edge("portfolio", "supervisor")
workflow.add_edge("supervisor", "execution")
workflow.add_edge("execution", "reflection")
workflow.add_edge("reflection", END)

# Compile graph
trading_workflow = workflow.compile()
