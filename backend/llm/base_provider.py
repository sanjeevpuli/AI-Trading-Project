from abc import ABC, abstractmethod
from typing import Dict, Any, List

class BaseLLMProvider(ABC):
    @abstractmethod
    def initialize(self) -> None:
        """Initialize provider connections and settings."""
        pass

    @abstractmethod
    def generate(self, prompt: str, **kwargs) -> str:
        """Generate text from a single prompt."""
        pass

    @abstractmethod
    def chat(self, messages: List[Dict[str, str]], **kwargs) -> str:
        """Simulate chat completion given list of role-content messages."""
        pass

    @abstractmethod
    def health_check(self) -> bool:
        """Check provider status."""
        pass
