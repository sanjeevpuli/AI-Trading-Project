// lib/models/position.dart
class PositionModel {
  final String id;
  final String symbol;
  final String type; // LONG | SHORT
  final double entryPrice;
  final double currentPrice;
  final double amount;
  final double pnl;
  final double pnlPercentage;
  final double? stopLoss;
  final double? takeProfit;
  final String timestamp;

  const PositionModel({
    required this.id,
    required this.symbol,
    required this.type,
    required this.entryPrice,
    required this.currentPrice,
    required this.amount,
    required this.pnl,
    required this.pnlPercentage,
    this.stopLoss,
    this.takeProfit,
    required this.timestamp,
  });

  factory PositionModel.fromJson(Map<String, dynamic> json) {
    return PositionModel(
      id: json['id']?.toString() ?? '',
      symbol: json['symbol']?.toString() ?? '',
      type: json['type']?.toString() ?? 'LONG',
      entryPrice: (json['entryPrice'] as num? ?? 0).toDouble(),
      currentPrice: (json['currentPrice'] as num? ?? 0).toDouble(),
      amount: (json['amount'] as num? ?? 0).toDouble(),
      pnl: (json['pnl'] as num? ?? 0).toDouble(),
      pnlPercentage: (json['pnlPercentage'] as num? ?? 0).toDouble(),
      stopLoss: json['stopLoss'] != null ? (json['stopLoss'] as num).toDouble() : null,
      takeProfit: json['takeProfit'] != null ? (json['takeProfit'] as num).toDouble() : null,
      timestamp: json['timestamp']?.toString() ?? DateTime.now().toIso8601String(),
    );
  }

  bool get isProfit => pnl >= 0;
  String get asset => symbol.replaceAll('USDT', '');
}
