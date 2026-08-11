// lib/services/notification_service.dart
import '../network/api_client.dart';
import '../config/api_config.dart';
import '../models/notification.dart';

class NotificationService {
  final ApiClient _client;
  NotificationService(this._client);

  Future<List<NotificationModel>> getNotifications() async {
    final response = await _client.dio.get(ApiConfig.notifications);
    return (response.data as List<dynamic>)
        .map((e) => NotificationModel.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  Future<void> markAsRead(String id) async {
    await _client.dio.patch(
      ApiConfig.notifications,
      data: {'id': id, 'isRead': true},
    );
  }

  Future<void> markAllAsRead() async {
    await _client.dio.patch(
      ApiConfig.notifications,
      data: {'id': 'all', 'isRead': true},
    );
  }

  Future<void> deleteNotification(String id) async {
    await _client.dio.delete('${ApiConfig.notifications}?id=$id');
  }
}
