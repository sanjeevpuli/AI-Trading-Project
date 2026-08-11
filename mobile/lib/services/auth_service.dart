// lib/services/auth_service.dart
import 'package:flutter/foundation.dart';
import 'package:dio/dio.dart';
import '../network/api_client.dart';
import '../config/api_config.dart';
import '../models/user.dart';

class AuthService {
  final ApiClient _client;

  AuthService(this._client);

  Future<UserModel> login(String email, String password) async {
    final dio = _client.dio;
    final fullUrl = '${dio.options.baseUrl}${ApiConfig.login}';

    debugPrint('LOGIN START');
    debugPrint('FULL URL: $fullUrl');
    debugPrint('REQUEST SENT');

    try {
      final response = await dio.post(
        ApiConfig.login,
        data: {'email': email, 'password': password},
      );

      debugPrint('RESPONSE RECEIVED: ${response.statusCode}');
      final userData = response.data['user'] as Map<String, dynamic>;
      return UserModel.fromJson(userData);
    } on DioException catch (e) {
      debugPrint('REQUEST FAILED: $e');
      debugPrint('REQUEST FAILED (type): ${e.type}');
      debugPrint('REQUEST FAILED (response status): ${e.response?.statusCode}');
      debugPrint('REQUEST FAILED (response data): ${e.response?.data}');
      rethrow;
    } catch (e) {
      debugPrint('REQUEST FAILED (non-dio): $e');
      rethrow;
    }
  }

  Future<UserModel> signup(String email, String password) async {
    final dio = _client.dio;
    final fullUrl = '${dio.options.baseUrl}${ApiConfig.signup}';
    debugPrint('SIGNUP START: $fullUrl');

    final response = await dio.post(
      ApiConfig.signup,
      data: {'email': email, 'password': password},
    );

    return UserModel.fromJson(response.data['user'] as Map<String, dynamic>);
  }

  Future<void> logout() async {
    try {
      await _client.dio.post(ApiConfig.logout);
    } catch (_) {}
    await _client.clearCookies();
  }

  Future<UserModel?> getCurrentUser() async {
    final dio = _client.dio;
    final fullUrl = '${dio.options.baseUrl}${ApiConfig.me}';
    debugPrint('GET CURRENT USER: $fullUrl');

    try {
      final response = await dio.get(ApiConfig.me);
      if (response.data['user'] != null) {
        return UserModel.fromJson(response.data['user'] as Map<String, dynamic>);
      }
      return null;
    } on DioException catch (e) {
      if (e.response?.statusCode == 401) {
        debugPrint('GET CURRENT USER: 401 Unauthorized (No active session)');
        return null;
      }
      debugPrint('GET CURRENT USER FAILED: $e');
      rethrow;
    }
  }

  Future<void> forgotPassword(String email) async {
    await _client.dio.post(ApiConfig.forgotPassword, data: {'email': email});
  }

  Future<void> resetPassword(String token, String password) async {
    await _client.dio.post(ApiConfig.resetPassword, data: {'token': token, 'password': password});
  }
}
