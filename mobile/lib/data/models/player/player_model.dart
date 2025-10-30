import 'package:freezed_annotation/freezed_annotation.dart';

part 'player_model.freezed.dart';
part 'player_model.g.dart';

@freezed
class PlayerModel with _$PlayerModel {
  const factory PlayerModel({
    required String id,
    required String username,
    required String email,
    required String displayName,
    required int level,
    required int experience,
    required double balance,
    required int trustScore,
    required bool marketUnlocked,
    required int totalTransactions,
    required double totalRevenue,
    required int daysActive,
    DateTime? lastLogin,
    DateTime? createdAt,
  }) = _PlayerModel;

  factory PlayerModel.fromJson(Map<String, dynamic> json) =>
      _$PlayerModelFromJson(json);
}
