// lib/screens/profile/profile_screen.dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../theme/app_colors.dart';
import '../../providers/providers.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(title: const Text('Profile')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Avatar & Info
            Center(
              child: Column(
                children: [
                  Container(
                    width: 80,
                    height: 80,
                    decoration: const BoxDecoration(
                      gradient: LinearGradient(
                        colors: [AppColors.cyan, AppColors.blue],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      shape: BoxShape.circle,
                    ),
                    child: Center(
                      child: Text(
                        user?.email.substring(0, 1).toUpperCase() ?? 'U',
                        style: const TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.w800),
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  Text(
                    user?.email ?? 'Unknown User',
                    style: const TextStyle(color: AppColors.textPrimary, fontSize: 18, fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 4),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.profit.withAlpha(26),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: AppColors.profit.withAlpha(51)),
                    ),
                    child: const Text('Active Trader', style: TextStyle(color: AppColors.profit, fontSize: 12, fontWeight: FontWeight.w600)),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),

            // Quick Links
            _SectionCard(children: [
              _ProfileLink(icon: Icons.person_outline, label: 'Account Details', onTap: () {}),
              _Divider(),
              _ProfileLink(icon: Icons.security, label: 'Security & 2FA', onTap: () {}),
              _Divider(),
              _ProfileLink(icon: Icons.key_outlined, label: 'API Keys', onTap: () {}),
            ]),
            const SizedBox(height: 16),

            _SectionCard(children: [
              _ProfileLink(icon: Icons.settings_outlined, label: 'Preferences', onTap: () => context.go('/settings')),
              _Divider(),
              _ProfileLink(icon: Icons.notifications_outlined, label: 'Notifications', onTap: () => context.go('/notifications')),
              _Divider(),
              _ProfileLink(icon: Icons.history, label: 'Trade History', onTap: () => context.go('/history')),
            ]),
            const SizedBox(height: 16),

            _SectionCard(children: [
              _ProfileLink(
                icon: Icons.help_outline,
                label: 'Help & Support',
                onTap: () {},
              ),
              _Divider(),
              _ProfileLink(
                icon: Icons.info_outline,
                label: 'About QuantAI',
                onTap: () {},
              ),
            ]),
            const SizedBox(height: 16),

            // Sign Out
            SizedBox(
              width: double.infinity,
              height: 52,
              child: OutlinedButton.icon(
                icon: const Icon(Icons.logout, color: AppColors.loss),
                label: const Text('Sign Out', style: TextStyle(color: AppColors.loss, fontWeight: FontWeight.w700)),
                onPressed: () async {
                  final confirm = await showDialog<bool>(
                    context: context,
                    builder: (ctx) => AlertDialog(
                      backgroundColor: AppColors.surface,
                      title: const Text('Sign Out?', style: TextStyle(color: AppColors.textPrimary)),
                      content: const Text('You will be signed out of your account.', style: TextStyle(color: AppColors.textSecondary)),
                      actions: [
                        TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Cancel')),
                        ElevatedButton(
                          onPressed: () => Navigator.pop(ctx, true),
                          style: ElevatedButton.styleFrom(backgroundColor: AppColors.loss),
                          child: const Text('Sign Out'),
                        ),
                      ],
                    ),
                  );
                  if (confirm == true) {
                    final service = ref.read(authServiceProvider);
                    await service.logout();
                    ref.read(currentUserProvider.notifier).state = null;
                    ref.read(authStatusProvider.notifier).state = AuthStatus.unauthenticated;
                    if (context.mounted) context.go('/login');
                  }
                },
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: AppColors.loss),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
              ),
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }
}

class _SectionCard extends StatelessWidget {
  final List<Widget> children;
  const _SectionCard({required this.children});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.surfaceVariant),
      ),
      child: Column(children: children),
    );
  }
}

class _ProfileLink extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _ProfileLink({required this.icon, required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon, color: AppColors.textSecondary, size: 20),
      title: Text(label, style: const TextStyle(color: AppColors.textPrimary, fontSize: 14)),
      trailing: const Icon(Icons.chevron_right, color: AppColors.textMuted, size: 18),
      onTap: onTap,
    );
  }
}

class _Divider extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return const Divider(height: 1, color: AppColors.surfaceVariant, indent: 16, endIndent: 16);
  }
}
