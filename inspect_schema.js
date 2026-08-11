require('dotenv').config();
const { Pool } = require('pg');

async function inspect() {
  const pool = new Pool({
    connectionString: process.env.DIRECT_URL,
    ssl: { rejectUnauthorized: false }
  });
  const client = await pool.connect();
  try {
    const res = await client.query(`
      SELECT table_name, column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      ORDER BY table_name, ordinal_position
    `);
    const byTable = {};
    res.rows.forEach(r => {
      if (!byTable[r.table_name]) byTable[r.table_name] = [];
      byTable[r.table_name].push(r.column_name);
    });
    for (const [table, cols] of Object.entries(byTable)) {
      console.log(`\n${table}: ${cols.join(', ')}`);
    }
  } finally {
    client.release();
    await pool.end();
  }
}
inspect();
