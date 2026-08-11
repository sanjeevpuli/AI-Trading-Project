// lib/models/trade.dart
class TradeModel {
  final String id;
  final String symbol;
  final String type;
  final double entryPrice;
  final double? exitPrice;
  final double amount;
  final double pnl;
  final double pnlPercentage;
  final String? exitReason;
  final double fee;
  final double slippage;
  final String timestamp;

  const TradeModel({
    required this.id,
    required this.symbol,
    required this.type,
    required this.entryPrice,
    this.exitPrice,
    required this.amount,
    required this.pnl,
    required this.pnlPercentage,
    this.exitReason,
    required this.fee,
    required this.slippage,
    required this.timestamp,
  });

  factory TradeModel.fromJson(Map<String, dynamic> json) {
    return TradeModel(
      id: json['id']?.toString() ?? '',
      symbol: json['symbol']?.toString() ?? '',
      type: json['type']?.toString() ?? 'LONG',
      entryPrice: (json['entryPrice'] as num? ?? 0).toDouble(),
      exitPrice: json['exitPrice'] != null ? (json['exitPrice'] as num).toDouble() : null,
      amount: (json['amount'] as num? ?? 0).toDouble(),
      pnl: (json['pnl'] as num? ?? 0).toDouble(),
      pnlPercentage: (json['pnlPercentage'] as num? ?? 0).toDouble(),
      exitReason: json['exitReason']?.toString(),
      fee: (json['fee'] as num? ?? 0).toDouble(),
      slippage: (json['slippage'] as num? ?? 0).toDouble(),
      timestamp: json['timestamp']?.toString() ?? DateTime.now().toIso8601String(),
    );
  }

  bool get isProfit => pnl >= 0;
  String get asset => symbol.replaceAll('USDT', '');
}
