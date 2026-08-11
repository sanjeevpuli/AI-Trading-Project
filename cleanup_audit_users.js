// cleanup_audit_users.js — Remove leftover audit/debug users from previous sessions
require('dotenv').config();
const { Pool } = require('pg');

const AUDIT_EMAILS = [
  'audit_test_1786118684519@example.com',
  'audit_final_1786118807533@example.com',
  'signup_debug_1786118946491@example.com',
  'audit_final_victory_1786119358418@example.com',
];

async function cleanup() {
  const pool = new Pool({
    connectionString: process.env.DIRECT_URL,
    ssl: { rejectUnauthorized: false }
  });
  const client = await pool.connect();
  try {
    for (const email of AUDIT_EMAILS) {
      const user = await client.query(`SELECT id FROM "User" WHERE email = $1`, [email]);
      if (user.rows.length === 0) { console.log(`${email}: not found, skipping`); continue; }
      const uid = user.rows[0].id;
      // Delete all FK children
      for (const table of ['Notification','UserSettings','Watchlist','Position','Order','Trade','ExecutionLog','PortfolioMetrics','Portfolio','PasswordResetToken']) {
        await client.query(`DELETE FROM "${table}" WHERE "userId" = $1`, [uid]);
      }
      await client.query(`DELETE FROM "User" WHERE id = $1`, [uid]);
      console.log(`Deleted audit user: ${email}`);
    }
    
    // Final state
    const users = await client.query(`SELECT id, email FROM "User"`);
    console.log(`\nRemaining users: ${users.rows.length}`);
    users.rows.forEach(u => console.log(`  - ${u.email} (${u.id})`));
    
    const rp = await client.query(`SELECT count(*) as cnt FROM "Position"`);
    const ro = await client.query(`SELECT count(*) as cnt FROM "Order"`);
    const rt = await client.query(`SELECT count(*) as cnt FROM "Trade"`);
    const rpf = await client.query(`SELECT count(*) as cnt FROM "Portfolio"`);
    console.log(`Positions: ${rp.rows[0].cnt}, Orders: ${ro.rows[0].cnt}, Trades: ${rt.rows[0].cnt}, Portfolios: ${rpf.rows[0].cnt}`);
  } finally {
    client.release();
    await pool.end();
  }
}
cleanup();
