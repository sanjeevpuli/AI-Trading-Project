// lib/screens/backtesting/backtesting_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:dio/dio.dart';
import '../../theme/app_colors.dart';
import '../../providers/providers.dart';

class BacktestingScreen extends ConsumerStatefulWidget {
  const BacktestingScreen({super.key});

  @override
  ConsumerState<BacktestingScreen> createState() => _BacktestingScreenState();
}

class _BacktestingScreenState extends ConsumerState<BacktestingScreen> {
  String _symbol = 'BTCUSDT';
  String _timeframe = '60';
  String _strategy = 'default';
  double _initialBalance = 100000;
  double _positionSizePercent = 10;
  double _stopLoss = 3;
  double _takeProfit = 6;
  bool _loading = false;
  Map<String, dynamic>? _results;
  String? _error;

  final _symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'ADAUSDT', 'XRPUSDT'];
  final _timeframes = [('1', '1m'), ('15', '15m'), ('60', '1h'), ('240', '4h'), ('1D', '1D')];
  final _strategies = ['default', 'trend-following', 'mean-reversion', 'momentum', 'ai-consensus'];

  Future<void> _runBacktest() async {
    setState(() { _loading = true; _error = null; _results = null; });
    try {
      final client = ref.read(apiClientProvider);
      final response = await client.dio.post('/api/backtesting', data: {
        'symbol': _symbol,
        'timeframe': _timeframe,
        'strategy': _strategy,
        'initialBalance': _initialBalance,
        'positionSizePercent': _positionSizePercent,
        'stopLoss': _stopLoss,
        'takeProfit': _takeProfit,
      });
      setState(() => _results = response.data as Map<String, dynamic>);
    } on DioException catch (e) {
      setState(() => _error = e.response?.data['error']?.toString() ?? 'Backtest failed.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Backtesting Engine')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Configuration Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppColors.surfaceVariant),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Backtest Configuration', style: TextStyle(color: AppColors.textPrimary, fontSize: 14, fontWeight: FontWeight.w700)),
                  const SizedBox(height: 16),
                  _DropdownField(
                    label: 'Symbol',
                    value: _symbol,
                    options: _symbols,
                    onChanged: (v) => setState(() => _symbol = v),
                  ),
                  const SizedBox(height: 12),
                  _DropdownField(
                    label: 'Timeframe',
                    value: _timeframe,
                    options: _timeframes.map((t) => t.$1).toList(),
                    displayLabels: _timeframes.map((t) => t.$2).toList(),
                    onChanged: (v) => setState(() => _timeframe = v),
                  ),
                  const SizedBox(height: 12),
                  _DropdownField(
                    label: 'Strategy',
                    value: _strategy,
                    options: _strategies,
                    onChanged: (v) => setState(() => _strategy = v),
                  ),
                  const SizedBox(height: 16),
                  _SliderField(
                    label: 'Initial Balance',
                    value: _initialBalance,
                    min: 1000,
                    max: 1000000,
                    divisions: 99,
                    display: '\$${_initialBalance.toStringAsFixed(0)}',
                    onChanged: (v) => setState(() => _initialBalance = v),
                  ),
                  _SliderField(
                    label: 'Position Size',
                    value: _positionSizePercent,
                    min: 1,
                    max: 50,
                    divisions: 49,
                    display: '${_positionSizePercent.toStringAsFixed(0)}% per trade',
                    onChanged: (v) => setState(() => _positionSizePercent = v),
                  ),
                  _SliderField(
                    label: 'Stop Loss',
                    value: _stopLoss,
                    min: 0.5,
                    max: 20,
                    divisions: 39,
                    display: '${_stopLoss.toStringAsFixed(1)}%',
                    onChanged: (v) => setState(() => _stopLoss = v),
                  ),
                  _SliderField(
                    label: 'Take Profit',
                    value: _takeProfit,
                    min: 1,
                    max: 50,
                    divisions: 49,
                    display: '${_takeProfit.toStringAsFixed(1)}%',
                    onChanged: (v) => setState(() => _takeProfit = v),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Run Button
            SizedBox(
              width: double.infinity,
              height: 54,
              child: ElevatedButton.icon(
                onPressed: _loading ? null : _runBacktest,
                icon: _loading
                    ? const SizedBox(width: 18, height: 18, child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.background))
                    : const Icon(Icons.play_arrow_rounded),
                label: Text(_loading ? 'Running Backtest...' : 'Run Backtest', style: const TextStyle(fontSize: 15)),
              ),
            ),

            if (_error != null) ...[
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: AppColors.loss.withAlpha(26),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppColors.loss.withAlpha(77)),
                ),
                child: Text(_error!, style: const TextStyle(color: AppColors.loss, fontSize: 13)),
              ),
            ],

            if (_results != null) ...[
              const SizedBox(height: 24),
              _BacktestResults(results: _results!),
            ],

            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }
}

