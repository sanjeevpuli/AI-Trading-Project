// lib/screens/notifications/notifications_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../theme/app_colors.dart';
import '../../providers/providers.dart';
import '../../models/notification.dart';

class NotificationsScreen extends ConsumerWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final notifsAsync = ref.watch(notificationsProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Notifications'),
        actions: [
          notifsAsync.when(
            data: (notifs) => notifs.any((n) => !n.isRead)
                ? TextButton(
                    onPressed: () async {
                      final service = ref.read(notificationServiceProvider);
                      await service.markAllAsRead();
                      ref.invalidate(notificationsProvider);
                    },
                    child: const Text('Mark all read'),
                  )
                : const SizedBox.shrink(),
            loading: () => const SizedBox.shrink(),
            error: (_, __) => const SizedBox.shrink(),
          ),
        ],
      ),
      body: RefreshIndicator(
        color: AppColors.cyan,
        backgroundColor: AppColors.surface,
        onRefresh: () async => ref.invalidate(notificationsProvider),
        child: notifsAsync.when(
          loading: () => const Center(child: CircularProgressIndicator(color: AppColors.cyan)),
          error: (_, __) => const Center(
            child: Text('Failed to load notifications', style: TextStyle(color: AppColors.textMuted)),
          ),
          data: (notifs) {
            if (notifs.isEmpty) {
              return const Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(Icons.notifications_off_outlined, color: AppColors.textMuted, size: 64),
                    SizedBox(height: 16),
                    Text('No notifications', style: TextStyle(color: AppColors.textPrimary, fontSize: 16, fontWeight: FontWeight.w600)),
                    SizedBox(height: 8),
                    Text('System and trade alerts will appear here.', style: TextStyle(color: AppColors.textMuted)),
                  ],
                ),
              );
            }

            return ListView.separated(
              padding: const EdgeInsets.all(16),
              separatorBuilder: (_, __) => const SizedBox(height: 8),
              itemCount: notifs.length,
              itemBuilder: (_, i) => _NotificationTile(
                notification: notifs[i],
                onMarkRead: () async {
                  if (!notifs[i].isRead) {
                    final service = ref.read(notificationServiceProvider);
                    await service.markAsRead(notifs[i].id);
                    ref.invalidate(notificationsProvider);
                  }
                },
                onDelete: () async {
                  final service = ref.read(notificationServiceProvider);
                  await service.deleteNotification(notifs[i].id);
                  ref.invalidate(notificationsProvider);
                },
              ),
            );
          },
        ),
      ),
    );
  }
}

class _NotificationTile extends StatelessWidget {
  final NotificationModel notification;
  final VoidCallback onMarkRead;
  final VoidCallback onDelete;

  const _NotificationTile({
    required this.notification,
    required this.onMarkRead,
    required this.onDelete,
  });

  @override
  Widget build(BuildContext context) {
    final color = _typeColor(notification.type);
    final icon = _typeIcon(notification.type);
    final isRead = notification.isRead;

    return Dismissible(
      key: Key(notification.id),
      direction: DismissDirection.endToStart,
      background: Container(
        alignment: Alignment.centerRight,
        padding: const EdgeInsets.only(right: 20),
        decoration: BoxDecoration(
          color: AppColors.loss.withAlpha(26),
          borderRadius: BorderRadius.circular(14),
        ),
        child: const Icon(Icons.delete_outline, color: AppColors.loss),
      ),
      onDismissed: (_) => onDelete(),
      child: GestureDetector(
        onTap: onMarkRead,
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: isRead ? AppColors.surface : color.withAlpha(13),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: isRead ? AppColors.surfaceVariant : color.withAlpha(51),
            ),
          ),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: color.withAlpha(26),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(icon, color: color, size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: Text(
                            notification.title,
                            style: TextStyle(
                              color: AppColors.textPrimary,
                              fontWeight: isRead ? FontWeight.w500 : FontWeight.w700,
                              fontSize: 13,
                            ),
                          ),
                        ),
                        if (!isRead)
                          Container(
                            width: 8,
                            height: 8,
                            decoration: BoxDecoration(color: color, shape: BoxShape.circle),
                          ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      notification.message,
                      style: const TextStyle(color: AppColors.textSecondary, fontSize: 12, height: 1.4),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      _formatDate(notification.createdAt),
                      style: const TextStyle(color: AppColors.textMuted, fontSize: 10),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Color _typeColor(String type) {
    switch (type) {
      case 'TRADE_EXECUTED': return AppColors.profit;
      case 'STOP_LOSS_HIT': return AppColors.loss;
      case 'TAKE_PROFIT_HIT': return AppColors.profit;
      case 'AI_CONSENSUS': return AppColors.agentConsensus;
      case 'RISK_ALERT': return AppColors.warning;
      case 'PORTFOLIO_ALERT': return AppColors.blue;
      default: return AppColors.textMuted;
    }
  }

  IconData _typeIcon(String type) {
    switch (type) {
      case 'TRADE_EXECUTED': return Icons.receipt_long_outlined;
      case 'STOP_LOSS_HIT': return Icons.stop_circle_outlined;
      case 'TAKE_PROFIT_HIT': return Icons.check_circle_outline;
      case 'AI_CONSENSUS': return Icons.psychology_outlined;
      case 'RISK_ALERT': return Icons.warning_amber_outlined;
      case 'PORTFOLIO_ALERT': return Icons.pie_chart_outline;
      default: return Icons.notifications_outlined;
    }
  }

  String _formatDate(String timestamp) {
    try {
      final dt = DateTime.parse(timestamp);
      final now = DateTime.now();
      final diff = now.difference(dt);
      if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
      if (diff.inHours < 24) return '${diff.inHours}h ago';
      return DateFormat('MMM d, HH:mm').format(dt);
    } catch (_) {
      return timestamp;
    }
  }
}
