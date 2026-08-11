// lib/screens/scanner/scanner_screen.dart
// Market Scanner — polls backend Market Data Agent every 5s
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../theme/app_colors.dart';
import '../../providers/providers.dart';
import '../../models/market_ticker.dart';

const _scannerSymbols = [
  'BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'ADAUSDT', 'XRPUSDT',
  'DOGEUSDT', 'AVAXUSDT', 'LINKUSDT', 'MATICUSDT', 'DOTUSDT', 'LTCUSDT',
];

class ScannerScreen extends ConsumerWidget {
  const ScannerScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final marketAsync = ref.watch(marketDataProvider(_scannerSymbols));

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Market Scanner'),
        actions: [
          Container(
            margin: const EdgeInsets.only(right: 12),
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: AppColors.profit.withAlpha(26),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: AppColors.profit.withAlpha(51)),
            ),
            child: const Row(
              children: [
                Icon(Icons.circle, size: 6, color: AppColors.profit),
                SizedBox(width: 6),
                Text('LIVE', style: TextStyle(color: AppColors.profit, fontSize: 11, fontWeight: FontWeight.w700)),
              ],
            ),
          ),
        ],
      ),
      body: marketAsync.when(
        loading: () => const Center(child: CircularProgressIndicator(color: AppColors.cyan)),
        error: (e, _) => const Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.signal_wifi_off, color: AppColors.textMuted, size: 48),
              SizedBox(height: 16),
              Text('Market data unavailable', style: TextStyle(color: AppColors.textMuted)),
              SizedBox(height: 8),
              Text('Check backend connection', style: TextStyle(color: AppColors.textMuted, fontSize: 12)),
            ],
          ),
        ),
        data: (rawTickers) {
          // Cast to MarketTicker list
          final tickers = rawTickers.whereType<MarketTicker>().toList();

          return Column(
            children: [
              // Header
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                color: AppColors.surface,
                child: const Row(
                  children: [
                    Expanded(child: Text('SYMBOL', style: TextStyle(color: AppColors.textMuted, fontSize: 10, fontWeight: FontWeight.w600))),
                    SizedBox(
                      width: 100,
                      child: Text('PRICE', textAlign: TextAlign.right, style: TextStyle(color: AppColors.textMuted, fontSize: 10, fontWeight: FontWeight.w600)),
                    ),
                    SizedBox(
                      width: 80,
                      child: Text('24H %', textAlign: TextAlign.right, style: TextStyle(color: AppColors.textMuted, fontSize: 10, fontWeight: FontWeight.w600)),
                    ),
                  ],
                ),
              ),
              Expanded(
                child: ListView.separated(
                  separatorBuilder: (_, __) => const Divider(height: 1, color: AppColors.surfaceVariant),
                  itemCount: tickers.length,
                  itemBuilder: (_, i) => _TickerRow(ticker: tickers[i]),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}

class _TickerRow extends ConsumerWidget {
  final MarketTicker ticker;
  const _TickerRow({required this.ticker});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isPositive = ticker.isPositive;
    final color = isPositive ? AppColors.profit : AppColors.loss;

    return InkWell(
      onTap: () {
        ref.read(selectedSymbolProvider.notifier).state = ticker.symbol;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${ticker.asset} selected for trading'),
            backgroundColor: AppColors.surface,
            duration: const Duration(seconds: 2),
          ),
        );
      },
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
        child: Row(
          children: [
            // Asset icon placeholder
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: color.withAlpha(26),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Center(
                child: Text(
                  ticker.asset.substring(0, ticker.asset.length.clamp(0, 3)),
                  style: TextStyle(color: color, fontWeight: FontWeight.w800, fontSize: 11),
                ),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(ticker.asset, style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.w700, fontSize: 14)),
                  Text(ticker.symbol, style: const TextStyle(color: AppColors.textMuted, fontSize: 11)),
                ],
              ),
            ),
            SizedBox(
              width: 100,
              child: Text(
                '\$${_formatPrice(ticker.price)}',
                textAlign: TextAlign.right,
                style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.w700, fontSize: 14, fontFamily: 'monospace'),
              ),
            ),
            SizedBox(
              width: 80,
              child: Container(
                margin: const EdgeInsets.only(left: 8),
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: color.withAlpha(26),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  '${isPositive ? '+' : ''}${ticker.changePercent.toStringAsFixed(2)}%',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: color, fontWeight: FontWeight.w700, fontSize: 12),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _formatPrice(double price) {
    if (price >= 1000) return price.toStringAsFixed(2);
    if (price >= 1) return price.toStringAsFixed(4);
    return price.toStringAsFixed(6);
  }
}
