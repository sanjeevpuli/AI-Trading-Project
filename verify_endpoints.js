// verify_endpoints.js — Test all API endpoints and auth flow
async function run() {
  const BASE = 'http://localhost:3000';
  const testEmail = `verify_${Date.now()}@example.com`;
  const testPass = 'VerifyPass123!';

  // 1. AUTH FLOW: Signup → Login → /me → endpoints → Logout
  console.log('=== AUTH FLOW ===');

  // Signup
  const signupRes = await fetch(`${BASE}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: testPass })
  });
  console.log(`POST /api/auth/signup: ${signupRes.status}`);
  let cookie = signupRes.headers.get('set-cookie');
  const signupBody = await signupRes.json();
  console.log(`  User: ${signupBody.user?.email || 'N/A'}, ID: ${signupBody.user?.id || 'N/A'}`);
  const userId = signupBody.user?.id;

  // Login (verify cookie works after signup)
  const loginRes = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: testPass })
  });
  console.log(`POST /api/auth/login: ${loginRes.status}`);
  cookie = loginRes.headers.get('set-cookie') || cookie;

  if (!cookie) { console.error('NO COOKIE — cannot continue'); return; }

  // /me check
  const meRes = await fetch(`${BASE}/api/auth/me`, { headers: { Cookie: cookie } });
  const meBody = await meRes.json();
  console.log(`GET /api/auth/me: ${meRes.status} — ${meBody.user?.email || 'N/A'}`);

  // 2. API ENDPOINTS
  console.log('\n=== API ENDPOINTS ===');

  const endpoints = [
    { method: 'GET', path: '/api/dashboard', key: 'portfolio' },
    { method: 'GET', path: '/api/orders', key: null },
    { method: 'GET', path: '/api/positions', key: null },
    { method: 'GET', path: '/api/trades', key: 'executionHistory' },
    { method: 'GET', path: '/api/signals', key: 'signals' },
    { method: 'GET', path: '/api/agents', key: 'agents' },
  ];

  for (const ep of endpoints) {
    const start = Date.now();
    const res = await fetch(`${BASE}${ep.path}`, { headers: { Cookie: cookie } });
    const latency = Date.now() - start;
    let body;
    try { body = await res.json(); } catch { body = 'parse error'; }
    
    let summary = '';
    if (ep.key && typeof body === 'object' && body[ep.key]) {
      const val = body[ep.key];
      if (Array.isArray(val)) summary = `[${val.length} items]`;
      else if (typeof val === 'object') summary = JSON.stringify(val).slice(0, 150);
    } else if (Array.isArray(body)) {
      summary = `[${body.length} items]`;
    }
    
    console.log(`${ep.method} ${ep.path}: ${res.status} (${latency}ms) ${summary}`);
  }

  // 3. Dashboard detail for portfolio comparison
  console.log('\n=== PORTFOLIO STATE (from /api/dashboard) ===');
  const dashRes = await fetch(`${BASE}/api/dashboard`, { headers: { Cookie: cookie } });
  const dash = await dashRes.json();
  console.log(`  balance: ${dash.portfolio?.balance}`);
  console.log(`  startingBalance: ${dash.portfolio?.startingBalance}`);
  console.log(`  unrealizedPnL: ${dash.portfolio?.unrealizedPnL}`);
  console.log(`  realizedPnL: ${dash.portfolio?.realizedPnL}`);
  console.log(`  netExposure: ${dash.portfolio?.netExposure}`);
  console.log(`  winRate: ${dash.portfolio?.winRate}`);
  console.log(`  sharpeRatio: ${dash.portfolio?.sharpeRatio}`);
  console.log(`  maxDrawdown: ${dash.portfolio?.maxDrawdown}`);
  console.log(`  systemLeverage: ${dash.portfolio?.systemLeverage}`);
  console.log(`  activePositions: ${dash.activePositions?.length}`);

  // 4. Logout
  const logoutRes = await fetch(`${BASE}/api/auth/logout`, { method: 'POST', headers: { Cookie: cookie } });
  console.log(`\nPOST /api/auth/logout: ${logoutRes.status}`);

  // Verify logged out — /me should fail
  const meAfterLogout = await fetch(`${BASE}/api/auth/me`, { headers: { Cookie: cookie } });
  console.log(`GET /api/auth/me (after logout): ${meAfterLogout.status}`);

  // 5. CLEANUP: remove the verify user via raw PG
  console.log('\n=== CLEANUP VERIFY USER ===');
  if (userId) {
    require('dotenv').config();
    const { Pool } = require('pg');
    const pool = new Pool({ connectionString: process.env.DIRECT_URL, ssl: { rejectUnauthorized: false } });
    const client = await pool.connect();
    try {
      for (const table of ['Notification','UserSettings','Watchlist','Position','Order','Trade','ExecutionLog','PortfolioMetrics','Portfolio','PasswordResetToken']) {
        await client.query(`DELETE FROM "${table}" WHERE "userId" = $1`, [userId]);
      }
      await client.query(`DELETE FROM "User" WHERE id = $1`, [userId]);
      console.log(`Deleted verify user: ${testEmail}`);
    } finally {
      client.release();
      await pool.end();
    }
  }

  console.log('\n=== VERIFICATION COMPLETE ===');
}

run().catch(console.error);
