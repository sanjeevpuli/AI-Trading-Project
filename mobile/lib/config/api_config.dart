// lib/config/api_config.dart
class ApiConfig {
  // Change this to your deployed backend URL or local IP for device testing
  // For emulator: http://10.0.2.2:3000
  // For physical device on same network: http://192.168.x.x:3000
  // For production: https://your-domain.com
  static const bool useEmulator = false; // Set to true for emulator, false for physical device
  static const String baseUrl = 'http://127.0.0.1:3000';

  // Auth
  static const String login = '/api/auth/login';
  static const String signup = '/api/auth/signup';
  static const String logout = '/api/auth/logout';
  static const String me = '/api/auth/me';
  static const String forgotPassword = '/api/auth/forgot-password';
  static const String resetPassword = '/api/auth/reset-password';

  // Core Data
  static const String dashboard = '/api/dashboard';
  static const String portfolio = '/api/portfolio';
  static const String positions = '/api/positions';
  static const String trades = '/api/trades';
  static const String orders = '/api/orders';
  static const String watchlist = '/api/watchlist';

  // Market Data (via backend Market Data Agent – NOT direct Binance)
  static const String market = '/api/market';

  // AI
  static const String signals = '/api/signals';
  static const String agents = '/api/agents';

  // User
  static const String notifications = '/api/notifications';
  static const String settings = '/api/settings';

  // Timeouts
  static const int connectTimeout = 15000;
  static const int receiveTimeout = 30000;

  // Polling interval for live prices (ms) — matches backend polling cadence
  static const int marketPollIntervalMs = 5000;
}
