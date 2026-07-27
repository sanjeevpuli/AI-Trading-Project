from tools.base_tool import BaseTool
from typing import Dict, Any

class MemoryTool(BaseTool):
    def __init__(self):
        super().__init__(
            tool_name="memory_tool",
            description="Reads or writes shared agent reflection memory logs"
        )

    def execute(self, params: Dict[str, Any]) -> Dict[str, Any]:
        action = params.get("action", "read")
        if action == "write":
            return {"status": "saved", "key": params.get("key")}
        return {
            "insights": ["Golden cross detected on EMA Crossover Tool", "Low risk exposure verified by Portfolio Tool"]
        }
