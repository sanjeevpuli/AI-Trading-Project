// lib/main.dart
import 'dart:developer' as dev;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'network/api_client.dart';
import 'providers/providers.dart';
import 'theme/app_theme.dart';
import 'routing/app_router.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  dev.log('APP START — main()');

  SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);
  SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
    statusBarColor: Colors.transparent,
    statusBarIconBrightness: Brightness.light,
    systemNavigationBarColor: Color(0xFF18181B),
    systemNavigationBarIconBrightness: Brightness.light,
  ));

  ApiClient? apiClient;
  try {
    dev.log('API CLIENT INIT STARTED');
    apiClient = await ApiClient.getInstance();
    dev.log('API CLIENT READY');
    dev.log('COOKIEJAR READY');
  } catch (e, stack) {
    dev.log('API CLIENT INIT FAILED: $e', error: e, stackTrace: stack);
  }

  runApp(
    ProviderScope(
      overrides: [
        if (apiClient != null) apiClientProvider.overrideWithValue(apiClient),
      ],
      child: const QuantAIApp(),
    ),
  );
}

class QuantAIApp extends ConsumerWidget {
  const QuantAIApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final router = ref.watch(routerProvider);

    return MaterialApp.router(
      title: 'QuantAI — AI Trading Platform',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.dark,
      routerConfig: router,
    );
  }
}
