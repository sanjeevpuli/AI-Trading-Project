// lib/screens/agents/agents_screen.dart
// Full AI Pipeline visualization matching the web application architecture:
// Market Data → Technical → Sentiment → Market Regime → Risk → Portfolio → Consensus → Execution → Agent Memory

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../theme/app_colors.dart';
import '../../providers/providers.dart';
import '../../models/agent.dart';

// Full 9-node pipeline matching the production architecture
const _pipeline = [
  _PipelineNode(
    id: 'market-data',
    name: 'Market Data Agent',
    role: 'Owns all Binance API communication. Sole source of price data.',
    color: AppColors.agentMarket,
    icon: Icons.satellite_alt_outlined,
  ),
  _PipelineNode(
    id: 'technical-analysis',
    name: 'Technical Analysis Agent',
    role: 'Primary market signal. RSI, MACD, EMA, Bollinger Bands.',
    color: AppColors.agentTechnical,
    icon: Icons.candlestick_chart_outlined,
  ),
  _PipelineNode(
    id: 'sentiment-analysis',
    name: 'Sentiment Intelligence Agent',
    role: 'Adjusts confidence based on market sentiment data.',
    color: AppColors.agentSentiment,
    icon: Icons.psychology_alt_outlined,
  ),
  _PipelineNode(
    id: 'market-regime',
    name: 'Market Regime Agent',
    role: 'Detects trending/ranging/volatile regimes. Adjusts confidence.',
    color: AppColors.agentRegime,
    icon: Icons.show_chart,
  ),
  _PipelineNode(
    id: 'risk-management',
    name: 'Risk Management Agent',
    role: 'Can veto any trade. Validates stop-loss, exposure, drawdown.',
    color: AppColors.agentRisk,
    icon: Icons.shield_outlined,
  ),
  _PipelineNode(
    id: 'portfolio-allocation',
    name: 'Portfolio Agent',
    role: 'Adjusts position sizing based on current portfolio state.',
    color: AppColors.agentPortfolio,
    icon: Icons.pie_chart_outline,
  ),
  _PipelineNode(
    id: 'consensus',
    name: 'Consensus Coordinator',
    role: 'Aggregates all agent signals. Produces final LONG/SHORT/HOLD.',
    color: AppColors.agentConsensus,
    icon: Icons.hub_outlined,
  ),
  _PipelineNode(
    id: 'execution',
    name: 'Execution Agent',
    role: 'Prepares and routes approved trades. Never calculates strategy.',
    color: AppColors.agentExecution,
    icon: Icons.rocket_launch_outlined,
  ),
  _PipelineNode(
    id: 'agent-memory',
    name: 'Agent Memory',
    role: 'Persists agent decisions and signals to database.',
    color: AppColors.agentMemory,
    icon: Icons.storage_outlined,
  ),
];

class AgentsScreen extends ConsumerWidget {
  const AgentsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final agentsAsync = ref.watch(agentsProvider);
    final signalsAsync = ref.watch(signalsProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('AI Agent Pipeline'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: () {
              ref.invalidate(agentsProvider);
              ref.invalidate(signalsProvider);
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        color: AppColors.cyan,
        backgroundColor: AppColors.surface,
        onRefresh: () async {
          ref.invalidate(agentsProvider);
          ref.invalidate(signalsProvider);
        },
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // System Status
              agentsAsync.when(
                loading: () => const _SystemStatusBanner(status: 'Initializing...', isHealthy: false),
                error: (_, __) => const _SystemStatusBanner(status: 'Offline', isHealthy: false),
                data: (agents) => _SystemStatusBanner(
                  status: agents.systemStatus,
                  isHealthy: agents.activeAgentsCount >= 5,
                  count: agents.activeAgentsCount,
                ),
              ),

              const SizedBox(height: 24),

              // Consensus Panel
              signalsAsync.when(
                loading: () => const _ConsensusSkeleton(),
                error: (_, __) => const SizedBox.shrink(),
                data: (signals) => _ConsensusPanel(consensus: signals.consensus),
              ),

              const SizedBox(height: 24),

              const Text(
                'Agent Pipeline',
                style: TextStyle(color: AppColors.textPrimary, fontSize: 16, fontWeight: FontWeight.w700),
              ),
              const SizedBox(height: 4),
              const Text(
                'Market Data → Analysis Agents → Consensus → Execution → Memory',
                style: TextStyle(color: AppColors.textMuted, fontSize: 11),
              ),
              const SizedBox(height: 16),

              // Pipeline Nodes
              ...List.generate(_pipeline.length, (i) {
                final node = _pipeline[i];
                final isLast = i == _pipeline.length - 1;

                // Match agent status from API
                AgentModel? apiAgent;
                agentsAsync.whenData((agents) {
                  try {
                    apiAgent = agents.agents.firstWhere((a) => a.id == node.id);
                  } catch (_) {}
                });

                // Get signal for this agent
                SignalModel? signal;
                signalsAsync.whenData((s) {
                  signal = s.signals[node.id];
                });

                return Column(
                  children: [
                    _PipelineNodeCard(
                      node: node,
                      agent: apiAgent,
                      signal: signal,
                    ),
                    if (!isLast)
                      Container(
                        margin: const EdgeInsets.symmetric(vertical: 2),
                        height: 28,
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(width: 2, height: 10, color: AppColors.surfaceVariant),
                            const Icon(Icons.arrow_downward, color: AppColors.textMuted, size: 14),
                            Container(width: 2, height: 10, color: AppColors.surfaceVariant),
                          ],
                        ),
                      ),
                  ],
                );
              }),

              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }
}

