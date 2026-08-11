// lib/screens/dashboard/dashboard_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import '../../theme/app_colors.dart';
import '../../providers/providers.dart';
import '../../widgets/common/stat_card.dart';
import '../../widgets/common/pnl_badge.dart';
import '../../widgets/trading/position_card.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dashAsync = ref.watch(dashboardProvider);
    final user = ref.watch(currentUserProvider);
    final fmt = NumberFormat.currency(symbol: '\$', decimalDigits: 2);

    return Scaffold(
      backgroundColor: AppColors.background,
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
                const Icon(Icons.signal_wifi_off, color: AppColors.textMuted, size: 48),
                const SizedBox(height: 16),
                Text('Failed to load dashboard', style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 8),
                TextButton(onPressed: () => ref.invalidate(dashboardProvider), child: const Text('Retry')),
              ],
            ),
          ),
          data: (data) {
            final portfolio = data.portfolio;
            final positions = data.activePositions;
            final history = data.executionHistory.take(5).toList();

            return CustomScrollView(
              slivers: [
                // App Bar
                SliverAppBar(
                  expandedHeight: 120,
                  floating: true,
                  pinned: true,
                  backgroundColor: AppColors.background,
                  surfaceTintColor: Colors.transparent,
                  flexibleSpace: FlexibleSpaceBar(
                    titlePadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                    title: Column(
                      mainAxisAlignment: MainAxisAlignment.end,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Good ${_greeting()}, ${user?.email.split('@').first ?? 'Trader'}',
                          style: const TextStyle(color: AppColors.textMuted, fontSize: 12),
                        ),
                        const Text(
                          'Trading Dashboard',
                          style: TextStyle(color: AppColors.textPrimary, fontSize: 18, fontWeight: FontWeight.w800),
                        ),
                      ],
                    ),
                  ),
                  actions: [
                    IconButton(
                      icon: const Icon(Icons.notifications_outlined),
                      onPressed: () => context.go('/notifications'),
                    ),
                    IconButton(
                      icon: const Icon(Icons.account_circle_outlined),
                      onPressed: () => context.go('/profile'),
                    ),
                  ],
                ),

                SliverPadding(
                  padding: const EdgeInsets.all(20),
                  sliver: SliverList(
                    delegate: SliverChildListDelegate([

                      // Portfolio Value Card
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
                            const Row(
                              children: [
                                Icon(Icons.account_balance_wallet_outlined, color: AppColors.cyan, size: 16),
                                SizedBox(width: 6),
                                Text('Portfolio Value', style: TextStyle(color: AppColors.cyan, fontSize: 12, fontWeight: FontWeight.w500)),
                              ],
                            ),
                            const SizedBox(height: 12),
                            Text(
                              portfolio != null ? fmt.format(portfolio.balance) : '\$100,000.00',
                              style: const TextStyle(color: AppColors.textPrimary, fontSize: 36, fontWeight: FontWeight.w800, fontFamily: 'monospace'),
                            ),
                            const SizedBox(height: 8),
                            if (portfolio != null)
                              PnlBadge(
                                pnl: portfolio.totalPnL,
                                pnlPercent: portfolio.totalPnLPercent,
                                large: true,
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
                          StatCard(
                            label: 'WIN RATE',
                            value: portfolio?.winRate ?? '0.0%',
                            valueColor: AppColors.profit,
                            icon: Icons.emoji_events_outlined,
                          ),
                          StatCard(
                            label: 'SHARPE RATIO',
                            value: portfolio?.sharpeRatio.toStringAsFixed(2) ?? '0.00',
                            icon: Icons.trending_up,
                          ),
                          StatCard(
                            label: 'MAX DRAWDOWN',
                            value: portfolio?.maxDrawdown ?? '0.00%',
                            valueColor: AppColors.loss,
                            icon: Icons.trending_down,
                          ),
                          StatCard(
                            label: 'LEVERAGE',
                            value: portfolio?.systemLeverage ?? '1.00x',
                            icon: Icons.speed_outlined,
                          ),
                        ],
                      ),

                      const SizedBox(height: 24),

                      // AI Consensus Banner
                      _AiConsensusBanner(onTap: () => context.go('/agents')),

                      const SizedBox(height: 24),

                      // Active Positions
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Active Positions', style: TextStyle(color: AppColors.textPrimary, fontSize: 16, fontWeight: FontWeight.w700)),
                          TextButton(onPressed: () => context.go('/positions'), child: const Text('View all')),
                        ],
                      ),
                      const SizedBox(height: 12),
                      if (positions.isEmpty)
                        _EmptyState(icon: Icons.inbox_outlined, label: 'No open positions', action: 'Start Trading', onAction: () => context.go('/trading'))
                      else
                        ...positions.take(3).map((p) => PositionCard(position: p)),

                      const SizedBox(height: 24),

                      // Recent Trades
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Recent Trades', style: TextStyle(color: AppColors.textPrimary, fontSize: 16, fontWeight: FontWeight.w700)),
                          TextButton(onPressed: () => context.go('/history'), child: const Text('View all')),
                        ],
                      ),
                      const SizedBox(height: 12),
                      if (history.isEmpty)
                        const _EmptyState(icon: Icons.history, label: 'No trade history yet')
                      else
                        ...history.map((t) => _TradeRow(trade: t)),

                      const SizedBox(height: 40),
                    ]),
                  ),
                ),
              ],
            );
          },
        ),
      ),
    );
  }

  String _greeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  }
}

