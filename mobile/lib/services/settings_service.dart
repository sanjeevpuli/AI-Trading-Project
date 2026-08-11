// lib/services/settings_service.dart
import '../network/api_client.dart';
import '../config/api_config.dart';
import '../models/settings.dart';

class SettingsService {
  final ApiClient _client;
  SettingsService(this._client);

  Future<UserSettings> getSettings() async {
    final response = await _client.dio.get(ApiConfig.settings);
    return UserSettings.fromJson(response.data as Map<String, dynamic>);
  }

  Future<UserSettings> updateSettings(UserSettings settings) async {
    final response = await _client.dio.put(
      ApiConfig.settings,
      data: settings.toJson(),
    );
    return UserSettings.fromJson(response.data as Map<String, dynamic>);
  }
}
