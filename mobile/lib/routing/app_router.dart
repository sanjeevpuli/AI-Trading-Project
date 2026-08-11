// lib/routing/app_router.dart
import 'dart:developer' as dev;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../providers/providers.dart';
import '../screens/splash/splash_screen.dart';
import '../screens/auth/login_screen.dart';
import '../screens/auth/signup_screen.dart';
import '../screens/auth/forgot_password_screen.dart';
import '../screens/auth/reset_password_screen.dart';
import '../screens/dashboard/dashboard_screen.dart';
import '../screens/trading/trading_screen.dart';
import '../screens/portfolio/portfolio_screen.dart';
import '../screens/scanner/scanner_screen.dart';
import '../screens/agents/agents_screen.dart';
import '../screens/backtesting/backtesting_screen.dart';
import '../screens/notifications/notifications_screen.dart';
import '../screens/watchlist/watchlist_screen.dart';
import '../screens/positions/positions_screen.dart';
import '../screens/history/history_screen.dart';
import '../screens/settings/settings_screen.dart';
import '../screens/profile/profile_screen.dart';
import '../widgets/common/scaffold_with_nav.dart';

final routerProvider = Provider<GoRouter>((ref) {
  // Watch the simple state provider — NOT the FutureProvider.
  // This avoids recreating GoRouter when the async auth check runs.
  // authStatusProvider is a StateProvider that only changes value once
  // (from unknown → authenticated/unauthenticated), so the router
  // is recreated at most once after startup.
  final authStatus = ref.watch(authStatusProvider);

  return GoRouter(
    initialLocation: '/splash',
    redirect: (context, state) {
      final loc = state.matchedLocation;

      // While auth status is unknown, stay on splash
      if (authStatus == AuthStatus.unknown) {
        if (loc != '/splash') return '/splash';
        return null;
      }

      final isAuth = authStatus == AuthStatus.authenticated;
      final isOnAuthRoute = loc == '/login' ||
          loc == '/signup' ||
          loc.startsWith('/forgot-password') ||
          loc.startsWith('/reset-password') ||
          loc == '/splash';

      if (!isAuth && !isOnAuthRoute) {
        dev.log('NAVIGATE LOGIN (redirect: not authenticated)');
        return '/login';
      }
      if (!isAuth && loc == '/splash') {
        dev.log('NAVIGATE LOGIN (redirect: splash → login)');
        return '/login';
      }
      if (isAuth && isOnAuthRoute) {
        dev.log('NAVIGATE DASHBOARD (redirect: authenticated)');
        return '/dashboard';
      }

      return null;
    },
    routes: [
      GoRoute(path: '/splash', builder: (_, __) => const SplashScreen()),
      GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
      GoRoute(path: '/signup', builder: (_, __) => const SignupScreen()),
      GoRoute(path: '/forgot-password', builder: (_, __) => const ForgotPasswordScreen()),
      GoRoute(
        path: '/reset-password',
        builder: (_, state) => ResetPasswordScreen(token: state.uri.queryParameters['token'] ?? ''),
      ),

      // Main Shell with Bottom Nav
      ShellRoute(
        builder: (context, state, child) => ScaffoldWithNav(child: child),
        routes: [
          GoRoute(path: '/dashboard', builder: (_, __) => const DashboardScreen()),
          GoRoute(path: '/trading', builder: (_, __) => const TradingScreen()),
          GoRoute(path: '/portfolio', builder: (_, __) => const PortfolioScreen()),
          GoRoute(path: '/scanner', builder: (_, __) => const ScannerScreen()),
          GoRoute(path: '/agents', builder: (_, __) => const AgentsScreen()),
          GoRoute(path: '/backtesting', builder: (_, __) => const BacktestingScreen()),
          GoRoute(path: '/notifications', builder: (_, __) => const NotificationsScreen()),
          GoRoute(path: '/watchlist', builder: (_, __) => const WatchlistScreen()),
          GoRoute(path: '/positions', builder: (_, __) => const PositionsScreen()),
          GoRoute(path: '/history', builder: (_, __) => const HistoryScreen()),
          GoRoute(path: '/settings', builder: (_, __) => const SettingsScreen()),
          GoRoute(path: '/profile', builder: (_, __) => const ProfileScreen()),
        ],
      ),
    ],
    errorBuilder: (context, state) => Scaffold(
      body: Center(child: Text('Page not found: ${state.error}')),
    ),
  );
});
