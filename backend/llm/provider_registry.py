from typing import Dict, Type
from llm.base_provider import BaseLLMProvider

class ProviderRegistry:
    def __init__(self):
        self._providers: Dict[str, Type[BaseLLMProvider]] = {}

    def register_provider(self, name: str, provider_cls: Type[BaseLLMProvider]) -> None:
        self._providers[name.lower()] = provider_cls

    def get_provider_class(self, name: str) -> Type[BaseLLMProvider]:
        cls = self._providers.get(name.lower())
        if not cls:
            raise ValueError(f"LLM Provider '{name}' is not registered.")
        return cls

provider_registry = ProviderRegistry()
