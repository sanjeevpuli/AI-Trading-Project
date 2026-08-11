// lib/screens/watchlist/watchlist_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../theme/app_colors.dart';
import '../../providers/providers.dart';
import '../../models/market_ticker.dart';


class WatchlistScreen extends ConsumerStatefulWidget {
  const WatchlistScreen({super.key});

  @override
  ConsumerState<WatchlistScreen> createState() => _WatchlistScreenState();
}

class _WatchlistScreenState extends ConsumerState<WatchlistScreen> {
  final _addCtrl = TextEditingController();
  bool _adding = false;

  Future<void> _addSymbol(List<String> current) async {
    final symbol = _addCtrl.text.trim().toUpperCase();
    if (symbol.isEmpty || current.contains(symbol)) return;
    setState(() => _adding = true);
    try {
      final client = ref.read(apiClientProvider);
      await client.dio.post('/api/watchlist', data: {'symbols': [...current, symbol]});
      _addCtrl.clear();
      ref.invalidate(dashboardProvider);
    } finally {
      if (mounted) setState(() => _adding = false);
    }
  }

  Future<void> _removeSymbol(List<String> current, String symbol) async {
    final newList = current.where((s) => s != symbol).toList();
    final client = ref.read(apiClientProvider);
    await client.dio.post('/api/watchlist', data: {'symbols': newList});
    ref.invalidate(dashboardProvider);
  }

  @override
  Widget build(BuildContext context) {
    final dashAsync = ref.watch(dashboardProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Watchlist')),
      body: dashAsync.when(
        loading: () => const Center(child: CircularProgressIndicator(color: AppColors.cyan)),
        error: (_, __) => const Center(child: Text('Failed to load', style: TextStyle(color: AppColors.textMuted))),
        data: (data) {
          final watchlist = data.watchlist;
          final marketAsync = ref.watch(marketDataProvider(watchlist.isEmpty ? ['BTCUSDT'] : watchlist));

          return Column(
            children: [
              // Add Symbol
              Padding(
                padding: const EdgeInsets.all(16),
                child: Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _addCtrl,
                        textCapitalization: TextCapitalization.characters,
                        style: const TextStyle(color: AppColors.textPrimary),
                        decoration: const InputDecoration(
                          hintText: 'Add symbol (e.g. BTCUSDT)',
                          prefixIcon: Icon(Icons.add, size: 18, color: AppColors.textMuted),
                          isDense: true,
                        ),
                      ),
                    ),
                    const SizedBox(width: 10),
                    ElevatedButton(
                      onPressed: _adding ? null : () => _addSymbol(watchlist),
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                      ),
                      child: _adding
                          ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.background))
                          : const Text('Add'),
                    ),
                  ],
                ),
              ),
              const Divider(color: AppColors.surfaceVariant, height: 1),

              // Watchlist
              if (watchlist.isEmpty)
                const Expanded(
                  child: Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.star_border, color: AppColors.textMuted, size: 64),
                        SizedBox(height: 16),
                        Text('Your watchlist is empty', style: TextStyle(color: AppColors.textMuted)),
                      ],
                    ),
                  ),
                )
              else
                Expanded(
                  child: marketAsync.when(
                    loading: () => const Center(child: CircularProgressIndicator(color: AppColors.cyan)),
                    error: (_, __) => ListView.builder(
                      itemCount: watchlist.length,
                      itemBuilder: (_, i) => _WatchlistRow(symbol: watchlist[i], ticker: null, onRemove: () => _removeSymbol(watchlist, watchlist[i])),
                    ),
                    data: (rawTickers) {
                      final tickerMap = <String, MarketTicker>{};
                      for (final t in rawTickers.whereType<MarketTicker>()) {
                        tickerMap[t.symbol] = t;
                      }
                      return ListView.separated(
                        separatorBuilder: (_, __) => const Divider(height: 1, color: AppColors.surfaceVariant),
                        itemCount: watchlist.length,
                        itemBuilder: (_, i) => _WatchlistRow(
                          symbol: watchlist[i],
                          ticker: tickerMap[watchlist[i]],
                          onRemove: () => _removeSymbol(watchlist, watchlist[i]),
                        ),
                      );
                    },
                  ),
                ),
            ],
          );
        },
      ),
    );
  }
}

class _WatchlistRow extends ConsumerWidget {
  final String symbol;
  final MarketTicker? ticker;
  final VoidCallback onRemove;

  const _WatchlistRow({required this.symbol, this.ticker, required this.onRemove});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isPositive = ticker?.isPositive ?? true;
    final color = isPositive ? AppColors.profit : AppColors.loss;
    final asset = symbol.replaceAll('USDT', '');

    return ListTile(
      leading: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: color.withAlpha(26),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Center(
          child: Text(
            asset.substring(0, asset.length.clamp(0, 3)),
            style: TextStyle(color: color, fontWeight: FontWeight.w800, fontSize: 11),
          ),
        ),
      ),
      title: Text(asset, style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.w700)),
      subtitle: ticker != null
          ? Text('\$${_formatPrice(ticker!.price)}',
              style: const TextStyle(color: AppColors.textMuted, fontSize: 12, fontFamily: 'monospace'))
          : Text(symbol, style: const TextStyle(color: AppColors.textMuted, fontSize: 12)),
      trailing: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (ticker != null)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: color.withAlpha(26),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(
                '${isPositive ? '+' : ''}${ticker!.changePercent.toStringAsFixed(2)}%',
                style: TextStyle(color: color, fontWeight: FontWeight.w700, fontSize: 12),
              ),
            ),
          IconButton(
            icon: const Icon(Icons.remove_circle_outline, color: AppColors.textMuted, size: 20),
            onPressed: onRemove,
          ),
        ],
      ),
      onTap: () => ref.read(selectedSymbolProvider.notifier).state = symbol,
    );
  }

  String _formatPrice(double price) {
    if (price >= 1000) return price.toStringAsFixed(2);
    if (price >= 1) return price.toStringAsFixed(4);
    return price.toStringAsFixed(6);
  }
}
