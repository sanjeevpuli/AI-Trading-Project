// lib/models/market_ticker.dart
class MarketTicker {
  final String symbol;
  final String asset;
  final double price;
  final double changePercent;

  const MarketTicker({
    required this.symbol,
    required this.asset,
    required this.price,
    required this.changePercent,
  });

  factory MarketTicker.fromJson(Map<String, dynamic> json) {
    return MarketTicker(
      symbol: json['symbol']?.toString() ?? '',
      asset: json['asset']?.toString() ?? '',
      price: (json['price'] as num? ?? 0).toDouble(),
      changePercent: (json['changePercent'] as num? ?? 0).toDouble(),
    );
  }

  bool get isPositive => changePercent >= 0;
}

// lib/models/notification.dart
class NotificationModel {
  final String id;
  final String userId;
  final String title;
  final String message;
  final String type;
  final bool isRead;
  final String createdAt;

  const NotificationModel({
    required this.id,
    required this.userId,
    required this.title,
    required this.message,
    required this.type,
    required this.isRead,
    required this.createdAt,
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      id: json['id']?.toString() ?? '',
      userId: json['userId']?.toString() ?? '',
      title: json['title']?.toString() ?? '',
      message: json['message']?.toString() ?? '',
      type: json['type']?.toString() ?? 'SYSTEM',
      isRead: json['isRead'] as bool? ?? false,
      createdAt: json['createdAt']?.toString() ?? DateTime.now().toIso8601String(),
    );
  }
}
