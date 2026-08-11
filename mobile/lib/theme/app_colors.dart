// lib/theme/app_colors.dart
import 'package:flutter/material.dart';

class AppColors {
  // Backgrounds
  static const Color background = Color(0xFF09090B); // zinc-950
  static const Color surface = Color(0xFF18181B);    // zinc-900
  static const Color surfaceVariant = Color(0xFF27272A); // zinc-800
  static const Color border = Color(0xFF3F3F46);     // zinc-700

  // Text
  static const Color textPrimary = Color(0xFFFAFAFA);   // zinc-50
  static const Color textSecondary = Color(0xFFA1A1AA); // zinc-400
  static const Color textMuted = Color(0xFF71717A);     // zinc-500

  // Brand/Accent
  static const Color cyan = Color(0xFF06B6D4);     // cyan-500
  static const Color cyanDark = Color(0xFF0891B2); // cyan-600
  static const Color blue = Color(0xFF3B82F6);
  static const Color blueDark = Color(0xFF2563EB);

  // Status
  static const Color profit = Color(0xFF10B981);   // emerald-500
  static const Color loss = Color(0xFFEF4444);     // red-500
  static const Color warning = Color(0xFFF59E0B);  // amber-500
  static const Color error = Color(0xFFEF4444);    // red-500
  static const Color info = Color(0xFF06B6D4);

  // Agent Colors
  static const Color agentMarket = Color(0xFF06B6D4);
  static const Color agentTechnical = Color(0xFF8B5CF6);
  static const Color agentSentiment = Color(0xFFF59E0B);
  static const Color agentRisk = Color(0xFFEF4444);
  static const Color agentPortfolio = Color(0xFF10B981);
  static const Color agentConsensus = Color(0xFF3B82F6);
  static const Color agentExecution = Color(0xFFA855F7);
  static const Color agentMemory = Color(0xFF6366F1);
  static const Color agentRegime = Color(0xFFEC4899);

  // Chart
  static const Color bullCandle = Color(0xFF10B981);
  static const Color bearCandle = Color(0xFFEF4444);
  static const Color chartGrid = Color(0xFF27272A);
}
