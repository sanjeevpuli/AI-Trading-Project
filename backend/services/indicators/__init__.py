from .indicator_registry import indicator_registry
from .ema import EMAIndicator
from .sma import SMAIndicator
from .rsi import RSIIndicator
from .macd import MACDIndicator
from .bollinger import BollingerBandsIndicator
from .atr import ATRIndicator
from .volume import VolumeIndicator

# Register all default indicators
for indicator in [
    EMAIndicator(),
    SMAIndicator(),
    RSIIndicator(),
    MACDIndicator(),
    BollingerBandsIndicator(),
    ATRIndicator(),
    VolumeIndicator(),
]:
    indicator_registry.register(indicator)
