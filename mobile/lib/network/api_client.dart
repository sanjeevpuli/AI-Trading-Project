// lib/network/api_client.dart
import 'package:flutter/foundation.dart';
import 'package:cookie_jar/cookie_jar.dart';
import 'package:dio/dio.dart';
import 'package:dio_cookie_manager/dio_cookie_manager.dart';
import 'package:path_provider/path_provider.dart';
import '../config/api_config.dart';

class ApiClient {
  static ApiClient? _instance;
  late final Dio _dio;
  late final PersistCookieJar _cookieJar;

  ApiClient._();

  static Future<ApiClient> getInstance() async {
    if (_instance == null) {
      _instance = ApiClient._();
      await _instance!._init();
    }
    return _instance!;
  }

  Future<void> _init() async {
    final appDocDir = await getApplicationDocumentsDirectory();
    final cookiePath = '${appDocDir.path}/.cookies/';
    _cookieJar = PersistCookieJar(storage: FileStorage(cookiePath));
    debugPrint('API CLIENT: Initialized PersistCookieJar at $cookiePath');

    _dio = Dio(BaseOptions(
      baseUrl: ApiConfig.baseUrl,
      connectTimeout: const Duration(milliseconds: ApiConfig.connectTimeout),
      receiveTimeout: const Duration(milliseconds: ApiConfig.receiveTimeout),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    ));
    debugPrint('API CLIENT: Initialized Dio instance #${_dio.hashCode} with baseUrl: ${ApiConfig.baseUrl}');

    _dio.interceptors.add(CookieManager(_cookieJar));
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) {
        debugPrint('INTERCEPTOR onRequest: [${options.method}] ${options.uri}');
        handler.next(options);
      },
      onResponse: (response, handler) {
        debugPrint('INTERCEPTOR onResponse: [${response.statusCode}] ${response.requestOptions.uri}');
        handler.next(response);
      },
      onError: (DioException err, handler) {
        debugPrint('INTERCEPTOR onError: [${err.response?.statusCode ?? 'NO_STATUS'}] ${err.type} - ${err.message} for ${err.requestOptions.uri}');
        handler.next(err);
      },
    ));
    _dio.interceptors.add(LogInterceptor(
      request: true,
      requestHeader: true,
      requestBody: true,
      responseHeader: true,
      responseBody: true,
      error: true,
      logPrint: (obj) => debugPrint('DIO LOG: $obj'),
    ));
  }

  Dio get dio => _dio;
  PersistCookieJar get cookieJar => _cookieJar;

  Future<void> clearCookies() async {
    await _cookieJar.deleteAll();
    debugPrint('API CLIENT: Cleared all cookies');
  }
}
