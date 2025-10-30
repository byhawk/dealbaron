import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import '../../../core/theme/app_colors.dart';
import '../../../core/theme/app_text_styles.dart';
import '../../../core/widgets/glass_card.dart';
import '../../providers/auth_provider.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authProvider);

    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: AppColors.backgroundGradient,
        ),
        child: authState.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (error, stack) => Center(child: Text(error.toString())),
          data: (player) {
            if (player == null) {
              return const Center(child: Text('Please login'));
            }

            return SafeArea(
              child: CustomScrollView(
                slivers: [
                  // Custom App Bar
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.all(20),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                'Welcome Back,',
                                style: AppTextStyles.bodyMedium.copyWith(
                                  color: AppColors.textTertiary,
                                ),
                              ),
                              Text(
                                player.displayName,
                                style: AppTextStyles.headlineLarge,
                              ),
                            ],
                          )
                              .animate()
                              .fadeIn(duration: 600.ms)
                              .slideX(begin: -0.2, end: 0),
                          IconButton(
                            onPressed: () async {
                              await ref.read(authProvider.notifier).logout();
                            },
                            icon: const Icon(
                              Icons.logout_rounded,
                              color: AppColors.textSecondary,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),

                  // Balance Card
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      child: GlassCard(
                        padding: const EdgeInsets.all(24),
                        child: Column(
                          children: [
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(12),
                                  decoration: BoxDecoration(
                                    gradient: AppColors.primaryGradient,
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: const Icon(
                                    Icons.account_balance_wallet_rounded,
                                    color: AppColors.backgroundDark,
                                    size: 24,
                                  ),
                                ),
                                const SizedBox(width: 16),
                                Text(
                                  'Total Balance',
                                  style: AppTextStyles.bodyMedium,
                                ),
                              ],
                            ),
                            const SizedBox(height: 16),
                            Text(
                              '\$${NumberFormat('#,##0.00').format(player.balance)}',
                              style: AppTextStyles.currencyLarge,
                            ),
                            const SizedBox(height: 16),
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 12,
                                vertical: 6,
                              ),
                              decoration: BoxDecoration(
                                color: AppColors.success.withOpacity(0.2),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(
                                  color: AppColors.success.withOpacity(0.3),
                                  width: 1,
                                ),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(
                                    Icons.trending_up_rounded,
                                    color: AppColors.success,
                                    size: 16,
                                  ),
                                  const SizedBox(width: 4),
                                  Text(
                                    'Revenue: \$${NumberFormat('#,##0').format(player.totalRevenue)}',
                                    style: AppTextStyles.labelSmall.copyWith(
                                      color: AppColors.success,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      )
                          .animate()
                          .fadeIn(delay: 100.ms, duration: 600.ms)
                          .slideY(begin: 0.2, end: 0),
                    ),
                  ),

                  const SliverToBoxAdapter(child: SizedBox(height: 20)),

                  // Level & Stats
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      child: Row(
                        children: [
                          // Level Card
                          Expanded(
                            child: GlassCard(
                              padding: const EdgeInsets.all(16),
                              child: Column(
                                children: [
                                  Text(
                                    'LEVEL',
                                    style: AppTextStyles.labelSmall,
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    '${player.level}',
                                    style: AppTextStyles.numberLarge.copyWith(
                                      color: AppColors.primary,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    '${player.experience} XP',
                                    style: AppTextStyles.bodySmall,
                                  ),
                                ],
                              ),
                            )
                                .animate()
                                .fadeIn(delay: 200.ms, duration: 600.ms)
                                .scale(begin: const Offset(0.8, 0.8)),
                          ),
                          const SizedBox(width: 12),

                          // Trust Score Card
                          Expanded(
                            child: GlassCard(
                              padding: const EdgeInsets.all(16),
                              child: Column(
                                children: [
                                  Text(
                                    'TRUST',
                                    style: AppTextStyles.labelSmall,
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    '${player.trustScore}',
                                    style: AppTextStyles.numberLarge.copyWith(
                                      color: AppColors.accent,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    'Score',
                                    style: AppTextStyles.bodySmall,
                                  ),
                                ],
                              ),
                            )
                                .animate()
                                .fadeIn(delay: 300.ms, duration: 600.ms)
                                .scale(begin: const Offset(0.8, 0.8)),
                          ),
                          const SizedBox(width: 12),

                          // Transactions Card
                          Expanded(
                            child: GlassCard(
                              padding: const EdgeInsets.all(16),
                              child: Column(
                                children: [
                                  Text(
                                    'DEALS',
                                    style: AppTextStyles.labelSmall,
                                  ),
                                  const SizedBox(height: 8),
                                  Text(
                                    '${player.totalTransactions}',
                                    style: AppTextStyles.numberLarge.copyWith(
                                      color: AppColors.info,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    'Total',
                                    style: AppTextStyles.bodySmall,
                                  ),
                                ],
                              ),
                            )
                                .animate()
                                .fadeIn(delay: 400.ms, duration: 600.ms)
                                .scale(begin: const Offset(0.8, 0.8)),
                          ),
                        ],
                      ),
                    ),
                  ),

                  const SliverToBoxAdapter(child: SizedBox(height: 20)),

                  // Market Access Status
                  if (!player.marketUnlocked)
                    SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 20),
                        child: GlassCard(
                          padding: const EdgeInsets.all(20),
                          color: AppColors.warning.withOpacity(0.1),
                          border: Border.all(
                            color: AppColors.warning.withOpacity(0.3),
                            width: 1,
                          ),
                          child: Column(
                            children: [
                              Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.all(8),
                                    decoration: BoxDecoration(
                                      color: AppColors.warning.withOpacity(0.2),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: const Icon(
                                      Icons.lock_outline_rounded,
                                      color: AppColors.warning,
                                      size: 20,
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Text(
                                    'Market Locked',
                                    style: AppTextStyles.titleMedium.copyWith(
                                      color: AppColors.warning,
                                    ),
                                  ),
                                ],
                              ),
                              const SizedBox(height: 16),
                              _buildRequirement(
                                'Level 5',
                                player.level >= 5,
                              ),
                              _buildRequirement(
                                '10 Transactions',
                                player.totalTransactions >= 10,
                              ),
                              _buildRequirement(
                                '\$10,000 Revenue',
                                player.totalRevenue >= 10000,
                              ),
                              _buildRequirement(
                                '3 Days Active',
                                player.daysActive >= 3,
                              ),
                            ],
                          ),
                        )
                            .animate()
                            .fadeIn(delay: 500.ms, duration: 600.ms)
                            .slideY(begin: 0.2, end: 0),
                      ),
                    ),

                  const SliverToBoxAdapter(child: SizedBox(height: 20)),

                  // Quick Actions
                  SliverToBoxAdapter(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 20),
                      child: Text(
                        'Quick Actions',
                        style: AppTextStyles.titleMedium,
                      ),
                    ),
                  ),

                  const SliverToBoxAdapter(child: SizedBox(height: 12)),

                  SliverPadding(
                    padding: const EdgeInsets.symmetric(horizontal: 20),
                    sliver: SliverGrid(
                      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        mainAxisSpacing: 12,
                        crossAxisSpacing: 12,
                        childAspectRatio: 1.3,
                      ),
                      delegate: SliverChildListDelegate([
                        _buildQuickAction(
                          context,
                          'Market',
                          Icons.store_rounded,
                          AppColors.primaryGradient,
                          () {
                            // TODO: Navigate to market
                          },
                          delay: 600,
                        ),
                        _buildQuickAction(
                          context,
                          'Business',
                          Icons.business_rounded,
                          AppColors.secondaryGradient,
                          () {
                            // TODO: Navigate to business
                          },
                          delay: 700,
                        ),
                        _buildQuickAction(
                          context,
                          'Production',
                          Icons.precision_manufacturing_rounded,
                          AppColors.accentGradient,
                          () {
                            // TODO: Navigate to production
                          },
                          delay: 800,
                        ),
                        _buildQuickAction(
                          context,
                          'Profile',
                          Icons.person_rounded,
                          const LinearGradient(
                            colors: [AppColors.accentPurple, AppColors.accentOrange],
                          ),
                          () {
                            // TODO: Navigate to profile
                          },
                          delay: 900,
                        ),
                      ]),
                    ),
                  ),

                  const SliverToBoxAdapter(child: SizedBox(height: 40)),
                ],
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildRequirement(String text, bool completed) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          Icon(
            completed ? Icons.check_circle_rounded : Icons.cancel_rounded,
            color: completed ? AppColors.success : AppColors.textTertiary,
            size: 20,
          ),
          const SizedBox(width: 8),
          Text(
            text,
            style: AppTextStyles.bodySmall.copyWith(
              color: completed ? AppColors.textSecondary : AppColors.textTertiary,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickAction(
    BuildContext context,
    String title,
    IconData icon,
    Gradient gradient,
    VoidCallback onTap,
    int delay,
  ) {
    return GlassCard(
      onTap: onTap,
      padding: const EdgeInsets.all(20),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: gradient,
              borderRadius: BorderRadius.circular(12),
              boxShadow: [
                BoxShadow(
                  color: AppColors.primary.withOpacity(0.3),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Icon(
              icon,
              color: AppColors.backgroundDark,
              size: 28,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            title,
            style: AppTextStyles.titleSmall,
          ),
        ],
      ),
    )
        .animate()
        .fadeIn(delay: delay.ms, duration: 600.ms)
        .scale(begin: const Offset(0.8, 0.8));
  }
}
