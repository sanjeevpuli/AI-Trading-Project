import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:ai_trading_flutter/main.dart' as app;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();

  testWidgets('Verify Dashboard Single Source of Truth', (WidgetTester tester) async {
    app.main();
    await tester.pumpAndSettle();

    // Find email field
    final emailField = find.byType(TextFormField).first;
    await tester.enterText(emailField, 'verify_wf2@example.com');
    
    // Find password field
    final passwordField = find.byType(TextFormField).last;
    await tester.enterText(passwordField, 'Password123!');
    
    await tester.pumpAndSettle();

    // Click Login
    final loginBtn = find.text('Login');
    await tester.tap(loginBtn);
    await tester.pumpAndSettle(const Duration(seconds: 5));

    // After login, we should be on the dashboard
    // We expect the exact backend values to be visible:
    // "balance": 39941.62907767385
    // "totalValue": 94941.62907767386
    // "unrealizedPnL": -5034.357179454382
    
    // Check if the balance is somewhere in the UI
    // We just find text containing these values
    expect(find.textContaining('39,941.63'), findsWidgets, reason: 'Balance should match backend');
    expect(find.textContaining('94,941.63'), findsWidgets, reason: 'Total Value should match backend');
    expect(find.textContaining('-5034.3'), findsWidgets, reason: 'Unrealized PnL should match backend');
  });
}