class _BacktestResults extends StatelessWidget {
  final Map<String, dynamic> results;
  const _BacktestResults({required this.results});

  @override
  Widget build(BuildContext context) {
    final finalBalance = (results['finalBalance'] as num? ?? 0).toDouble();
    final initialBalance = (results['initialBalance'] as num? ?? 100000).toDouble();
    final totalReturn = ((finalBalance - initialBalance) / initialBalance * 100);
    final winRate = (results['winRate'] as num? ?? 0).toDouble();
    final sharpe = (results['sharpeRatio'] as num? ?? 0).toDouble();
    final maxDD = (results['maxDrawdown'] as num? ?? 0).toDouble();
    final totalTrades = results['totalTrades'] as int? ?? 0;
    final isProfit = totalReturn >= 0;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: (isProfit ? AppColors.profit : AppColors.loss).withAlpha(77)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.analytics_outlined, color: AppColors.cyan, size: 18),
              const SizedBox(width: 8),
              const Text('Backtest Results', style: TextStyle(color: AppColors.textPrimary, fontSize: 14, fontWeight: FontWeight.w700)),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: (isProfit ? AppColors.profit : AppColors.loss).withAlpha(26),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  '${isProfit ? '+' : ''}${totalReturn.toStringAsFixed(2)}%',
                  style: TextStyle(
                    color: isProfit ? AppColors.profit : AppColors.loss,
                    fontWeight: FontWeight.w800, fontSize: 14,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: 2.0,
            children: [
              _ResultCell(label: 'Final Balance', value: '\$${finalBalance.toStringAsFixed(2)}'),
              _ResultCell(label: 'Total Trades', value: '$totalTrades'),
              _ResultCell(label: 'Win Rate', value: '${winRate.toStringAsFixed(1)}%', color: AppColors.profit),
              _ResultCell(label: 'Sharpe Ratio', value: sharpe.toStringAsFixed(2)),
              _ResultCell(label: 'Max Drawdown', value: '${maxDD.toStringAsFixed(2)}%', color: AppColors.loss),
              _ResultCell(label: 'Total Return', value: '${isProfit ? '+' : ''}${totalReturn.toStringAsFixed(2)}%',
                  color: isProfit ? AppColors.profit : AppColors.loss),
            ],
          ),
        ],
      ),
    );
  }
}

class _ResultCell extends StatelessWidget {
  final String label;
  final String value;
  final Color? color;
  const _ResultCell({required this.label, required this.value, this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.surfaceVariant,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 10)),
          const SizedBox(height: 4),
          Text(value, style: TextStyle(color: color ?? AppColors.textPrimary, fontSize: 14, fontWeight: FontWeight.w700)),
        ],
      ),
    );
  }
}

class _DropdownField extends StatelessWidget {
  final String label;
  final String value;
  final List<String> options;
  final List<String>? displayLabels;
  final ValueChanged<String> onChanged;

  const _DropdownField({required this.label, required this.value, required this.options, this.displayLabels, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        SizedBox(width: 110, child: Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 12))),
        Expanded(
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            decoration: BoxDecoration(
              color: AppColors.surfaceVariant,
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: AppColors.border),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<String>(
                value: value,
                dropdownColor: AppColors.surface,
                style: const TextStyle(color: AppColors.textPrimary, fontSize: 13),
                isExpanded: true,
                items: options.asMap().entries.map((e) {
                  final display = displayLabels?[e.key] ?? e.value;
                  return DropdownMenuItem(value: e.value, child: Text(display));
                }).toList(),
                onChanged: (v) { if (v != null) onChanged(v); },
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _SliderField extends StatelessWidget {
  final String label;
  final double value;
  final double min;
  final double max;
  final int divisions;
  final String display;
  final ValueChanged<double> onChanged;

  const _SliderField({required this.label, required this.value, required this.min, required this.max, required this.divisions, required this.display, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 12)),
              Text(display, style: const TextStyle(color: AppColors.textPrimary, fontSize: 12, fontWeight: FontWeight.w700)),
            ],
          ),
          SliderTheme(
            data: SliderTheme.of(context).copyWith(
              activeTrackColor: AppColors.cyan,
              inactiveTrackColor: AppColors.surfaceVariant,
              thumbColor: AppColors.cyan,
              overlayColor: AppColors.cyan.withAlpha(26),
              trackHeight: 4,
            ),
            child: Slider(value: value, min: min, max: max, divisions: divisions, onChanged: onChanged),
          ),
        ],
      ),
    );
  }
}
