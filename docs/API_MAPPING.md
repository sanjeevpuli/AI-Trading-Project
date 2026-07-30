# API Mapping Documentation

This document maps the API integrations between the Next.js frontend and the FastAPI backend.

---

## 1. Next.js Route Mappings

| Next.js API Path | Method | Purpose | Target Database Action / Schema |
|------------------|--------|---------|--------------------------------|
| `/api/auth/signup` | `POST` | User Registration | Creates `User` entry in PostgreSQL |
| `/api/auth/login` | `POST` | User Login Verification | Validates session, returns JWT cookie |
| `/api/auth/me` | `GET` | Retrieve session user metadata | Reads `User` details from PostgreSQL |
| `/api/portfolio` | `GET` | Get current portfolio values | Reads `Portfolio` from PostgreSQL |
| `/api/portfolio` | `POST` | Synchronize portfolio metrics | Upserts `Portfolio` in PostgreSQL |
| `/api/positions` | `GET` | List active user positions | Reads `Position` from PostgreSQL |
| `/api/positions` | `POST` | Create or update position | Upserts `Position` in PostgreSQL |
| `/api/positions` | `DELETE`| Close position | Deletes `Position` from PostgreSQL |
| `/api/trades` | `GET` | Get user closed trades logs | Reads `Trade` from PostgreSQL |
| `/api/trades` | `POST` | Log execution trade record | Inserts `Trade` into PostgreSQL |
| `/api/watchlist` | `GET` | Retrieve symbol watch list | Reads `Watchlist` from PostgreSQL |
| `/api/watchlist` | `POST` | Append watch symbol | Updates `Watchlist` in PostgreSQL |
| `/api/watchlist` | `DELETE`| Remove watch symbol | Updates `Watchlist` in PostgreSQL |
| `/api/signals` | `GET` | Fetch agent signals | Reads `AgentSignal` from PostgreSQL |

---

## 2. FastAPI Backend Mappings (Port 8000)

| FastAPI Path | Method | Request Schema | Response Schema | Integration Status |
|--------------|--------|----------------|-----------------|--------------------|
| `/api/v1/health` | `GET` | None | Dict status | Backend implemented. Frontend needs integration. |
| `/api/v1/market/price` | `GET` | None | List[`MarketPrice`] | Mock endpoint ready. |
| `/api/v1/portfolio` | `GET` | None | `PortfolioSummary` | Mock endpoint ready. |
| `/api/v1/trades` | `GET` | None | List[`ClosedTrade`] | Mock endpoint ready. |
| `/api/v1/trades/execute` | `POST` | `TradeRequest` | `TradeResponse` | Mock endpoint ready. |
| `/api/v1/agents/status` | `GET` | None | List[`AgentStatus`] | Mock endpoint ready. |
| `/api/v1/indicators/{symbol}` | `GET` | `symbol`, `indicators`, `interval`, `limit` | `IndicatorResponse` | Engine completed. Computes indicators on real historical candles. |
| `/api/v1/workflow` | `GET` | None | `WorkflowStateResponse` | LangGraph workflow stub runner is ready. |

---

## 3. Missing Frontend Endpoints

* **Backtesting Executor Endpoint**: The frontend Backtesting page lacks a corresponding backend API path to send backtest parameters and retrieve simulation logs.
* **Strategy Builder Endpoint**: Needs an endpoint to register custom rulesets or save strategy files to the backend database.
* **WebSocket Ticker Proxy**: The system currently connects directly to the Binance WebSocket from the client. It should connect via a backend websocket proxy to reduce connections and allow server-side processing.
