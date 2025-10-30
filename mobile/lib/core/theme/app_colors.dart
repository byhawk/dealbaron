import 'package:flutter/material.dart';

class AppColors {
  AppColors._();

  // Primary Colors - Gold/Luxury Theme
  static const Color primary = Color(0xFFFFB84D); // Rich Gold
  static const Color primaryDark = Color(0xFFE5A000);
  static const Color primaryLight = Color(0xFFFFD699);

  // Secondary Colors - Deep Blue
  static const Color secondary = Color(0xFF1E3A8A); // Deep Blue
  static const Color secondaryDark = Color(0xFF0F1F4B);
  static const Color secondaryLight = Color(0xFF3B5998);

  // Accent Colors
  static const Color accent = Color(0xFF10B981); // Emerald Green
  static const Color accentOrange = Color(0xFFFF6B35);
  static const Color accentPurple = Color(0xFF8B5CF6);

  // Background Colors
  static const Color backgroundDark = Color(0xFF0A0E27);
  static const Color backgroundMedium = Color(0xFF151B3D);
  static const Color backgroundLight = Color(0xFF1F2949);
  static const Color surface = Color(0xFF252D50);
  static const Color surfaceLight = Color(0xFF2F3760);

  // Text Colors
  static const Color textPrimary = Color(0xFFFFFFFF);
  static const Color textSecondary = Color(0xFFB0B8D4);
  static const Color textTertiary = Color(0xFF7E88A8);
  static const Color textDisabled = Color(0xFF4A5278);

  // Semantic Colors
  static const Color success = Color(0xFF10B981);
  static const Color error = Color(0xFFEF4444);
  static const Color warning = Color(0xFFF59E0B);
  static const Color info = Color(0xFF3B82F6);

  // Status Colors
  static const Color profit = Color(0xFF10B981);
  static const Color loss = Color(0xFFEF4444);
  static const Color neutral = Color(0xFF94A3B8);

  // Gradient Colors
  static const LinearGradient primaryGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFFFFB84D), Color(0xFFE5A000)],
  );

  static const LinearGradient secondaryGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF1E3A8A), Color(0xFF0F1F4B)],
  );

  static const LinearGradient accentGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF10B981), Color(0xFF059669)],
  );

  static const LinearGradient backgroundGradient = LinearGradient(
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
    colors: [Color(0xFF0A0E27), Color(0xFF1F2949)],
  );

  static const LinearGradient cardGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF252D50), Color(0xFF1F2949)],
  );

  static const LinearGradient glassmorphismGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [
      Color(0x40FFFFFF),
      Color(0x10FFFFFF),
    ],
  );

  // Shimmer Colors
  static const Color shimmerBase = Color(0xFF1F2949);
  static const Color shimmerHighlight = Color(0xFF2F3760);

  // Divider & Border
  static const Color divider = Color(0xFF2F3760);
  static const Color border = Color(0xFF3F4770);
  static const Color borderLight = Color(0xFF4F5780);

  // Chart Colors
  static const List<Color> chartColors = [
    Color(0xFFFFB84D), // Gold
    Color(0xFF10B981), // Green
    Color(0xFF3B82F6), // Blue
    Color(0xFF8B5CF6), // Purple
    Color(0xFFFF6B35), // Orange
    Color(0xFFEC4899), // Pink
  ];

  // Market Category Colors
  static const Color categoryRawMaterial = Color(0xFF78716C); // Stone
  static const Color categoryIntermediate = Color(0xFF3B82F6); // Blue
  static const Color categoryFinishedGood = Color(0xFF10B981); // Green
  static const Color categoryLuxury = Color(0xFFFFB84D); // Gold

  // Shadow Colors
  static Color shadow = Colors.black.withOpacity(0.3);
  static Color shadowLight = Colors.black.withOpacity(0.15);
  static Color shadowHeavy = Colors.black.withOpacity(0.6);

  // Get color by category
  static Color getCategoryColor(String category) {
    switch (category.toLowerCase()) {
      case 'raw_material':
        return categoryRawMaterial;
      case 'intermediate':
        return categoryIntermediate;
      case 'finished_good':
        return categoryFinishedGood;
      case 'luxury':
        return categoryLuxury;
      default:
        return neutral;
    }
  }
}
