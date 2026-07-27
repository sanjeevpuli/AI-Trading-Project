from agents.agent_registry import registry
from agents.technical import TechnicalAgent
from agents.sentiment import SentimentAgent
from agents.risk import RiskAgent
from agents.portfolio import PortfolioAgent
from agents.execution import ExecutionAgent
from agents.reflection import ReflectionAgent
from agents.supervisor.supervisor_agent import SupervisorAgent

# Initialize and register all agents
technical = TechnicalAgent()
sentiment = SentimentAgent()
risk = RiskAgent()
portfolio = PortfolioAgent()
execution = ExecutionAgent()
reflection = ReflectionAgent()
supervisor = SupervisorAgent()

agents_list = [technical, sentiment, risk, portfolio, execution, reflection, supervisor]

for agent in agents_list:
    agent.initialize()
    registry.register_agent(agent)
