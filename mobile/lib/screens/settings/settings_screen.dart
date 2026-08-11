// lib/screens/settings/settings_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../theme/app_colors.dart';
import '../../providers/providers.dart';
import '../../models/settings.dart';

class SettingsScreen extends ConsumerStatefulWidget {
  const SettingsScreen({super.key});

  @override
  ConsumerState<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends ConsumerState<SettingsScreen> {
  UserSettings? _settings;
  bool _saving = false;
  String? _feedback;

  @override
  Widget build(BuildContext context) {
    final settingsAsync = ref.watch(settingsProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Settings'),
        actions: [
          if (_settings != null)
            TextButton(
              onPressed: _saving ? null : _save,
              child: _saving
                  ? const SizedBox(width: 16, height: 16,
                      child: CircularProgressIndicator(strokeWidth: 2, color: AppColors.cyan))
                  : const Text('Save'),
            ),
        ],
      ),
      body: settingsAsync.when(
        loading: () => const Center(child: CircularProgressIndicator(color: AppColors.cyan)),
        error: (_, __) => const Center(child: Text('Failed to load settings', style: TextStyle(color: AppColors.textMuted))),
        data: (settings) {
          _settings ??= settings;

          return ListView(
            padding: const EdgeInsets.all(20),
            children: [
              if (_feedback != null)
                Container(
                  padding: const EdgeInsets.all(12),
                  margin: const EdgeInsets.only(bottom: 20),
                  decoration: BoxDecoration(
                    color: AppColors.profit.withAlpha(26),
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: AppColors.profit.withAlpha(77)),
                  ),
                  child: Text(_feedback!, style: const TextStyle(color: AppColors.profit, fontSize: 13)),
                ),

              const _SectionHeader(title: 'General'),
              _DropdownRow(
                label: 'Default Symbol',
                value: _settings!.defaultSymbol,
                options: const ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'ADAUSDT', 'XRPUSDT'],
                onChanged: (v) => setState(() => _settings = _settings!.copyWith(defaultSymbol: v)),
              ),
              _DropdownRow(
                label: 'Default Timeframe',
                value: _settings!.defaultTimeframe,
                options: const ['1', '15', '60', '240', '1D'],
                displayLabels: const ['1 Minute', '15 Minutes', '1 Hour', '4 Hours', '1 Day'],
                onChanged: (v) => setState(() => _settings = _settings!.copyWith(defaultTimeframe: v)),
              ),
              _DropdownRow(
                label: 'Theme',
                value: _settings!.theme,
                options: const ['dark', 'light', 'system'],
                displayLabels: const ['Dark', 'Light', 'System'],
                onChanged: (v) => setState(() => _settings = _settings!.copyWith(theme: v)),
              ),
              _DropdownRow(
                label: 'Timezone',
                value: _settings!.timezone,
                options: const ['UTC', 'US/Eastern', 'US/Pacific', 'Europe/London', 'Asia/Singapore'],
                onChanged: (v) => setState(() => _settings = _settings!.copyWith(timezone: v)),
              ),

              const SizedBox(height: 24),
              const _SectionHeader(title: 'Trading & Risk'),
              _DropdownRow(
                label: 'Trading Mode',
                value: _settings!.tradingPreferences,
                options: const ['manual', 'semi-automated', 'automated'],
                displayLabels: const ['Manual Only', 'Semi-Automated', 'Fully Automated (AI)'],
                onChanged: (v) => setState(() => _settings = _settings!.copyWith(tradingPreferences: v)),
              ),
              _DropdownRow(
                label: 'Risk Profile',
                value: _settings!.riskPreferences,
                options: const ['conservative', 'moderate', 'aggressive'],
                displayLabels: const ['Conservative (Low Risk)', 'Moderate (Balanced)', 'Aggressive (High Leverage)'],
                onChanged: (v) => setState(() => _settings = _settings!.copyWith(riskPreferences: v)),
              ),

              const SizedBox(height: 24),
              const _SectionHeader(title: 'Notifications'),
              ..._buildNotifToggles(),

              const SizedBox(height: 40),
            ],
          );
        },
      ),
    );
  }

  List<Widget> _buildNotifToggles() {
    final notifPrefs = Map<String, dynamic>.from(_settings?.notificationPreferences ?? {});
    final options = [
      ('tradeExecuted', 'Trade Executed'),
      ('positionClosed', 'Position Closed'),
      ('stopLossHit', 'Stop Loss Hit'),
      ('takeProfitHit', 'Take Profit Hit'),
      ('aiConsensus', 'AI Consensus Formed'),
      ('riskAlerts', 'Risk & Liquidation Alerts'),
    ];

    return options.map((opt) {
      final key = opt.$1;
      final label = opt.$2;
      final value = notifPrefs[key] as bool? ?? true;
      return _ToggleRow(
        label: label,
        value: value,
        onChanged: (v) {
          setState(() {
            notifPrefs[key] = v;
            _settings = _settings!.copyWith(notificationPreferences: notifPrefs);
          });
        },
      );
    }).toList();
  }

  Future<void> _save() async {
    if (_settings == null) return;
    setState(() => _saving = true);
    try {
      final service = ref.read(settingsServiceProvider);
      await service.updateSettings(_settings!);
      ref.invalidate(settingsProvider);
      setState(() => _feedback = 'Settings saved successfully!');
      Future.delayed(const Duration(seconds: 3), () {
        if (mounted) setState(() => _feedback = null);
      });
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;
  const _SectionHeader({required this.title});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title, style: const TextStyle(color: AppColors.textPrimary, fontSize: 14, fontWeight: FontWeight.w700)),
          const SizedBox(height: 8),
          const Divider(color: AppColors.surfaceVariant),
          const SizedBox(height: 8),
        ],
      ),
    );
  }
}

class _DropdownRow extends StatelessWidget {
  final String label;
  final String value;
  final List<String> options;
  final List<String>? displayLabels;
  final ValueChanged<String> onChanged;

  const _DropdownRow({
    required this.label,
    required this.value,
    required this.options,
    this.displayLabels,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Expanded(
            flex: 2,
            child: Text(label, style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
          ),
          Expanded(
            flex: 3,
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
      ),
    );
  }
}

class _ToggleRow extends StatelessWidget {
  final String label;
  final bool value;
  final ValueChanged<bool> onChanged;

  const _ToggleRow({required this.label, required this.value, required this.onChanged});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: ListTile(
        dense: true,
        contentPadding: EdgeInsets.zero,
        title: Text(label, style: const TextStyle(color: AppColors.textSecondary, fontSize: 13)),
        trailing: Switch(
          value: value,
          onChanged: onChanged,
          activeThumbColor: AppColors.cyan,
        ),
      ),
    );
  }
}
