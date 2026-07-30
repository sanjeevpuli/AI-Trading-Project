# Project Repository Audit

This document provides a comprehensive software architecture audit of the Autonomous Multi-Agent Trading Intelligence System.

---

## 1. Overall Project Architecture
The application is a full-stack, split-process software platform configured as follows:
* **Frontend**: Next.js 16 (App Router) combined with React, styled via Tailwind CSS, and using Zustand for reactive client-side store management.
* **Authentication**: Handled via Next-Auth styled route API handlers, edge-run route verification via `proxy.ts`, and React Session context.
* **Data Persistence**: Prisma Client integrated with a PostgreSQL primary database, mapping relations for Users, Portfolios, active Positions, and Trade histories.
* **Backend**: An independent Python FastAPI server executing technical indicator engines, mock databases, and multi-agent workflow topologies orchestrated via LangGraph.

---

## 2. Directory Structure

```
ai-trading-system/
├── app/                  # Next.js App Router (Dashboard layout, auth flow, public marketing)
├── components/           # Reusable React components (Dashboard stats, charts, tables)
├── context/              # Context providers (AuthContext)
├── docs/                 # Documentation directory (this folder)
├── hooks/                # Custom React hooks (useMarketData, etc.)
├── lib/                  # Frontend core helpers, auth middleware, and client-side trading services
│   ├── services/         # Client engines (agentCoordinator, backtestEngine, riskManager, etc.)
│   ├── store/            # Zustand state stores (tradingStore.ts)
│   └── types/            # TypeScript interfaces
├── prisma/               # Database schema definitions and migrations
├── public/               # Static assets
├── backend/              # Python FastAPI service
│   ├── api/              # Versioned API routes (v1 endpoints for health, indicators, market, etc.)
│   ├── core/             # Base configurations and settings
│   ├── database/         # SQLite engine for development & base mappings
│   ├── models/           # SQLAlchemy schemas & validation Pydantic models
│   ├── services/         # Technical indicators and real-time cache engines
│   ├── tools/            # Python LangGraph tools
│   ├── workflows/        # LangGraph StateGraph configurations
│   ├── main.py           # FastAPI server entrypoint
│   └── requirements.txt  # Python requirements
└── proxy.ts              # Next.js App Router Edge routing and session gateway
```

---

## 3. Route Inventory (Next.js & FastAPI)

### Frontend (Next.js pages)
* `/` (Marketing Home Page)
* `/features` (Features Description Page)
* `/about` (Company/Platform Overview)
* `/contact` (Support / Contact Page)
* `/login` (Login Authentication Page)
* `/signup` (Sign Up Page)
* `/forgot-password` (Forgot Password Recovery)
* `/dashboard` (Main AI multi-agent Overview Console)
* `/trading` (Binance Interactive Terminal, chart, and order ticket)
* `/positions` (Active trade positions table view)
* `/history` (Closed trades log and summary)
* `/portfolio` (Portfolio allocation and metrics analytics)
* `/risk` (Drawdowns, exposure levels, VaR limits console)
* `/backtesting` (Custom agent strategy simulator console)
* `/signals` (Consensus and sub-agent indicators live feed)
* `/scanner` (Macro asset screener)
* `/watchlist` (Selected symbol watch lists)
* `/notifications` (Risk triggers and agent notifications)
* `/settings` (User profile and API credentials configurations)

### Frontend API Handlers
* `/api/auth/login` (Authentication edge login handler)
* `/api/auth/signup` (User creation edge route)
* `/api/auth/me` (Session retrieval edge route)
* `/api/portfolio` (GET metrics, POST synchronization)
* `/api/trades` (GET closed logs, POST execution sync)
* `/api/positions` (GET active entries, POST updates, DELETE closeouts)
* `/api/watchlist` (GET symbol watchlist, POST/DELETE modifications)
* `/api/signals` (GET consensus data logs)

### Backend API Handlers (FastAPI - Port 8000)
* `GET /api/v1/health` (Service health status indicators)
* `GET /api/v1/ping` (Service connectivity confirmation)
* `GET /api/v1/market/price` (Market tickers for BTC, ETH, SOL)
* `GET /api/v1/portfolio` (Development mock portfolio indicators)
* `GET /api/v1/trades` (Mock history endpoint)
* `POST /api/v1/trades/execute` (Order placement sandbox)
* `GET /api/v1/agents/status` (AI Sub-agent engine status array)
* `GET /api/v1/indicators/{symbol}` (Candle loader and indicator processor)
* `GET /api/v1/workflow` (StateGraph execution and workflow validation runner)

---

## 4. Key Architectural Integrations

### State Management
* **Zustand (`lib/store/tradingStore.ts`)**: Serves as the global reactive cache, managing Binance WebSocket tickers, active positions, local historical logs, and agent activity updates.
* **React Context (`context/AuthContext.tsx`)**: Manages current user credentials, tokens, and active session validation states.

### WebSocket Usage
* **Binance WebSocket Stream (`lib/services/binanceService.ts`)**: Listens to Binance live streams (`@ticker` and `@kline_1m` channels) for real-time price changes, passing them to the Zustand store, which triggers sub-second screen re-renders.

### Database Interaction Points
* Prisma is used to perform PostgreSQL persistence for authenticated sessions.
* On the backend, SQLAlchemy is used with a local SQLite file (`trading_system.db`) to record trade, position, portfolio, and decision states.

---

## 5. Technical Debt & Production Readiness

### Missing / Mock Features
* The FastAPI backend uses mock data for portfolio overview, trades, and agents.
* The frontend coordinates agents client-side (`coordinateAgentConsensus` in TypeScript) instead of relying on the FastAPI LangGraph execution workflow.
* Integration between the Next.js database (Prisma/PostgreSQL) and the FastAPI database (SQLAlchemy/SQLite) is not yet implemented.

### Technical Debt
* Duplicate trading engine implementations exist in TypeScript (`tradingEngine.ts`, `riskManager.ts`) and Python (`execution/`, `risk/` stubs).
* LangGraph nodes use static LLM mocks (`MockProvider`).
* The system lacks automated end-to-end integration tests between Next.js and FastAPI.

### Production Readiness Score: **68 / 100**

### Top Priorities Before Production
1. **Bridge Frontend to FastAPI**: Update Zustand store actions to call backend FastAPI endpoints (e.g. `/api/v1/trades/execute` and `/api/v1/workflow`) instead of calculating metrics client-side.
2. **Upgrade LLM Provider**: Replace the `MockProvider` with `OllamaProvider` or another API-backed LLM in the backend.
3. **Database Consolidation**: Sync Next.js user IDs to FastAPI database queries to ensure proper data isolation.
4. **WebSocket Integration**: Proxy the Binance WebSocket stream through the FastAPI backend to reduce direct client-side socket connections.
