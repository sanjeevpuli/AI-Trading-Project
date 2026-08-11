# QuantAI — Flutter Mobile App

QuantAI is a production-grade Flutter mobile application for the AI Trading Platform.

## Architecture

The Flutter app is a **pure client** of the existing Next.js backend:
- NO direct Binance API connections
- ALL market data via backend `/api/market` (Market Data Agent)
- ALL AI signals via backend `/api/signals` and `/api/agents`
- Session auth via `HttpOnly` cookies managed by `PersistCookieJar`

## Tech Stack

| Concern           | Package                          |
|-------------------|----------------------------------|
| HTTP Client       | `dio` + `dio_cookie_manager`     |
| Cookie Session    | `cookie_jar` (PersistCookieJar)  |
| State Management  | `flutter_riverpod`               |
| Navigation        | `go_router`                      |
| Charts            | `fl_chart`                       |
| Live Market Data  | REST polling via backend proxy   |

## Project Structure

```
lib/
├── config/          # API endpoints & constants
├── models/          # Data models (User, Portfolio, Position, Order, Agent, Signal)
├── network/         # Dio client with PersistCookieJar
├── providers/       # Riverpod providers (services + state)
├── routing/         # GoRouter with auth guards
├── screens/
│   ├── splash/      # Animated splash + auth check
│   ├── auth/        # Login, Signup, ForgotPassword, ResetPassword
│   ├── dashboard/   # Portfolio overview, positions, AI consensus banner
│   ├── trading/     # Market/Limit orders, Long/Short, SL/TP
│   ├── portfolio/   # Portfolio stats + equity curve
│   ├── scanner/     # Live market scanner (12+ pairs)
│   ├── agents/      # Full 9-node AI pipeline visualization
│   ├── backtesting/ # Backtest engine with sliders + results
│   ├── positions/   # Open positions + close confirmation
│   ├── history/     # Trade history with stats
│   ├── watchlist/   # Managed watchlist with live prices
│   ├── notifications/# Swipe-to-delete, mark-as-read, type icons
│   ├── settings/    # UserSettings API integration
│   └── profile/     # Avatar, links, sign-out
├── services/        # Auth, Dashboard, Market, Trading, Agent, Notification, Settings
├── theme/           # AppColors, AppTheme (Material 3, zinc/cyan dark)
└── widgets/
    ├── common/      # StatCard, PnlBadge, ScaffoldWithNav
    ├── charts/      # Chart components
    └── trading/     # PositionCard
```

## AI Pipeline Screen

The Agents screen faithfully renders the complete pipeline:
```
Market Data Agent
       ↓
Technical Analysis Agent
       ↓
Sentiment Intelligence Agent
       ↓
Market Regime Agent
       ↓
Risk Management Agent
       ↓
Portfolio Agent
       ↓
Consensus Coordinator
       ↓
Execution Agent
       ↓
Agent Memory
```

## Getting Started

### Prerequisites
- Flutter SDK ≥ 3.3.0
- Dart ≥ 3.3.0
- Android Studio / Xcode

### Setup

```bash
cd c:\ai-trading-flutter
flutter pub get
```

### Configure Backend URL

Edit `lib/config/api_config.dart`:
```dart
static const String baseUrl = 'http://10.0.2.2:3000';  // Android emulator
// static const String baseUrl = 'http://192.168.x.x:3000'; // Physical device
// static const String baseUrl = 'https://your-domain.com'; // Production
```

### Run

```bash
flutter run
```

### Build APK

```bash
flutter build apk --release
```

## Backend Required

The Next.js backend must be running on port 3000 with:
- `/api/auth/*` — authentication endpoints
- `/api/dashboard` — consolidated dashboard data
- `/api/market` — Market Data Agent proxy to Binance
- `/api/signals` — AI agent signals
- `/api/agents` — agent status and health
- `/api/portfolio` — portfolio metrics
- `/api/positions` — open positions
- `/api/orders` — pending orders
- `/api/trades` — trade history
- `/api/watchlist` — user watchlist
- `/api/notifications` — alerts and notifications
- `/api/settings` — user settings (UserSettings model)
- `/api/backtesting` — backtesting engine
