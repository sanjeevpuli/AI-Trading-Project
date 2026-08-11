// lib/models/portfolio.dart
class PortfolioModel {
  final double balance;
  final double startingBalance;
  final double unrealizedPnL;
  final double realizedPnL;
  final String netExposure;
  final String winRate;
  final double sharpeRatio;
  final String maxDrawdown;
  final String systemLeverage;
  final String marginLevel;

  const PortfolioModel({
    required this.balance,
    required this.startingBalance,
    required this.unrealizedPnL,
    required this.realizedPnL,
    required this.netExposure,
    required this.winRate,
    required this.sharpeRatio,
    required this.maxDrawdown,
    required this.systemLeverage,
    required this.marginLevel,
  });

  factory PortfolioModel.fromJson(Map<String, dynamic> json) {
    return PortfolioModel(
      balance: (json['balance'] as num).toDouble(),
      startingBalance: (json['startingBalance'] as num? ?? 100000).toDouble(),
      unrealizedPnL: (json['unrealizedPnL'] as num? ?? 0).toDouble(),
      realizedPnL: (json['realizedPnL'] as num? ?? 0).toDouble(),
      netExposure: json['netExposure']?.toString() ?? '0.00%',
      winRate: json['winRate']?.toString() ?? '0.0%',
      sharpeRatio: (json['sharpeRatio'] as num? ?? 0).toDouble(),
      maxDrawdown: json['maxDrawdown']?.toString() ?? '0.00%',
      systemLeverage: json['systemLeverage']?.toString() ?? '1.00x',
      marginLevel: json['marginLevel']?.toString() ?? 'Healthy',
    );
  }

  double get totalPnL => unrealizedPnL + realizedPnL;
  double get totalPnLPercent => startingBalance > 0 ? (totalPnL / startingBalance) * 100 : 0;
}
