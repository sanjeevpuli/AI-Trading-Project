from tools.tool_registry import tool_registry
from tools.market_data import MarketDataTool
from tools.indicators import IndicatorTool
from tools.portfolio import PortfolioTool
from tools.execution import ExecutionTool
from tools.memory import MemoryTool

# Instantiate and register all tools
market_data = MarketDataTool()
indicators = IndicatorTool()
portfolio = PortfolioTool()
execution = ExecutionTool()
memory = MemoryTool()

tools_list = [market_data, indicators, portfolio, execution, memory]

for tool in tools_list:
    tool_registry.register_tool(tool)
