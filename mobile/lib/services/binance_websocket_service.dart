import 'dart:async';
import 'dart:convert';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final binanceWebsocketProvider = Provider<BinanceWebsocketService>((ref) {
  return BinanceWebsocketService();
});

class BinanceWebsocketService {
  WebSocketChannel? _channel;
  List<String> _currentSymbols = [];
  
  final _tickerController = StreamController<Map<String, dynamic>>.broadcast();
  Stream<Map<String, dynamic>> get tickerStream => _tickerController.stream;

  void connect(List<String> symbols) {
    final newSymbols = symbols.map((s) => s.toLowerCase()).toList();
    
    if (_channel != null) {
      final currentSet = _currentSymbols.toSet();
      final newSet = newSymbols.toSet();
      
      final added = newSymbols.where((s) => !currentSet.contains(s)).toList();
      final removed = _currentSymbols.where((s) => !newSet.contains(s)).toList();
      
      if (added.isNotEmpty) {
        final streams = added.map((s) => '$s@ticker').toList();
        _channel!.sink.add(jsonEncode({
          'method': 'SUBSCRIBE',
          'params': streams,
          'id': DateTime.now().millisecondsSinceEpoch,
        }));
      }
      
      if (removed.isNotEmpty) {
        final streams = removed.map((s) => '$s@ticker').toList();
        _channel!.sink.add(jsonEncode({
          'method': 'UNSUBSCRIBE',
          'params': streams,
          'id': DateTime.now().millisecondsSinceEpoch + 1,
        }));
      }
      
      _currentSymbols = newSymbols;
      return;
    }
    
    _currentSymbols = newSymbols;
    if (_currentSymbols.isEmpty) return;
    
    final streams = _currentSymbols.map((s) => '$s@ticker').join('/');
    final url = Uri.parse('wss://stream.binance.com:9443/stream?streams=$streams');
    
    try {
      _channel = WebSocketChannel.connect(url);
      _channel!.stream.listen(
        (message) {
          try {
            final payload = jsonDecode(message);
            if (payload['stream'] != null && payload['data'] != null) {
              final data = payload['data'];
              _tickerController.add({
                'symbol': (data['s'] as String).toUpperCase(),
                'price': double.parse(data['c']),
                'changePercent': double.parse(data['P']),
              });
            }
          } catch (e) {
            // Ignore parse errors
          }
        },
        onDone: () {
          _channel = null;
          _reconnect();
        },
        onError: (e) {
          _channel = null;
          _reconnect();
        },
      );
    } catch (e) {
      _channel = null;
    }
  }
  
  void _reconnect() {
    Future.delayed(const Duration(seconds: 3), () {
      if (_currentSymbols.isNotEmpty) {
        final symbolsToReconnect = List<String>.from(_currentSymbols);
        _currentSymbols.clear();
        connect(symbolsToReconnect);
      }
    });
  }

  void disconnect() {
    _channel?.sink.close();
    _channel = null;
    _currentSymbols.clear();
  }
}
