// cleanup_test_data.js — Uses raw pg driver to clean test@example.com data
require('dotenv').config();
const { Pool } = require('pg');

async function cleanup() {
  const pool = new Pool({
    connectionString: process.env.DIRECT_URL,
    ssl: { rejectUnauthorized: false }
  });

  const client = await pool.connect();
  try {
    // 1. Find the test user
    const userResult = await client.query(
      `SELECT id, email FROM "User" WHERE email = $1`, ['test@example.com']
    );

    if (userResult.rows.length === 0) {
      console.log('No test user (test@example.com) found. Nothing to clean up.');
      return;
    }

    const userId = userResult.rows[0].id;
    console.log(`Found test user: ${userResult.rows[0].email} (ID: ${userId})`);

    // 2. Identify all test data (only tables with userId column)
    const positions = await client.query(`SELECT id, symbol, type, amount, "entryPrice" FROM "Position" WHERE "userId" = $1`, [userId]);
    const orders = await client.query(`SELECT id, symbol, type, status FROM "Order" WHERE "userId" = $1`, [userId]);
    const trades = await client.query(`SELECT id, symbol, type, pnl FROM "Trade" WHERE "userId" = $1`, [userId]);
    const portfolio = await client.query(`SELECT id, cash, "totalValue" FROM "Portfolio" WHERE "userId" = $1`, [userId]);
    const execLogs = await client.query(`SELECT count(*) as cnt FROM "ExecutionLog" WHERE "userId" = $1`, [userId]);
    const metrics = await client.query(`SELECT count(*) as cnt FROM "PortfolioMetrics" WHERE "userId" = $1`, [userId]);

    console.log('\n--- TEST DATA IDENTIFIED ---');
    console.log(`Positions: ${positions.rows.length}`);
    positions.rows.forEach(p => console.log(`  - ${p.id}: ${p.symbol} ${p.type} ${p.amount}@${p.entryPrice}`));
    console.log(`Orders: ${orders.rows.length}`);
    orders.rows.forEach(o => console.log(`  - ${o.id}: ${o.symbol} ${o.type} ${o.status}`));
    console.log(`Trades: ${trades.rows.length}`);
    trades.rows.forEach(t => console.log(`  - ${t.id}: ${t.symbol} ${t.type} PnL:${t.pnl}`));
    console.log(`Portfolio: ${portfolio.rows.length > 0 ? 'YES' : 'NO'}`);
    if (portfolio.rows.length > 0) console.log(`  Cash: ${portfolio.rows[0].cash}, Total: ${portfolio.rows[0].totalValue}`);
    // Note: AgentSignal has no userId column — it's a global table
    console.log(`Execution Logs: ${execLogs.rows[0].cnt}`);
    console.log(`Portfolio Metrics: ${metrics.rows[0].cnt}`);

    // 3. Delete test data in correct order (FK-safe)
    console.log('\n--- DELETING TEST DATA ---');

    let r;
    r = await client.query(`DELETE FROM "Notification" WHERE "userId" = $1`, [userId]);
    console.log(`Deleted ${r.rowCount} notifications`);

    r = await client.query(`DELETE FROM "UserSettings" WHERE "userId" = $1`, [userId]);
    console.log(`Deleted ${r.rowCount} user settings`);

    r = await client.query(`DELETE FROM "Watchlist" WHERE "userId" = $1`, [userId]);
    console.log(`Deleted ${r.rowCount} watchlists`);

    r = await client.query(`DELETE FROM "Position" WHERE "userId" = $1`, [userId]);
    console.log(`Deleted ${r.rowCount} positions`);

    r = await client.query(`DELETE FROM "Order" WHERE "userId" = $1`, [userId]);
    console.log(`Deleted ${r.rowCount} orders`);

    r = await client.query(`DELETE FROM "Trade" WHERE "userId" = $1`, [userId]);
    console.log(`Deleted ${r.rowCount} trades`);

    r = await client.query(`DELETE FROM "ExecutionLog" WHERE "userId" = $1`, [userId]);
    console.log(`Deleted ${r.rowCount} execution logs`);

    r = await client.query(`DELETE FROM "PortfolioMetrics" WHERE "userId" = $1`, [userId]);
    console.log(`Deleted ${r.rowCount} portfolio metrics`);

    r = await client.query(`DELETE FROM "Portfolio" WHERE "userId" = $1`, [userId]);
    console.log(`Deleted ${r.rowCount} portfolios`);

    r = await client.query(`DELETE FROM "PasswordResetToken" WHERE "userId" = $1`, [userId]);
    console.log(`Deleted ${r.rowCount} password reset tokens`);

    r = await client.query(`DELETE FROM "User" WHERE id = $1`, [userId]);
    console.log(`Deleted ${r.rowCount} user`);

    // 4. Post-cleanup verification
    console.log('\n--- POST-CLEANUP VERIFICATION ---');
    const remainingUsers = await client.query(`SELECT id, email FROM "User"`);
    console.log(`Remaining users: ${remainingUsers.rows.length}`);
    remainingUsers.rows.forEach(u => console.log(`  - ${u.email} (${u.id})`));

    const rp = await client.query(`SELECT count(*) as cnt FROM "Position"`);
    const ro = await client.query(`SELECT count(*) as cnt FROM "Order"`);
    const rt = await client.query(`SELECT count(*) as cnt FROM "Trade"`);
    const rpf = await client.query(`SELECT count(*) as cnt FROM "Portfolio"`);
    console.log(`Remaining positions: ${rp.rows[0].cnt}`);
    console.log(`Remaining orders: ${ro.rows[0].cnt}`);
    console.log(`Remaining trades: ${rt.rows[0].cnt}`);
    console.log(`Remaining portfolios: ${rpf.rows[0].cnt}`);

    console.log('\nTest data cleanup complete. No real user data was touched.');

  } catch (error) {
    console.error('Cleanup error:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

cleanup();
