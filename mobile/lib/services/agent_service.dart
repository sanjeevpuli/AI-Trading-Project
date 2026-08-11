// lib/services/agent_service.dart
import '../network/api_client.dart';
import '../config/api_config.dart';
import '../models/agent.dart';

class AgentService {
  final ApiClient _client;
  AgentService(this._client);

  Future<AgentsResponse> getAgents() async {
    final response = await _client.dio.get(ApiConfig.agents);
    return AgentsResponse.fromJson(response.data as Map<String, dynamic>);
  }

  Future<SignalsResponse> getSignals() async {
    final response = await _client.dio.get(ApiConfig.signals);
    return SignalsResponse.fromJson(response.data as Map<String, dynamic>);
  }
}
