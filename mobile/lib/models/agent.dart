// lib/models/agent.dart

class AgentModel {
  final String id;
  final String name;
  final String status;
  final String health;
  final List<String> activity;

  const AgentModel({
    required this.id,
    required this.name,
    required this.status,
    required this.health,
    required this.activity,
  });

  factory AgentModel.fromJson(Map<String, dynamic> json) {
    return AgentModel(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      status: json['status']?.toString() ?? 'ACTIVE',
      health: json['health']?.toString() ?? 'HEALTHY',
      activity: (json['activity'] as List<dynamic>? ?? [])
          .map((e) => e.toString())
          .toList(),
    );
  }
}

class AgentsResponse {
  final String systemStatus;
  final int activeAgentsCount;
  final List<AgentModel> agents;

  const AgentsResponse({
    required this.systemStatus,
    required this.activeAgentsCount,
    required this.agents,
  });

  factory AgentsResponse.fromJson(Map<String, dynamic> json) {
    return AgentsResponse(
      systemStatus: json['systemStatus']?.toString() ?? 'Initializing',
      activeAgentsCount: json['activeAgentsCount'] as int? ?? 0,
      agents: (json['agents'] as List<dynamic>? ?? [])
          .map((e) => AgentModel.fromJson(e as Map<String, dynamic>))
          .toList(),
    );
  }
}

class SignalModel {
  final String agentId;
  final String symbol;
  final String type;
  final int confidence;
  final String? reason;
  final int riskScore;

  const SignalModel({
    required this.agentId,
    required this.symbol,
    required this.type,
    required this.confidence,
    this.reason,
    required this.riskScore,
  });

  factory SignalModel.fromJson(Map<String, dynamic> json) {
    return SignalModel(
      agentId: json['agentId']?.toString() ?? '',
      symbol: json['symbol']?.toString() ?? '',
      type: json['type']?.toString() ?? 'HOLD',
      confidence: (json['confidence'] as num? ?? 50).toInt(),
      reason: json['reason']?.toString(),
      riskScore: (json['riskScore'] as num? ?? 1).toInt(),
    );
  }
}

class ConsensusModel {
  final String type;
  final int confidence;
  final String reasoning;
  final String volatilityRegime;
  final Map<String, dynamic> indicators;
  final int riskScore;
  final String timestamp;

  const ConsensusModel({
    required this.type,
    required this.confidence,
    required this.reasoning,
    required this.volatilityRegime,
    required this.indicators,
    required this.riskScore,
    required this.timestamp,
  });

  factory ConsensusModel.fromJson(Map<String, dynamic> json) {
    return ConsensusModel(
      type: json['type']?.toString() ?? 'HOLD',
      confidence: (json['confidence'] as num? ?? 50).toInt(),
      reasoning: json['reasoning']?.toString() ?? 'Awaiting analysis...',
      volatilityRegime: json['volatilityRegime']?.toString() ?? 'Normal',
      indicators: (json['indicators'] as Map<String, dynamic>?) ?? {},
      riskScore: (json['riskScore'] as num? ?? 1).toInt(),
      timestamp: json['timestamp']?.toString() ?? DateTime.now().toIso8601String(),
    );
  }
}

class SignalsResponse {
  final Map<String, SignalModel> signals;
  final ConsensusModel consensus;

  const SignalsResponse({required this.signals, required this.consensus});

  factory SignalsResponse.fromJson(Map<String, dynamic> json) {
    final rawSignals = (json['signals'] as Map<String, dynamic>?) ?? {};
    final signals = rawSignals.map(
      (key, value) => MapEntry(key, SignalModel.fromJson(value as Map<String, dynamic>)),
    );
    return SignalsResponse(
      signals: signals,
      consensus: ConsensusModel.fromJson(json['consensus'] as Map<String, dynamic>? ?? {}),
    );
  }
}
