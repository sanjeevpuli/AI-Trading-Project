// lib/models/order.dart
class OrderModel {
  final String id;
  final String symbol;
  final String type;
  final String orderType;
  final String status;
  final double amount;
  final double price;
  final double? stopLoss;
  final double? takeProfit;
  final String createdAt;

  const OrderModel({
    required this.id,
    required this.symbol,
    required this.type,
    required this.orderType,
    required this.status,
    required this.amount,
    required this.price,
    this.stopLoss,
    this.takeProfit,
    required this.createdAt,
  });

  factory OrderModel.fromJson(Map<String, dynamic> json) {
    return OrderModel(
      id: json['id']?.toString() ?? '',
      symbol: json['symbol']?.toString() ?? '',
      type: json['type']?.toString() ?? 'BUY',
      orderType: json['orderType']?.toString() ?? 'LIMIT',
      status: json['status']?.toString() ?? 'PENDING',
      amount: (json['amount'] as num? ?? 0).toDouble(),
      price: (json['price'] as num? ?? 0).toDouble(),
      stopLoss: json['stopLoss'] != null ? (json['stopLoss'] as num).toDouble() : null,
      takeProfit: json['takeProfit'] != null ? (json['takeProfit'] as num).toDouble() : null,
      createdAt: json['createdAt']?.toString() ?? DateTime.now().toIso8601String(),
    );
  }

  String get asset => symbol.replaceAll('USDT', '');
}
