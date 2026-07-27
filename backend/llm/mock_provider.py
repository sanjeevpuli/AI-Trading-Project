from llm.base_provider import BaseLLMProvider
from typing import Dict, Any, List

class MockProvider(BaseLLMProvider):
    def initialize(self) -> None:
        pass

    def generate(self, prompt: str, **kwargs) -> str:
        return f"Mock response generated for prompt: {prompt[:30]}..."

    def chat(self, messages: List[Dict[str, str]], **kwargs) -> str:
        return "Mock response: Technical metrics indicate a high buy confidence."

    def health_check(self) -> bool:
        return True
