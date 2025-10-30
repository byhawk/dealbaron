import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import '../../data/models/player/player_model.dart';
import '../../data/repositories/auth_repository.dart';

part 'auth_provider.g.dart';

@riverpod
class Auth extends _$Auth {
  @override
  Future<PlayerModel?> build() async {
    final repository = ref.read(authRepositoryProvider);
    final isLoggedIn = await repository.isLoggedIn();

    if (isLoggedIn) {
      try {
        return await repository.getProfile();
      } catch (e) {
        // If profile fetch fails, logout
        await repository.logout();
        return null;
      }
    }

    return null;
  }

  // Login
  Future<void> login(String username, String password) async {
    state = const AsyncValue.loading();

    state = await AsyncValue.guard(() async {
      final repository = ref.read(authRepositoryProvider);
      final player = await repository.login(username, password);
      return player;
    });
  }

  // Register
  Future<void> register({
    required String username,
    required String email,
    required String password,
    String? displayName,
  }) async {
    state = const AsyncValue.loading();

    state = await AsyncValue.guard(() async {
      final repository = ref.read(authRepositoryProvider);
      final player = await repository.register(
        username: username,
        email: email,
        password: password,
        displayName: displayName,
      );
      return player;
    });
  }

  // Logout
  Future<void> logout() async {
    final repository = ref.read(authRepositoryProvider);
    await repository.logout();
    state = const AsyncValue.data(null);
  }

  // Refresh profile
  Future<void> refreshProfile() async {
    state = const AsyncValue.loading();

    state = await AsyncValue.guard(() async {
      final repository = ref.read(authRepositoryProvider);
      return await repository.getProfile();
    });
  }

  // Check if logged in
  bool get isLoggedIn {
    return state.valueOrNull != null;
  }

  // Get current player
  PlayerModel? get currentPlayer {
    return state.valueOrNull;
  }
}
