import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../datasources/auth_api_service.dart';
import '../datasources/dio_client.dart';
import '../datasources/secure_storage_service.dart';
import '../models/auth/login_request.dart';
import '../models/auth/register_request.dart';
import '../models/player/player_model.dart';

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  final dio = ref.watch(dioProvider);
  final storage = ref.watch(secureStorageProvider);
  return AuthRepository(dio, storage);
});

class AuthRepository {
  final Dio _dio;
  final SecureStorageService _storage;
  late final AuthApiService _apiService;

  AuthRepository(this._dio, this._storage) {
    _apiService = AuthApiService(_dio);
  }

  // Login
  Future<PlayerModel> login(String username, String password) async {
    try {
      final request = LoginRequest(
        username: username,
        password: password,
      );

      final response = await _apiService.login(request);

      if (response.success) {
        // Save token and user data
        await _storage.saveToken(response.data.token);
        await _storage.saveUserId(response.data.player.id);
        await _storage.saveUsername(response.data.player.username);

        // Add token to dio headers
        _dio.options.headers['Authorization'] = 'Bearer ${response.data.token}';

        return response.data.player;
      } else {
        throw Exception('Login failed');
      }
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Register
  Future<PlayerModel> register({
    required String username,
    required String email,
    required String password,
    String? displayName,
  }) async {
    try {
      final request = RegisterRequest(
        username: username,
        email: email,
        password: password,
        displayName: displayName,
      );

      final response = await _apiService.register(request);

      if (response.success) {
        // Save token and user data
        await _storage.saveToken(response.data.token);
        await _storage.saveUserId(response.data.player.id);
        await _storage.saveUsername(response.data.player.username);

        // Add token to dio headers
        _dio.options.headers['Authorization'] = 'Bearer ${response.data.token}';

        return response.data.player;
      } else {
        throw Exception('Registration failed');
      }
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Get Profile
  Future<PlayerModel> getProfile() async {
    try {
      final token = await _storage.getToken();
      if (token == null) {
        throw Exception('No authentication token found');
      }

      _dio.options.headers['Authorization'] = 'Bearer $token';

      final response = await _apiService.getProfile();

      if (response['success'] == true) {
        return PlayerModel.fromJson(response['data']);
      } else {
        throw Exception('Failed to fetch profile');
      }
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }

  // Logout
  Future<void> logout() async {
    await _storage.clearAll();
    _dio.options.headers.remove('Authorization');
  }

  // Check if logged in
  Future<bool> isLoggedIn() async {
    return await _storage.hasToken();
  }

  // Get stored token
  Future<String?> getToken() async {
    return await _storage.getToken();
  }

  // Initialize auth headers
  Future<void> initializeAuth() async {
    final token = await _storage.getToken();
    if (token != null) {
      _dio.options.headers['Authorization'] = 'Bearer $token';
    }
  }

  // Error handling
  String _handleError(DioException error) {
    if (error.response != null) {
      final data = error.response!.data;
      if (data is Map && data.containsKey('error')) {
        return data['error'].toString();
      } else if (data is Map && data.containsKey('message')) {
        return data['message'].toString();
      }
      return 'Server error: ${error.response!.statusCode}';
    } else if (error.type == DioExceptionType.connectionTimeout) {
      return 'Connection timeout. Please check your internet connection.';
    } else if (error.type == DioExceptionType.receiveTimeout) {
      return 'Server is taking too long to respond.';
    } else if (error.type == DioExceptionType.unknown) {
      return 'Network error. Please check your internet connection.';
    }
    return 'An unexpected error occurred.';
  }
}
