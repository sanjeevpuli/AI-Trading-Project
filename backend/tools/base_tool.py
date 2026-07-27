from abc import ABC, abstractmethod
from typing import Dict, Any

class BaseTool(ABC):
    def __init__(self, tool_name: str, description: str):
        self.tool_name: str = tool_name
        self.description: str = description

    @abstractmethod
    def execute(self, params: Dict[str, Any]) -> Any:
        """Execute the tool action with the given parameter dict."""
        pass
