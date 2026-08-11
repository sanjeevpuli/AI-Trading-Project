// lib/widgets/trading/position_card.dart
import 'package:flutter/material.dart';
import '../../models/position.dart';
import '../../theme/app_colors.dart';
import '../common/pnl_badge.dart';

class PositionCard extends StatelessWidget {
  final PositionModel position;
  final VoidCallback? onClose;

  const PositionCard({super.key, required this.position, this.onClose});

  @override
  Widget build(BuildContext context) {
    final isLong = position.type == 'LONG';
    final typeColor = isLong ? AppColors.profit : AppColors.loss;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.surfaceVariant),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: typeColor.withAlpha(26),
                  borderRadius: BorderRadius.circular(6),
                  border: Border.all(color: typeColor.withAlpha(77)),
                ),
                child: Text(
                  position.type,
                  style: TextStyle(color: typeColor, fontSize: 11, fontWeight: FontWeight.w700),
                ),
              ),
              const SizedBox(width: 8),
              Text(
                position.asset,
                style: const TextStyle(
                  color: AppColors.textPrimary,
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const Spacer(),
              PnlBadge(pnl: position.pnl, pnlPercent: position.pnlPercentage),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              _InfoCell(label: 'Entry', value: '\$${position.entryPrice.toStringAsFixed(2)}'),
              _InfoCell(label: 'Current', value: '\$${position.currentPrice.toStringAsFixed(2)}'),
              _InfoCell(label: 'Amount', value: '${position.amount}'),
            ],
          ),
          if (position.stopLoss != null || position.takeProfit != null) ...[
            const SizedBox(height: 8),
            Row(
              children: [
                if (position.stopLoss != null)
                  _InfoCell(
                    label: 'Stop Loss',
                    value: '\$${position.stopLoss!.toStringAsFixed(2)}',
                    valueColor: AppColors.loss,
                  ),
                if (position.takeProfit != null)
                  _InfoCell(
                    label: 'Take Profit',
                    value: '\$${position.takeProfit!.toStringAsFixed(2)}',
                    valueColor: AppColors.profit,
                  ),
              ],
            ),
          ],
          if (onClose != null) ...[
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                onPressed: onClose,
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.loss,
                  side: const BorderSide(color: AppColors.loss),
                  padding: const EdgeInsets.symmetric(vertical: 10),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                child: const Text('Close Position', style: TextStyle(fontWeight: FontWeight.w600)),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

class _InfoCell extends StatelessWidget {
  final String label;
  final String value;
  final Color? valueColor;

  const _InfoCell({required this.label, required this.value, this.valueColor});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 10)),
          const SizedBox(height: 2),
          Text(
            value,
            style: TextStyle(
              color: valueColor ?? AppColors.textPrimary,
              fontSize: 13,
              fontWeight: FontWeight.w600,
              fontFamily: 'monospace',
            ),
          ),
        ],
      ),
    );
  }
}
