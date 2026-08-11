// lib/services/market_service.dart
import 'dart:async';
import '../models/market_ticker.dart';
import 'binance_websocket_service.dart';

class MarketService {
  final BinanceWebsocketService _wsService;
  final _tickerController = StreamController<List<MarketTicker>>.broadcast();
  final Map<String, MarketTicker> _latestTickers = {};

  MarketService(this._wsService) {
    _wsService.tickerStream.listen((data) {
      final symbol = data['symbol'] as String;
      final price = data['price'] as double;
      final changePercent = data['changePercent'] as double;
      
      _latestTickers[symbol] = MarketTicker(
        symbol: symbol,
        asset: symbol.replaceAll('USDT', ''),
        price: price,
        changePercent: changePercent,
      );
      
      _tickerController.add(_latestTickers.values.toList());
    });
  }

  Stream<List<MarketTicker>> get tickerStream => _tickerController.stream;

  void startPolling({List<String>? symbols}) {
    final querySymbols = symbols ?? ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'ADAUSDT', 'XRPUSDT'];
    _wsService.connect(querySymbols);
  }

  void stopPolling() {
    _wsService.disconnect();
  }

  void dispose() {
    stopPolling();
    _tickerController.close();
  }
}