class _SystemStatusBanner extends StatelessWidget {
  final String status;
  final bool isHealthy;
  final int? count;

  const _SystemStatusBanner({required this.status, required this.isHealthy, this.count});

  @override
  Widget build(BuildContext context) {
    final color = isHealthy ? AppColors.profit : AppColors.warning;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withAlpha(13),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: color.withAlpha(51)),
      ),
      child: Row(
        children: [
          Container(
            width: 10,
            height: 10,
            decoration: BoxDecoration(color: color, shape: BoxShape.circle),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'System Status',
                  style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.w500),
                ),
                Text(
                  status,
                  style: const TextStyle(color: AppColors.textPrimary, fontSize: 14, fontWeight: FontWeight.w700),
                ),
              ],
            ),
          ),
          if (count != null)
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: color.withAlpha(26),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                '$count Active',
                style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.w700),
              ),
            ),
        ],
      ),
    );
  }
}

class _ConsensusPanel extends StatelessWidget {
  final ConsensusModel consensus;
  const _ConsensusPanel({required this.consensus});

  @override
  Widget build(BuildContext context) {
    final isLong = consensus.type == 'LONG' || consensus.type == 'BUY';
    final isShort = consensus.type == 'SHORT' || consensus.type == 'SELL';
    final color = isLong ? AppColors.profit : (isShort ? AppColors.loss : AppColors.textMuted);

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [color.withAlpha(13), AppColors.surface],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withAlpha(77)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.hub_outlined, color: AppColors.agentConsensus, size: 18),
              const SizedBox(width: 8),
              const Text('Consensus Coordinator', style: TextStyle(color: AppColors.textMuted, fontSize: 12)),
              const Spacer(),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: color.withAlpha(26),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: color.withAlpha(77)),
                ),
                child: Text(
                  consensus.type,
                  style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.w800),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          // Confidence bar
          Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Confidence', style: TextStyle(color: AppColors.textMuted, fontSize: 11)),
                        Text('${consensus.confidence}%', style: TextStyle(color: color, fontSize: 14, fontWeight: FontWeight.w800)),
                      ],
                    ),
                    const SizedBox(height: 6),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: LinearProgressIndicator(
                        value: consensus.confidence / 100,
                        backgroundColor: AppColors.surfaceVariant,
                        valueColor: AlwaysStoppedAnimation(color),
                        minHeight: 6,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Text(
            consensus.reasoning,
            style: const TextStyle(color: AppColors.textSecondary, fontSize: 12, height: 1.5),
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              _ConsensusChip(label: 'Regime', value: consensus.volatilityRegime),
              _ConsensusChip(label: 'Risk Score', value: '${consensus.riskScore}/5'),
            ],
          ),
          // Indicators
          if (consensus.indicators.isNotEmpty) ...[
            const SizedBox(height: 16),
            const Divider(color: AppColors.surfaceVariant),
            const SizedBox(height: 12),
            const Text('Technical Indicators', style: TextStyle(color: AppColors.textMuted, fontSize: 11)),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: consensus.indicators.entries.map((e) =>
                _ConsensusChip(label: e.key.toUpperCase(), value: e.value.toString()),
              ).toList(),
            ),
          ],
        ],
      ),
    );
  }
}

