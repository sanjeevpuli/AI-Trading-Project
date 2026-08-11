// lib/widgets/common/pnl_badge.dart
import 'package:flutter/material.dart';
import '../../theme/app_colors.dart';

class PnlBadge extends StatelessWidget {
  final double pnl;
  final double? pnlPercent;
  final bool large;

  const PnlBadge({super.key, required this.pnl, this.pnlPercent, this.large = false});

  @override
  Widget build(BuildContext context) {
    final isProfit = pnl >= 0;
    final color = isProfit ? AppColors.profit : AppColors.loss;
    final sign = isProfit ? '+' : '';
    final size = large ? 16.0 : 13.0;

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withAlpha(26),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: color.withAlpha(51)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            isProfit ? Icons.arrow_upward : Icons.arrow_downward,
            size: size - 2,
            color: color,
          ),
          const SizedBox(width: 3),
          Text(
            '$sign\$${pnl.abs().toStringAsFixed(2)}',
            style: TextStyle(
              color: color,
              fontSize: size,
              fontWeight: FontWeight.w700,
              fontFamily: 'monospace',
            ),
          ),
          if (pnlPercent != null) ...[
            const SizedBox(width: 4),
            Text(
              '($sign${pnlPercent!.abs().toStringAsFixed(2)}%)',
              style: TextStyle(
                color: color.withAlpha(180),
                fontSize: size - 2,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ],
      ),
    );
  }
}
