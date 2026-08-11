// lib/screens/history/history_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../theme/app_colors.dart';
import '../../providers/providers.dart';

class HistoryScreen extends ConsumerWidget {
  const HistoryScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final historyAsync = ref.watch(tradeHistoryProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Trade History'),
        actions: [
          IconButton(icon: const Icon(Icons.refresh), onPressed: () => ref.invalidate(tradeHistoryProvider)),
        ],
      ),
      body: RefreshIndicator(
        color: AppColors.cyan,
        backgroundColor: AppColors.surface,
        onRefresh: () async => ref.invalidate(tradeHistoryProvider),
        child: historyAsync.when(
          loading: () => const Center(child: CircularProgressIndicator(color: AppColors.cyan)),
          error: (_, __) => const Center(
            child: Text('Failed to load history', style: TextStyle(color: AppColors.textMuted)),
          ),
          data: (trades) {
            if (trades.isEmpty) {
              return const Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.history, color: AppColors.textMuted, size: 64),
                    SizedBox(height: 16),
                    Text('No trade history yet', style: TextStyle(color: AppColors.textPrimary, fontSize: 16, fontWeight: FontWeight.w600)),
                    SizedBox(height: 8),
                    Text('Closed trades will appear here.', style: TextStyle(color: AppColors.textMuted)),
                  ],
                ),
              );
            }

            // Summary stats
            final wins = trades.where((t) => t.pnl > 0).length;
            final total = trades.length;
            final totalPnL = trades.fold(0.0, (sum, t) => sum + t.pnl);

            return Column(
              children: [
                // Stats header
                Container(
                  padding: const EdgeInsets.all(16),
                  color: AppColors.surface,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceAround,
                    children: [
                      _SummaryChip(label: 'Total Trades', value: '$total'),
                      _SummaryChip(label: 'Win Rate', value: '${total > 0 ? (wins / total * 100).toStringAsFixed(1) : 0}%', color: AppColors.profit),
                      _SummaryChip(
                        label: 'Total P&L',
                        value: '${totalPnL >= 0 ? '+' : ''}\$${totalPnL.abs().toStringAsFixed(2)}',
                        color: totalPnL >= 0 ? AppColors.profit : AppColors.loss,
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: ListView.separated(
                    padding: const EdgeInsets.all(16),
                    separatorBuilder: (_, __) => const SizedBox(height: 8),
                    itemCount: trades.length,
                    itemBuilder: (_, i) {
                      final t = trades[i];
                      final isProfit = t.pnl >= 0;
                      final color = isProfit ? AppColors.profit : AppColors.loss;
                      final dateStr = _formatDate(t.timestamp);

                      return Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: AppColors.surface,
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(color: color.withAlpha(26)),
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 42,
                              height: 42,
                              decoration: BoxDecoration(
                                color: color.withAlpha(26),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Icon(
                                isProfit ? Icons.trending_up : Icons.trending_down,
                                color: color,
                                size: 20,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Text(t.asset, style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.w700, fontSize: 14)),
                                      const SizedBox(width: 6),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: (t.type == 'LONG' ? AppColors.profit : AppColors.loss).withAlpha(26),
                                          borderRadius: BorderRadius.circular(4),
                                        ),
                                        child: Text(t.type, style: TextStyle(color: t.type == 'LONG' ? AppColors.profit : AppColors.loss, fontSize: 9, fontWeight: FontWeight.w800)),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    '${t.exitReason ?? 'Manual'} · $dateStr',
                                    style: const TextStyle(color: AppColors.textMuted, fontSize: 11),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    'Entry: \$${t.entryPrice.toStringAsFixed(2)} → Exit: \$${t.exitPrice?.toStringAsFixed(2) ?? 'N/A'}',
                                    style: const TextStyle(color: AppColors.textMuted, fontSize: 11, fontFamily: 'monospace'),
                                  ),
                                ],
                              ),
                            ),
                            Column(
                              crossAxisAlignment: CrossAxisAlignment.end,
                              children: [
                                Text(
                                  '${isProfit ? '+' : ''}\$${t.pnl.abs().toStringAsFixed(2)}',
                                  style: TextStyle(color: color, fontWeight: FontWeight.w800, fontSize: 15),
                                ),
                                Text(
                                  '${isProfit ? '+' : ''}${t.pnlPercentage.toStringAsFixed(2)}%',
                                  style: TextStyle(color: color.withAlpha(180), fontSize: 11),
                                ),
                              ],
                            ),
                          ],
                        ),
                      );
                    },
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }

  String _formatDate(String timestamp) {
    try {
      final dt = DateTime.parse(timestamp);
      return DateFormat('MMM d, HH:mm').format(dt);
    } catch (_) {
      return timestamp;
    }
  }
}

class _SummaryChip extends StatelessWidget {
  final String label;
  final String value;
  final Color? color;
  const _SummaryChip({required this.label, required this.value, this.color});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(value, style: TextStyle(color: color ?? AppColors.textPrimary, fontWeight: FontWeight.w800, fontSize: 16)),
        const SizedBox(height: 2),
        Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 10)),
      ],
    );
  }
}
