// lib/services/trading_service.dart
import '../network/api_client.dart';
import '../config/api_config.dart';
import '../models/position.dart';
import '../models/order.dart';
import '../models/trade.dart';

class TradingService {
  final ApiClient _client;
  TradingService(this._client);

  // Positions
  Future<List<PositionModel>> getPositions() async {
    final response = await _client.dio.get(ApiConfig.positions);
    return (response.data as List<dynamic>)
        .map((e) => PositionModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<void> updatePosition(Map<String, dynamic> positionData) async {
    await _client.dio.post(ApiConfig.positions, data: positionData);
  }

  Future<void> closePosition(String id, {String reason = "MANUAL"}) async {
    await _client.dio.delete('${ApiConfig.positions}?id=$id&reason=$reason');
  }

  // Orders
  Future<List<OrderModel>> getOrders() async {
    final response = await _client.dio.get(ApiConfig.orders);
    return (response.data as List<dynamic>)
        .map((e) => OrderModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<void> cancelOrder(String id) async {
    await _client.dio.delete('${ApiConfig.orders}?id=$id');
  }

  // Trade History
  Future<List<TradeModel>> getTradeHistory() async {
    final response = await _client.dio.get(ApiConfig.trades);
    final data = response.data as Map<String, dynamic>;
    return (data['executionHistory'] as List<dynamic>? ?? [])
        .map((e) => TradeModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  // General Order Execution via Backend single source of truth
  Future<void> executeOrder({
    required String symbol,
    required String type, // LONG | SHORT
    required String orderType, // MARKET | LIMIT
    required double amount,
    double? price,
    double? stopLoss,
    double? takeProfit,
  }) async {
    await _client.dio.post(ApiConfig.orders, data: {
      'symbol': symbol,
      'type': type,
      'orderType': orderType,
      'amount': amount,
      if (price != null) 'price': price,
      if (stopLoss != null) 'stopLoss': stopLoss,
      if (takeProfit != null) 'takeProfit': takeProfit,
    });
  }
}
