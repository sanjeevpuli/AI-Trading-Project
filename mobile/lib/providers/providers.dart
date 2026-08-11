// lib/providers/providers.dart
// Central provider file — all Riverpod providers declared here
import 'dart:developer' as dev;
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../network/api_client.dart';
import '../services/auth_service.dart';
import '../services/dashboard_service.dart';
import '../services/market_service.dart';
import '../services/trading_service.dart';
import '../services/binance_websocket_service.dart';
import '../services/agent_service.dart';
import '../services/notification_service.dart';
import '../services/settings_service.dart';
import '../models/user.dart';

// ────────────────────────────────────────────
// Core Infrastructure
// ────────────────────────────────────────────

/// Pre-initialized in main.dart via ProviderScope override.
/// Fallback throws a clear exception if main initialization failed.
final apiClientProvider = Provider<ApiClient>((ref) {
  throw UnimplementedError('apiClientProvider must be overridden in ProviderScope in main.dart');
});

// ────────────────────────────────────────────
// Services
// ────────────────────────────────────────────

final authServiceProvider = Provider<AuthService>((ref) {
  final client = ref.watch(apiClientProvider);
  return AuthService(client);
});

final dashboardServiceProvider = Provider<DashboardService>((ref) {
  final client = ref.watch(apiClientProvider);
  return DashboardService(client);
});

final marketServiceProvider = Provider<MarketService>((ref) {
  final wsService = ref.watch(binanceWebsocketProvider);
  final service = MarketService(wsService);
  ref.onDispose(() => service.dispose());
  return service;
});

final tradingServiceProvider = Provider<TradingService>((ref) {
  final client = ref.watch(apiClientProvider);
  return TradingService(client);
});

final agentServiceProvider = Provider<AgentService>((ref) {
  final client = ref.watch(apiClientProvider);
  return AgentService(client);
});

final notificationServiceProvider = Provider<NotificationService>((ref) {
  final client = ref.watch(apiClientProvider);
  return NotificationService(client);
});

final settingsServiceProvider = Provider<SettingsService>((ref) {
  final client = ref.watch(apiClientProvider);
  return SettingsService(client);
});

// ────────────────────────────────────────────
// Auth State
// ────────────────────────────────────────────

final currentUserProvider = StateProvider<UserModel?>((ref) => null);

/// Holds the resolved auth state as a simple enum value.
enum AuthStatus { unknown, authenticated, unauthenticated }

final authStatusProvider = StateProvider<AuthStatus>((ref) => AuthStatus.unknown);

/// One-shot auth check provider. Runs exactly ONCE when invoked.
final authCheckProvider = FutureProvider<UserModel?>((ref) async {
  dev.log('AUTH CHECK STARTED');
  final service = ref.read(authServiceProvider);
  try {
    final user = await service.getCurrentUser();
    if (user != null) {
      dev.log('AUTH CHECK SUCCESS — user: ${user.email}');
      ref.read(currentUserProvider.notifier).state = user;
      ref.read(authStatusProvider.notifier).state = AuthStatus.authenticated;
    } else {
      dev.log('AUTH CHECK 401 — no user');
      ref.read(authStatusProvider.notifier).state = AuthStatus.unauthenticated;
    }
    return user;
  } catch (e) {
    dev.log('AUTH CHECK FAILED — $e');
    ref.read(authStatusProvider.notifier).state = AuthStatus.unauthenticated;
    rethrow;
  }
});

// ────────────────────────────────────────────
// Dashboard Data
// ────────────────────────────────────────────

final dashboardProvider = FutureProvider.autoDispose((ref) async {
  final service = ref.watch(dashboardServiceProvider);
  return service.fetchDashboard();
});

// ────────────────────────────────────────────
// Market Data (via backend polling)
// ────────────────────────────────────────────

final marketDataProvider = StreamProvider.autoDispose.family<List<dynamic>, List<String>>((ref, symbols) {
  final service = ref.watch(marketServiceProvider);
  service.startPolling(symbols: symbols);
  ref.onDispose(() => service.stopPolling());
  return service.tickerStream;
});

// ────────────────────────────────────────────
// Trading
// ────────────────────────────────────────────

final positionsProvider = FutureProvider.autoDispose((ref) async {
  final service = ref.watch(tradingServiceProvider);
  return service.getPositions();
});

final ordersProvider = FutureProvider.autoDispose((ref) async {
  final service = ref.watch(tradingServiceProvider);
  return service.getOrders();
});

final tradeHistoryProvider = FutureProvider.autoDispose((ref) async {
  final service = ref.watch(tradingServiceProvider);
  return service.getTradeHistory();
});

// ────────────────────────────────────────────
// AI Agents
// ────────────────────────────────────────────

final agentsProvider = FutureProvider.autoDispose((ref) async {
  final service = ref.watch(agentServiceProvider);
  return service.getAgents();
});

final signalsProvider = FutureProvider.autoDispose((ref) async {
  final service = ref.watch(agentServiceProvider);
  return service.getSignals();
});

// ────────────────────────────────────────────
// Notifications
// ────────────────────────────────────────────

final notificationsProvider = FutureProvider.autoDispose((ref) async {
  final service = ref.watch(notificationServiceProvider);
  return service.getNotifications();
});

// ────────────────────────────────────────────
// Settings
// ────────────────────────────────────────────

final settingsProvider = FutureProvider.autoDispose((ref) async {
  final service = ref.watch(settingsServiceProvider);
  return service.getSettings();
});

// Selected symbol for trading/scanner
final selectedSymbolProvider = StateProvider<String>((ref) => 'BTCUSDT');

// Selected timeframe
final selectedTimeframeProvider = StateProvider<String>((ref) => '60');
