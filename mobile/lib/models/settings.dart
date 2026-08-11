// lib/models/settings.dart
class UserSettings {
  final String theme;
  final String defaultSymbol;
  final String defaultTimeframe;
  final String riskPreferences;
  final String tradingPreferences;
  final String language;
  final String timezone;
  final Map<String, dynamic> notificationPreferences;
  final Map<String, dynamic> aiPreferences;

  const UserSettings({
    this.theme = 'dark',
    this.defaultSymbol = 'BTCUSDT',
    this.defaultTimeframe = '60',
    this.riskPreferences = 'moderate',
    this.tradingPreferences = 'manual',
    this.language = 'en',
    this.timezone = 'UTC',
    this.notificationPreferences = const {},
    this.aiPreferences = const {},
  });

  factory UserSettings.fromJson(Map<String, dynamic> json) {
    return UserSettings(
      theme: json['theme']?.toString() ?? 'dark',
      defaultSymbol: json['defaultSymbol']?.toString() ?? 'BTCUSDT',
      defaultTimeframe: json['defaultTimeframe']?.toString() ?? '60',
      riskPreferences: json['riskPreferences']?.toString() ?? 'moderate',
      tradingPreferences: json['tradingPreferences']?.toString() ?? 'manual',
      language: json['language']?.toString() ?? 'en',
      timezone: json['timezone']?.toString() ?? 'UTC',
      notificationPreferences: (json['notificationPreferences'] as Map<String, dynamic>?) ?? {},
      aiPreferences: (json['aiPreferences'] as Map<String, dynamic>?) ?? {},
    );
  }

  Map<String, dynamic> toJson() => {
    'theme': theme,
    'defaultSymbol': defaultSymbol,
    'defaultTimeframe': defaultTimeframe,
    'riskPreferences': riskPreferences,
    'tradingPreferences': tradingPreferences,
    'language': language,
    'timezone': timezone,
    'notificationPreferences': notificationPreferences,
    'aiPreferences': aiPreferences,
  };

  UserSettings copyWith({
    String? theme,
    String? defaultSymbol,
    String? defaultTimeframe,
    String? riskPreferences,
    String? tradingPreferences,
    String? language,
    String? timezone,
    Map<String, dynamic>? notificationPreferences,
    Map<String, dynamic>? aiPreferences,
  }) {
    return UserSettings(
      theme: theme ?? this.theme,
      defaultSymbol: defaultSymbol ?? this.defaultSymbol,
      defaultTimeframe: defaultTimeframe ?? this.defaultTimeframe,
      riskPreferences: riskPreferences ?? this.riskPreferences,
      tradingPreferences: tradingPreferences ?? this.tradingPreferences,
      language: language ?? this.language,
      timezone: timezone ?? this.timezone,
      notificationPreferences: notificationPreferences ?? this.notificationPreferences,
      aiPreferences: aiPreferences ?? this.aiPreferences,
    );
  }
}