class _ConsensusChip extends StatelessWidget {
  final String label;
  final String value;
  const _ConsensusChip({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: AppColors.surfaceVariant,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: const TextStyle(color: AppColors.textMuted, fontSize: 9)),
          Text(value, style: const TextStyle(color: AppColors.textPrimary, fontSize: 12, fontWeight: FontWeight.w700)),
        ],
      ),
    );
  }
}

class _PipelineNodeCard extends StatelessWidget {
  final _PipelineNode node;
  final AgentModel? agent;
  final SignalModel? signal;

  const _PipelineNodeCard({required this.node, this.agent, this.signal});

  @override
  Widget build(BuildContext context) {
    final health = agent?.health ?? 'HEALTHY';
    final status = agent?.status ?? 'ACTIVE';
    final isHealthy = health == 'HEALTHY';
    final statusColor = isHealthy ? AppColors.profit : AppColors.warning;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: node.color.withAlpha(51)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: node.color.withAlpha(26),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: node.color.withAlpha(77)),
                ),
                child: Icon(node.icon, color: node.color, size: 20),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(node.name, style: const TextStyle(color: AppColors.textPrimary, fontSize: 13, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 2),
                    Row(
                      children: [
                        Container(
                          width: 6,
                          height: 6,
                          decoration: BoxDecoration(color: statusColor, shape: BoxShape.circle),
                        ),
                        const SizedBox(width: 4),
                        Text(status, style: TextStyle(color: statusColor, fontSize: 10, fontWeight: FontWeight.w600)),
                        const SizedBox(width: 8),
                        Text('· $health', style: const TextStyle(color: AppColors.textMuted, fontSize: 10)),
                      ],
                    ),
                  ],
                ),
              ),
              if (signal != null) ...[
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: _signalColor(signal!.type).withAlpha(26),
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: _signalColor(signal!.type).withAlpha(77)),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(signal!.type, style: TextStyle(color: _signalColor(signal!.type), fontSize: 10, fontWeight: FontWeight.w800)),
                      Text('${signal!.confidence}%', style: TextStyle(color: _signalColor(signal!.type), fontSize: 11, fontWeight: FontWeight.w700)),
                    ],
                  ),
                ),
              ],
            ],
          ),
          const SizedBox(height: 10),
          Text(node.role, style: const TextStyle(color: AppColors.textMuted, fontSize: 11, height: 1.4)),

          // Activity Log
          if (agent?.activity.isNotEmpty == true) ...[
            const SizedBox(height: 12),
            const Divider(color: AppColors.surfaceVariant),
            const SizedBox(height: 8),
            ...agent!.activity.take(2).map((a) => Padding(
              padding: const EdgeInsets.only(bottom: 4),
              child: Row(
                children: [
                  const Icon(Icons.circle, size: 6, color: AppColors.textMuted),
                  const SizedBox(width: 8),
                  Expanded(child: Text(a, style: const TextStyle(color: AppColors.textMuted, fontSize: 10), overflow: TextOverflow.ellipsis)),
                ],
              ),
            )),
          ],
        ],
      ),
    );
  }

  Color _signalColor(String type) {
    if (type == 'LONG' || type == 'BUY') return AppColors.profit;
    if (type == 'SHORT' || type == 'SELL') return AppColors.loss;
    return AppColors.textMuted;
  }
}

class _ConsensusSkeleton extends StatelessWidget {
  const _ConsensusSkeleton();

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 120,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.surfaceVariant),
      ),
      child: const Center(
        child: CircularProgressIndicator(color: AppColors.cyan, strokeWidth: 2),
      ),
    );
  }
}

class _PipelineNode {
  final String id;
  final String name;
  final String role;
  final Color color;
  final IconData icon;

  const _PipelineNode({
    required this.id,
    required this.name,
    required this.role,
    required this.color,
    required this.icon,
  });
}
