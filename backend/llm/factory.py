from llm.provider_registry import provider_registry
from llm.mock_provider import MockProvider
from llm.ollama_provider import OllamaProvider
from core.config import settings
import os

from typing import Union

# Register known providers
provider_registry.register_provider("mock", MockProvider)
provider_registry.register_provider("ollama", OllamaProvider)

class ProviderFactory:
    @staticmethod
    def get_provider() -> Union[MockProvider, OllamaProvider]:
        # Fetch from env via settings or raw os
        provider_name = os.getenv("LLM_PROVIDER", "mock").lower()
        provider_cls = provider_registry.get_provider_class(provider_name)
        
        # Instantiate with default config if ollama
        if provider_name == "ollama":
            return provider_cls(
                base_url=os.getenv("OLLAMA_BASE_URL", "http://localhost:11434"),
                model=os.getenv("OLLAMA_MODEL", "llama3")
            )
        
        return provider_cls()
