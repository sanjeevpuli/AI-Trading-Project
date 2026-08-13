// lib/screens/positions/positions_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../theme/app_colors.dart';
import '../../providers/providers.dart';
import '../../widgets/trading/position_card.dart';

class PositionsScreen extends ConsumerWidget {
  const PositionsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final positionsAsync = ref.watch(positionsProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Open Positions'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.invalidate(positionsProvider),
          ),
        ],
      ),
      body: RefreshIndicator(
        color: AppColors.cyan,
        backgroundColor: AppColors.surface,
        onRefresh: () async => ref.invalidate(positionsProvider),
        child: positionsAsync.when(
          loading: () => const Center(child: CircularProgressIndicator(color: AppColors.cyan)),
          error: (_, __) => const Center(
            child: Text('Failed to load positions', style: TextStyle(color: AppColors.textMuted)),
          ),
          data: (positions) {
            if (positions.isEmpty) {
              return const Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.inbox_outlined, color: AppColors.textMuted, size: 64),
                    SizedBox(height: 16),
                    Text('No open positions', style: TextStyle(color: AppColors.textPrimary, fontSize: 16, fontWeight: FontWeight.w600)),
                    SizedBox(height: 8),
                    Text('Your positions will appear here once opened.', style: TextStyle(color: AppColors.textMuted)),
                  ],
                ),
              );
            }

            // Summary bar
            final totalPnL = positions.fold(0.0, (sum, p) => sum + p.pnl);
            final isProfit = totalPnL >= 0;

            return Column(
              children: [
                // Summary Header
                Container(
                  padding: const EdgeInsets.all(16),
                  color: AppColors.surface,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('${positions.length} Position${positions.length != 1 ? 's' : ''}',
                          style: const TextStyle(color: AppColors.textMuted, fontSize: 12)),
                      Row(
                        children: [
                          const Text('Total P&L: ', style: TextStyle(color: AppColors.textMuted, fontSize: 12)),
                          Text(
                            '${isProfit ? '+' : ''}\$${totalPnL.abs().toStringAsFixed(2)}',
                            style: TextStyle(
                              color: isProfit ? AppColors.profit : AppColors.loss,
                              fontWeight: FontWeight.w700,
                              fontSize: 14,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: ListView.builder(
                    padding: const EdgeInsets.all(20),
                    itemCount: positions.length,
                    itemBuilder: (_, i) => PositionCard(
                      position: positions[i],
                      onClose: () async {
                        final confirm = await showDialog<bool>(
                          context: context,
                          builder: (ctx) => AlertDialog(
                            backgroundColor: AppColors.surface,
                            title: const Text('Close Position?', style: TextStyle(color: AppColors.textPrimary)),
                            content: Text(
                              'Close ${positions[i].type} ${positions[i].asset} at market price?',
                              style: const TextStyle(color: AppColors.textSecondary),
                            ),
                            actions: [
                              TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
                              ElevatedButton(
                                onPressed: () => Navigator.pop(ctx, true),
                                style: ElevatedButton.styleFrom(backgroundColor: AppColors.loss),
                                child: const Text('Close'),
                              ),
                            ],
                          ),
                        );
                        if (confirm == true) {
                          final service = ref.read(tradingServiceProvider);
                          await service.closePosition(
                            positions[i].id, 
                            reason: "MANUAL",
                          );
                          ref.invalidate(positionsProvider);
                        }
                      },
                    ),
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}
