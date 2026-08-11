// lib/services/dashboard_service.dart
import '../network/api_client.dart';
import '../config/api_config.dart';
import '../models/portfolio.dart';
import '../models/position.dart';
import '../models/trade.dart';

class DashboardData {
  final PortfolioModel? portfolio;
  final List<PositionModel> activePositions;
  final List<TradeModel> executionHistory;
  final List<String> watchlist;
  final List<Map<String, dynamic>> metrics;

  const DashboardData({
    this.portfolio,
    required this.activePositions,
    required this.executionHistory,
    required this.watchlist,
    required this.metrics,
  });
}

class DashboardService {
  final ApiClient _client;
  DashboardService(this._client);

  Future<DashboardData> fetchDashboard() async {
    final response = await _client.dio.get(ApiConfig.dashboard);
    final data = response.data as Map<String, dynamic>;

    PortfolioModel? portfolio;
    if (data['portfolio'] != null) {
      portfolio = PortfolioModel.fromJson(data['portfolio'] as Map<String, dynamic>);
    }

    final positions = (data['activePositions'] as List<dynamic>? ?? [])
        .map((e) => PositionModel.fromJson(e as Map<String, dynamic>))
        .toList();

    final history = (data['executionHistory'] as List<dynamic>? ?? [])
        .map((e) => TradeModel.fromJson(e as Map<String, dynamic>))
        .toList();

    final watchlist = (data['watchlist'] as List<dynamic>? ?? [])
        .map((e) => e.toString())
        .toList();

    final metrics = (data['metrics'] as List<dynamic>? ?? [])
        .map((e) => e as Map<String, dynamic>)
        .toList();

    return DashboardData(
      portfolio: portfolio,
      activePositions: positions,
      executionHistory: history,
      watchlist: watchlist,
      metrics: metrics,
    );
  }
}
