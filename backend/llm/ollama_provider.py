from llm.base_provider import BaseLLMProvider
from typing import Dict, Any, List

class OllamaProvider(BaseLLMProvider):
    def __init__(self, base_url: str = "http://localhost:11434", model: str = "llama3"):
        self.base_url = base_url
        self.model = model

    def initialize(self) -> None:
        # Mock initialization without making requests
        pass

    def generate(self, prompt: str, **kwargs) -> str:
        return f"Mock Ollama response for prompt: {prompt[:30]}..."

    def chat(self, messages: List[Dict[str, str]], **kwargs) -> str:
        return "Mock Ollama chat response: analyzing markets using llama3."

    def health_check(self) -> bool:
        # Stub status check
        return True
