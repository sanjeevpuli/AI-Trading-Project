// lib/screens/splash/splash_screen.dart
import 'dart:developer' as dev;
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../theme/app_colors.dart';
import '../../providers/providers.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _fadeAnim;
  late Animation<double> _scaleAnim;
  bool _authStarted = false;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    dev.log('APP START — SplashScreen initState');
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );
    _fadeAnim = CurvedAnimation(parent: _controller, curve: Curves.easeIn);
    _scaleAnim = Tween<double>(begin: 0.8, end: 1.0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOutBack),
    );
    _controller.forward();

    // Kick off auth check exactly once in initState (NOT in build)
    _startAuthCheck();
  }

  Future<void> _startAuthCheck() async {
    if (_authStarted) return; // guard against double-call
    _authStarted = true;
    dev.log('SPLASH — triggering authCheckProvider');

    try {
      // ref.read triggers the FutureProvider once. Because authCheckProvider
      // uses ref.read internally (not ref.watch), it will NOT be re-triggered.
      final user = await ref.read(authCheckProvider.future);
      dev.log('SPLASH — auth resolved: ${user != null ? "authenticated" : "unauthenticated"}');
      // Navigation is handled by GoRouter redirect watching authStatusProvider.
      // No explicit navigation needed here.
    } catch (e) {
      dev.log('SPLASH — auth error: $e');
      if (mounted) {
        setState(() => _errorMessage = 'Connection Error');
      }
    }
  }

  void _retry() {
    setState(() => _errorMessage = null);
    _authStarted = false;
    // Invalidate so the provider can run again
    ref.invalidate(authCheckProvider);
    // Reset authStatus so router stays on splash
    ref.read(authStatusProvider.notifier).state = AuthStatus.unknown;
    _startAuthCheck();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // NO ref.watch or ref.listen on authCheckProvider here.
    // All side effects are in initState/_startAuthCheck.

    return Scaffold(
      backgroundColor: AppColors.background,
      body: Center(
        child: FadeTransition(
          opacity: _fadeAnim,
          child: ScaleTransition(
            scale: _scaleAnim,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Logo
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    color: AppColors.cyan.withAlpha(26),
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: AppColors.cyan.withAlpha(77), width: 1.5),
                  ),
                  child: const Icon(
                    Icons.auto_graph,
                    color: AppColors.cyan,
                    size: 40,
                  ),
                ),
                const SizedBox(height: 24),
                const Text(
                  'QuantAI',
                  style: TextStyle(
                    color: AppColors.textPrimary,
                    fontSize: 32,
                    fontWeight: FontWeight.w800,
                    letterSpacing: -1,
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'AI-Powered Trading Intelligence',
                  style: TextStyle(
                    color: AppColors.textMuted,
                    fontSize: 14,
                    letterSpacing: 0.5,
                  ),
                ),
                const SizedBox(height: 48),
                if (_errorMessage != null)
                  Column(
                    children: [
                      const Icon(Icons.error_outline, color: AppColors.error, size: 32),
                      const SizedBox(height: 12),
                      Text(
                        _errorMessage!,
                        style: const TextStyle(color: AppColors.textPrimary, fontSize: 16),
                      ),
                      const SizedBox(height: 16),
                      ElevatedButton(
                        onPressed: _retry,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.cyan,
                          foregroundColor: Colors.black,
                        ),
                        child: const Text('Retry'),
                      ),
                    ],
                  )
                else
                  const SizedBox(
                    width: 24,
                    height: 24,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      color: AppColors.cyan,
                    ),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
