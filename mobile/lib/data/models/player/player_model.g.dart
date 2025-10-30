// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'player_model.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$PlayerModelImpl _$$PlayerModelImplFromJson(Map<String, dynamic> json) =>
    _$PlayerModelImpl(
      id: json['id'] as String,
      username: json['username'] as String,
      email: json['email'] as String,
      displayName: json['displayName'] as String,
      level: (json['level'] as num).toInt(),
      experience: (json['experience'] as num).toInt(),
      balance: (json['balance'] as num).toDouble(),
      trustScore: (json['trustScore'] as num).toInt(),
      marketUnlocked: json['marketUnlocked'] as bool,
      totalTransactions: (json['totalTransactions'] as num).toInt(),
      totalRevenue: (json['totalRevenue'] as num).toDouble(),
      daysActive: (json['daysActive'] as num).toInt(),
      lastLogin: json['lastLogin'] == null
          ? null
          : DateTime.parse(json['lastLogin'] as String),
      createdAt: json['createdAt'] == null
          ? null
          : DateTime.parse(json['createdAt'] as String),
    );

Map<String, dynamic> _$$PlayerModelImplToJson(_$PlayerModelImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'username': instance.username,
      'email': instance.email,
      'displayName': instance.displayName,
      'level': instance.level,
      'experience': instance.experience,
      'balance': instance.balance,
      'trustScore': instance.trustScore,
      'marketUnlocked': instance.marketUnlocked,
      'totalTransactions': instance.totalTransactions,
      'totalRevenue': instance.totalRevenue,
      'daysActive': instance.daysActive,
      'lastLogin': instance.lastLogin?.toIso8601String(),
      'createdAt': instance.createdAt?.toIso8601String(),
    };
