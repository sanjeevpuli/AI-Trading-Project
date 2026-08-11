// lib/widgets/common/scaffold_with_nav.dart
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../theme/app_colors.dart';

class ScaffoldWithNav extends StatelessWidget {
  final Widget child;
  const ScaffoldWithNav({super.key, required this.child});

  static const _navItems = [
    (icon: Icons.dashboard_outlined, activeIcon: Icons.dashboard, label: 'Dashboard', path: '/dashboard'),
    (icon: Icons.candlestick_chart_outlined, activeIcon: Icons.candlestick_chart, label: 'Trade', path: '/trading'),
    (icon: Icons.pie_chart_outline, activeIcon: Icons.pie_chart, label: 'Portfolio', path: '/portfolio'),
    (icon: Icons.search, activeIcon: Icons.search, label: 'Scanner', path: '/scanner'),
    (icon: Icons.psychology_outlined, activeIcon: Icons.psychology, label: 'AI', path: '/agents'),
  ];

  int _selectedIndex(BuildContext context) {
    final location = GoRouterState.of(context).matchedLocation;
    for (var i = 0; i < _navItems.length; i++) {
      if (location.startsWith(_navItems[i].path)) return i;
    }
    return 0;
  }

  @override
  Widget build(BuildContext context) {
    final selectedIdx = _selectedIndex(context);

    return Scaffold(
      body: child,
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          border: Border(top: BorderSide(color: AppColors.surfaceVariant, width: 1)),
        ),
        child: NavigationBar(
          selectedIndex: selectedIdx,
          onDestinationSelected: (i) => context.go(_navItems[i].path),
          destinations: _navItems.map((item) => NavigationDestination(
            icon: Icon(item.icon),
            selectedIcon: Icon(item.activeIcon),
            label: item.label,
          )).toList(),
        ),
      ),
    );
  }
}
