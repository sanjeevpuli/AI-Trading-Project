// lib/screens/trading/trading_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../theme/app_colors.dart';
import '../../providers/providers.dart';

class TradingScreen extends ConsumerStatefulWidget {
  const TradingScreen({super.key});

  @override
  ConsumerState<TradingScreen> createState() => _TradingScreenState();
}

class _TradingScreenState extends ConsumerState<TradingScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _amountCtrl = TextEditingController(text: '0.001');
  final _priceCtrl = TextEditingController();
  final _slCtrl = TextEditingController();
  final _tpCtrl = TextEditingController();
  String _side = 'LONG'; // LONG | SHORT
  String _orderType = 'MARKET'; // MARKET | LIMIT
  bool _loading = false;
  String? _feedback;
  bool _feedbackSuccess = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    _amountCtrl.dispose();
    _priceCtrl.dispose();
    _slCtrl.dispose();
    _tpCtrl.dispose();
    super.dispose();
  }

  Future<void> _submitOrder(double currentPrice) async {
    setState(() { _loading = true; _feedback = null; });
    final service = ref.read(tradingServiceProvider);
    final symbol = ref.read(selectedSymbolProvider);
    final amount = double.tryParse(_amountCtrl.text) ?? 0.001;

    try {
      final price = _orderType == 'LIMIT' 
          ? (double.tryParse(_priceCtrl.text) ?? currentPrice) 
          : currentPrice;

      await service.executeOrder(
        symbol: symbol,
        type: _side,
        orderType: _orderType,
        amount: amount,
        price: price,
        stopLoss: double.tryParse(_slCtrl.text),
        takeProfit: double.tryParse(_tpCtrl.text),
      );

      setState(() {
        _feedback = '${_orderType == 'MARKET' ? 'Market' : 'Limit'} order placed successfully!';
        _feedbackSuccess = true;
      });
      ref.invalidate(positionsProvider);
      ref.invalidate(ordersProvider);
    } catch (e) {
      setState(() {
        _feedback = 'Failed to place order. Please try again.';
        _feedbackSuccess = false;
      });
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final selectedSymbol = ref.watch(selectedSymbolProvider);
    final defaultSymbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'ADAUSDT', 'XRPUSDT'];
    final marketAsync = ref.watch(marketDataProvider(defaultSymbols));

    double currentPrice = 0;
    marketAsync.whenData((tickers) {
      for (final t in tickers) {
        if (t.symbol == selectedSymbol) {
          currentPrice = t.price as double;
          break;
        }
      }
    });

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Trading'),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppColors.cyan,
          labelColor: AppColors.cyan,
          unselectedLabelColor: AppColors.textMuted,
          tabs: const [Tab(text: 'Place Order'), Tab(text: 'Open Orders')],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildOrderForm(selectedSymbol, defaultSymbols, currentPrice),
          _buildOpenOrders(),
        ],
      ),
    );
  }

  Widget _buildOrderForm(String selectedSymbol, List<String> symbols, double currentPrice) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Symbol Selector
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.surfaceVariant),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Symbol', style: TextStyle(color: AppColors.textMuted, fontSize: 11)),
                const SizedBox(height: 8),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: symbols.map((s) {
                      final isSelected = s == selectedSymbol;
                      return GestureDetector(
                        onTap: () => ref.read(selectedSymbolProvider.notifier).state = s,
                        child: Container(
                          margin: const EdgeInsets.only(right: 8),
                          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: isSelected ? AppColors.cyan.withAlpha(26) : AppColors.surfaceVariant,
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(
                              color: isSelected ? AppColors.cyan : AppColors.border,
                            ),
                          ),
                          child: Text(
                            s.replaceAll('USDT', ''),
                            style: TextStyle(
                              color: isSelected ? AppColors.cyan : AppColors.textMuted,
                              fontSize: 12,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ),
                if (currentPrice > 0) ...[
                  const SizedBox(height: 12),
                  Text(
                    '\$${currentPrice.toStringAsFixed(2)}',
                    style: const TextStyle(color: AppColors.textPrimary, fontSize: 24, fontWeight: FontWeight.w800, fontFamily: 'monospace'),
                  ),
                  const Text('Live price via backend', style: TextStyle(color: AppColors.textMuted, fontSize: 10)),
                ],
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Order Type
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.surfaceVariant),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Order Type', style: TextStyle(color: AppColors.textMuted, fontSize: 11)),
                const SizedBox(height: 10),
                Row(
                  children: ['MARKET', 'LIMIT'].map((type) {
                    final isSelected = type == _orderType;
                    return Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() => _orderType = type),
                        child: Container(
                          margin: EdgeInsets.only(right: type == 'MARKET' ? 8 : 0),
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          decoration: BoxDecoration(
                            color: isSelected ? AppColors.cyan.withAlpha(26) : AppColors.surfaceVariant,
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                              color: isSelected ? AppColors.cyan : AppColors.border,
                            ),
                          ),
                          child: Text(
                            type,
                            textAlign: TextAlign.center,
                            style: TextStyle(
                              color: isSelected ? AppColors.cyan : AppColors.textMuted,
                              fontWeight: FontWeight.w700,
                              fontSize: 13,
                            ),
                          ),
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Side: LONG / SHORT
          Row(
            children: [
              Expanded(
                child: GestureDetector(
                  onTap: () => setState(() => _side = 'LONG'),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    decoration: BoxDecoration(
                      color: _side == 'LONG' ? AppColors.profit.withAlpha(26) : AppColors.surface,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: _side == 'LONG' ? AppColors.profit : AppColors.surfaceVariant, width: _side == 'LONG' ? 2 : 1),
                    ),
                    child: Column(
                      children: [
                        Icon(Icons.arrow_upward, color: _side == 'LONG' ? AppColors.profit : AppColors.textMuted),
                        const SizedBox(height: 4),
                        Text('LONG / BUY', style: TextStyle(
                          color: _side == 'LONG' ? AppColors.profit : AppColors.textMuted,
                          fontWeight: FontWeight.w800, fontSize: 13,
                        )),
                      ],
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: GestureDetector(
                  onTap: () => setState(() => _side = 'SHORT'),
                  child: Container(
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    decoration: BoxDecoration(
                      color: _side == 'SHORT' ? AppColors.loss.withAlpha(26) : AppColors.surface,
                      borderRadius: BorderRadius.circular(14),
                      border: Border.all(color: _side == 'SHORT' ? AppColors.loss : AppColors.surfaceVariant, width: _side == 'SHORT' ? 2 : 1),
                    ),
                    child: Column(
                      children: [
                        Icon(Icons.arrow_downward, color: _side == 'SHORT' ? AppColors.loss : AppColors.textMuted),
                        const SizedBox(height: 4),
                        Text('SHORT / SELL', style: TextStyle(
                          color: _side == 'SHORT' ? AppColors.loss : AppColors.textMuted,
                          fontWeight: FontWeight.w800, fontSize: 13,
                        )),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          // Amount, Price (if LIMIT), SL, TP
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.surfaceVariant),
            ),
            child: Column(
              children: [
                _InputRow(
                  label: 'Amount',
                  controller: _amountCtrl,
                  hint: '0.001',
                  suffix: selectedSymbol.replaceAll('USDT', ''),
                ),
                if (_orderType == 'LIMIT') ...[
                  const SizedBox(height: 12),
                  _InputRow(
                    label: 'Limit Price',
                    controller: _priceCtrl,
                    hint: currentPrice > 0 ? currentPrice.toStringAsFixed(2) : '0.00',
                    suffix: 'USDT',
                  ),
                ],
                const SizedBox(height: 12),
                _InputRow(
                  label: 'Stop Loss (optional)',
                  controller: _slCtrl,
                  hint: 'e.g. ${(currentPrice * 0.97).toStringAsFixed(2)}',
                  suffix: 'USDT',
                ),
                const SizedBox(height: 12),
                _InputRow(
                  label: 'Take Profit (optional)',
                  controller: _tpCtrl,
                  hint: 'e.g. ${(currentPrice * 1.05).toStringAsFixed(2)}',
                  suffix: 'USDT',
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          if (_feedback != null)
            Container(
              padding: const EdgeInsets.all(12),
              margin: const EdgeInsets.only(bottom: 16),
              decoration: BoxDecoration(
                color: (_feedbackSuccess ? AppColors.profit : AppColors.loss).withAlpha(26),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(
                  color: (_feedbackSuccess ? AppColors.profit : AppColors.loss).withAlpha(77),
                ),
              ),
              child: Text(_feedback!, style: TextStyle(
                color: _feedbackSuccess ? AppColors.profit : AppColors.loss,
                fontSize: 13,
              )),
            ),

          // Submit Button
          SizedBox(
            width: double.infinity,
            height: 54,
            child: ElevatedButton(
              onPressed: _loading ? null : () => _submitOrder(currentPrice),
              style: ElevatedButton.styleFrom(
                backgroundColor: _side == 'LONG' ? AppColors.profit : AppColors.loss,
                foregroundColor: Colors.white,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
              child: _loading
                  ? const SizedBox(width: 22, height: 22,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : Text(
                      '${_side == 'LONG' ? 'Buy / Long' : 'Sell / Short'} $selectedSymbol',
                      style: const TextStyle(fontSize: 15, fontWeight: FontWeight.w800),
                    ),
            ),
          ),
          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildOpenOrders() {
    final ordersAsync = ref.watch(ordersProvider);
    return ordersAsync.when(
      loading: () => const Center(child: CircularProgressIndicator(color: AppColors.cyan)),
      error: (_, __) => const Center(child: Text('Failed to load orders', style: TextStyle(color: AppColors.textMuted))),
      data: (orders) {
        if (orders.isEmpty) {
          return const Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.pending_actions, color: AppColors.textMuted, size: 48),
                SizedBox(height: 16),
                Text('No pending orders', style: TextStyle(color: AppColors.textMuted)),
              ],
            ),
          );
        }
        return ListView.builder(
          padding: const EdgeInsets.all(20),
          itemCount: orders.length,
          itemBuilder: (_, i) => _OrderCard(
            order: orders[i],
            onCancel: () async {
              final service = ref.read(tradingServiceProvider);
              await service.cancelOrder(orders[i].id);
              ref.invalidate(ordersProvider);
            },
          ),
        );
      },
    );
  }
}

class _InputRow extends StatelessWidget {
  final String label;
  final TextEditingController controller;
  final String hint;
  final String suffix;

  const _InputRow({required this.label, required this.controller, required this.hint, required this.suffix});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        SizedBox(
          width: 120,
          child: Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 12)),
        ),
        Expanded(
          child: TextField(
            controller: controller,
            keyboardType: const TextInputType.numberWithOptions(decimal: true),
            style: const TextStyle(color: AppColors.textPrimary, fontSize: 14, fontFamily: 'monospace'),
            decoration: InputDecoration(
              hintText: hint,
              hintStyle: const TextStyle(color: AppColors.textMuted, fontSize: 12),
              suffixText: suffix,
              suffixStyle: const TextStyle(color: AppColors.textMuted, fontSize: 12),
              isDense: true,
              contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
              filled: true,
              fillColor: AppColors.surfaceVariant,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: const BorderSide(color: AppColors.border),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: const BorderSide(color: AppColors.cyan, width: 1.5),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(8),
                borderSide: const BorderSide(color: AppColors.border),
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _OrderCard extends StatelessWidget {
  final dynamic order;
  final VoidCallback onCancel;

  const _OrderCard({required this.order, required this.onCancel});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.warning.withAlpha(51)),
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('${order.symbol} · ${order.orderType}',
                    style: const TextStyle(color: AppColors.textPrimary, fontWeight: FontWeight.w700)),
                const SizedBox(height: 4),
                Text('\$${order.price.toStringAsFixed(2)} · ${order.amount} ${order.symbol.replaceAll('USDT', '')}',
                    style: const TextStyle(color: AppColors.textMuted, fontSize: 12, fontFamily: 'monospace')),
              ],
            ),
          ),
          OutlinedButton(
            onPressed: onCancel,
            style: OutlinedButton.styleFrom(
              foregroundColor: AppColors.loss,
              side: const BorderSide(color: AppColors.loss),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
              textStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
            ),
            child: const Text('Cancel'),
          ),
        ],
      ),
    );
  }
}
