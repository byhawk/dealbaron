import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';
import '../../core/constants/api_constants.dart';
import '../models/auth/login_request.dart';
import '../models/auth/register_request.dart';
import '../models/auth/auth_response.dart';

part 'auth_api_service.g.dart';

@RestApi()
abstract class AuthApiService {
  factory AuthApiService(Dio dio, {String baseUrl}) = _AuthApiService;

  @POST(ApiConstants.login)
  Future<AuthResponse> login(@Body() LoginRequest request);

  @POST(ApiConstants.register)
  Future<AuthResponse> register(@Body() RegisterRequest request);

  @GET(ApiConstants.profile)
  Future<Map<String, dynamic>> getProfile();

  @PUT(ApiConstants.updateProfile)
  Future<Map<String, dynamic>> updateProfile(@Body() Map<String, dynamic> data);

  @POST(ApiConstants.changePassword)
  Future<Map<String, dynamic>> changePassword(@Body() Map<String, dynamic> data);
}
