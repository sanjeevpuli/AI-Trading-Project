# Testing Checklist

This checklist outlines the verification steps required to ensure the system is ready for production.

---

## 1. Core Functions Testing

### Authentication
- [ ] Signup creates a new User in PostgreSQL.
- [ ] Signups with duplicate emails are rejected.
- [ ] Password hashes are salted and stored securely.
- [ ] Login rejects incorrect credentials.
- [ ] Login sets secure JWT HTTP-only cookie.
- [ ] Protected dashboard routes block unauthenticated users.
- [ ] Logouts clear active sessions and redirect.

### Dashboard Console
- [ ] Real-time price updates stream from Binance WebSocket.
- [ ] Stat cards calculate total portfolio value and P&L correctly.
- [ ] Recent trades table updates when a new trade is executed.
- [ ] Watchlist updates to reflect additions and removals.
- [ ] Live agent diagnostic activity logs scroll dynamically.

### Trading Portal
- [ ] Chart displays candlestick bars correctly.
- [ ] Limit and Market order tickets validate inputs.
- [ ] Placing an order updates the balance and opens a position.
- [ ] Stop Loss and Take Profit limits trigger execution.
- [ ] Liquidations trigger if margin ratio drops below limits.

### Portfolio Analytics
- [ ] Allocation charts update when positions are opened or closed.
- [ ] Drawdown charts match historical metrics.
- [ ] Sharpe ratio and win rate calculations match trade history.

### AI Agents
- [ ] Technical agent computes indicators correctly.
- [ ] Sentiment agent updates scores based on news events.
- [ ] Supervisor agent aggregates voting signals correctly.
- [ ] Execution agent simulates order fills with minimal slippage.

---

## 2. Non-Functional & Security Testing

### Responsiveness & Design
- [ ] Verify dashboard layout adjusts cleanly on mobile viewports.
- [ ] Navigation sidebar converts to mobile drawer on smaller screens.
- [ ] Charts scale responsively to fit screen containers.
- [ ] Touch gestures work on mobile scroll wrappers.

### Security
- [ ] API routes validate JWT session signatures.
- [ ] Core database credentials are read from secure env variables.
- [ ] CORS policies block unknown cross-origin requests.
- [ ] API parameters are validated to prevent SQL injection.

### Performance
- [ ] React components prevent unnecessary re-renders during high-frequency price updates.
- [ ] WebSocket connections handle reconnects gracefully.
- [ ] Dashboard page loads in under 1.5 seconds.
