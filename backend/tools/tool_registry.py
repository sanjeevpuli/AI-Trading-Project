from typing import Dict, List, Optional
from tools.base_tool import BaseTool

class ToolRegistry:
    def __init__(self):
        self._tools: Dict[str, BaseTool] = {}

    def register_tool(self, tool: BaseTool) -> None:
        if tool.tool_name in self._tools:
            raise ValueError(f"Tool with name '{tool.tool_name}' already registered.")
        self._tools[tool.tool_name] = tool

    def unregister_tool(self, tool_name: str) -> Optional[BaseTool]:
        return self._tools.pop(tool_name, None)

    def get_tool(self, tool_name: str) -> Optional[BaseTool]:
        return self._tools.get(tool_name)

    def list_tools(self) -> List[BaseTool]:
        return list(self._tools.values())

# Global tool registry instance
tool_registry = ToolRegistry()
