import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../theme/app_colors.dart';
import '../../providers/providers.dart';
import '../../widgets/common/stat_card.dart';
import '../../widgets/common/pnl_badge.dart';

class PortfolioScreen extends ConsumerWidget {
  const PortfolioScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dashAsync = ref.watch(dashboardProvider);
    final fmt = NumberFormat.currency(symbol: '\$', decimalDigits: 2);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Portfolio'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () => ref.invalidate(dashboardProvider),
          ),
        ],
      ),
      body: RefreshIndicator(
        color: AppColors.cyan,
        backgroundColor: AppColors.surface,
        onRefresh: () async => ref.invalidate(dashboardProvider),
        child: dashAsync.when(
          loading: () => const Center(child: CircularProgressIndicator(color: AppColors.cyan)),
          error: (e, _) => Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline, color: AppColors.textMuted, size: 48),
                const SizedBox(height: 16),
                TextButton(onPressed: () => ref.invalidate(dashboardProvider), child: const Text('Retry')),
              ],
            ),
          ),
          data: (data) {
            final p = data.portfolio;
            if (p == null) {
              return const Center(child: Text('Portfolio not initialized', style: TextStyle(color: AppColors.textMuted)));
            }

            return ListView(
              padding: const EdgeInsets.all(20),
              children: [
                // Portfolio Value
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF0F172A), Color(0xFF164E63)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: AppColors.cyan.withAlpha(77)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Total Portfolio Value', style: TextStyle(color: AppColors.cyan, fontSize: 12)),
                      const SizedBox(height: 8),
                      Text(
                        fmt.format(p.balance),
                        style: const TextStyle(color: AppColors.textPrimary, fontSize: 34, fontWeight: FontWeight.w800, fontFamily: 'monospace'),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          PnlBadge(pnl: p.unrealizedPnL, pnlPercent: p.totalPnLPercent),
                          const SizedBox(width: 10),
                          Text(
                            'Unrealized P&L',
                            style: TextStyle(color: AppColors.textMuted.withAlpha(180), fontSize: 11),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          PnlBadge(pnl: p.realizedPnL),
                          const SizedBox(width: 10),
                          Text(
                            'Realized P&L',
                            style: TextStyle(color: AppColors.textMuted.withAlpha(180), fontSize: 11),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 20),

                // Stats Grid
                GridView.count(
                  crossAxisCount: 2,
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: 1.6,
                  children: [
                    StatCard(label: 'WIN RATE', value: p.winRate, valueColor: AppColors.profit, icon: Icons.emoji_events_outlined),
                    StatCard(label: 'SHARPE RATIO', value: p.sharpeRatio.toStringAsFixed(2), icon: Icons.trending_up),
                    StatCard(label: 'MAX DRAWDOWN', value: p.maxDrawdown, valueColor: AppColors.loss, icon: Icons.trending_down),
                    StatCard(label: 'EXPOSURE', value: p.netExposure, icon: Icons.radar),
                    StatCard(label: 'LEVERAGE', value: p.systemLeverage, icon: Icons.speed_outlined),
                    StatCard(label: 'MARGIN', value: p.marginLevel, valueColor: AppColors.profit, icon: Icons.health_and_safety_outlined),
                  ],
                ),
                const SizedBox(height: 24),

                // Equity Curve placeholder
                Container(
                  height: 200,
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.surfaceVariant),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Equity Curve', style: TextStyle(color: AppColors.textPrimary, fontSize: 14, fontWeight: FontWeight.w700)),
                      const SizedBox(height: 16),
                      if (data.metrics.isEmpty)
                        const Expanded(
                          child: Center(child: Text('Awaiting trading history...', style: TextStyle(color: AppColors.textMuted))),
                        )
                      else
                        Expanded(child: _MiniEquityCurve(metrics: data.metrics)),
                    ],
                  ),
                ),
                const SizedBox(height: 40),
              ],
            );
          },
        ),
      ),
    );
  }
}

class _MiniEquityCurve extends StatelessWidget {
  final List<Map<String, dynamic>> metrics;
  const _MiniEquityCurve({required this.metrics});

  @override
  Widget build(BuildContext context) {
    if (metrics.isEmpty) return const SizedBox.shrink();

    final spots = <FlSpot>[];
    for (var i = 0; i < metrics.length; i++) {
      final val = (metrics[i]['totalValue'] as num?)?.toDouble() ?? 100000.0;
      spots.add(FlSpot(i.toDouble(), val));
    }

    final min = spots.map((e) => e.y).reduce((a, b) => a < b ? a : b);
    final max = spots.map((e) => e.y).reduce((a, b) => a > b ? a : b);
    final padding = (max - min) * 0.1;

    return LineChart(
      LineChartData(
        minX: 0,
        maxX: (metrics.length - 1).toDouble(),
        minY: min - padding,
        maxY: max + padding,
        gridData: FlGridData(
          show: true,
          drawVerticalLine: false,
          horizontalInterval: ((max - min) / 3).clamp(1.0, double.infinity),
          getDrawingHorizontalLine: (value) => const FlLine(
            color: AppColors.surfaceVariant,
            strokeWidth: 1,
            dashArray: [5, 5],
          ),
        ),
        titlesData: const FlTitlesData(show: false),
        borderData: FlBorderData(show: false),
        lineTouchData: LineTouchData(
          touchTooltipData: LineTouchTooltipData(
            tooltipRoundedRadius: 8,
            getTooltipItems: (touchedSpots) {
              return touchedSpots.map((spot) {
                return LineTooltipItem(
                  '\$${spot.y.toStringAsFixed(2)}',
                  const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                );
              }).toList();
            },
          ),
        ),
        lineBarsData: [
          LineChartBarData(
            spots: spots,
            isCurved: true,
            color: AppColors.cyan,
            barWidth: 2,
            isStrokeCapRound: true,
            dotData: const FlDotData(show: false),
            belowBarData: BarAreaData(
              show: true,
              gradient: LinearGradient(
                colors: [
                  AppColors.cyan.withAlpha(77),
                  AppColors.cyan.withAlpha(0),
                ],
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