class _AiConsensusBanner extends ConsumerWidget {
  final VoidCallback onTap;
  const _AiConsensusBanner({required this.onTap});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final signalsAsync = ref.watch(signalsProvider);

    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.cyan.withAlpha(51)),
        ),
        child: signalsAsync.when(
          loading: () => const Row(
            children: [
              Icon(Icons.psychology, color: AppColors.cyan, size: 20),
              SizedBox(width: 10),
              Text('AI Consensus loading...', style: TextStyle(color: AppColors.textMuted)),
            ],
          ),
          error: (_, __) => const Row(
            children: [
              Icon(Icons.psychology, color: AppColors.textMuted, size: 20),
              SizedBox(width: 10),
              Text('AI Consensus unavailable', style: TextStyle(color: AppColors.textMuted)),
            ],
          ),
          data: (signals) {
            final consensus = signals.consensus;
            final isLong = consensus.type == 'LONG' || consensus.type == 'BUY';
            final isShort = consensus.type == 'SHORT' || consensus.type == 'SELL';
            final color = isLong ? AppColors.profit : (isShort ? AppColors.loss : AppColors.textMuted);

            return Row(
              children: [
                const Icon(Icons.psychology, color: AppColors.cyan, size: 20),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('AI Consensus', style: TextStyle(color: AppColors.textMuted, fontSize: 11)),
                      Text(
                        '${consensus.type} · ${consensus.confidence}% confidence',
                        style: TextStyle(color: color, fontSize: 14, fontWeight: FontWeight.w700),
                      ),
                    ],
                  ),
                ),
                Container(
                  width: 48,
                  height: 48,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: color.withAlpha(26),
                    border: Border.all(color: color.withAlpha(77)),
                  ),
                  child: Center(
                    child: Text(
                      '${consensus.confidence}%',
                      style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.w800),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                const Icon(Icons.chevron_right, color: AppColors.textMuted, size: 18),
              ],
            );
          },
        ),
      ),
    );
  }
}

class _TradeRow extends StatelessWidget {
  final dynamic trade;
  const _TradeRow({required this.trade});

  @override
  Widget build(BuildContext context) {
    final isProfit = trade.pnl >= 0;
    final color = isProfit ? AppColors.profit : AppColors.loss;

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.surfaceVariant),
      ),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              color: color.withAlpha(26),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(
              isProfit ? Icons.trending_up : Icons.trending_down,
              color: color,
              size: 18,
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(trade.symbol, style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.w600, fontSize: 13)),
                Text(trade.exitReason ?? trade.type, style: const TextStyle(color: AppColors.textMuted, fontSize: 11)),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(
                '${isProfit ? '+' : ''}\$${trade.pnl.abs().toStringAsFixed(2)}',
                style: TextStyle(color: color, fontWeight: FontWeight.w700, fontSize: 13),
              ),
              Text(
                '${isProfit ? '+' : ''}${trade.pnlPercentage.toStringAsFixed(2)}%',
                style: TextStyle(color: color.withAlpha(180), fontSize: 11),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  final IconData icon;
  final String label;
  final String? action;
  final VoidCallback? onAction;

  const _EmptyState({required this.icon, required this.label, this.action, this.onAction});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 32),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.surfaceVariant),
      ),
      child: Column(
        children: [
          Icon(icon, color: AppColors.textMuted, size: 40),
          const SizedBox(height: 12),
          Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 14)),
          if (action != null && onAction != null) ...[
            const SizedBox(height: 16),
            TextButton(onPressed: onAction, child: Text(action!)),
          ],
        ],
      ),
    );
  }
}
