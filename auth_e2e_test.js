require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DIRECT_URL,
  ssl: { rejectUnauthorized: false }
});

const http = require('http');




const BASE_URL = 'http://localhost:3000/api/auth';
const TEST_EMAIL = 'auth_e2e_test_user@example.com';
const TEST_PASSWORD = 'SecurePassword123!';

async function makeRequest(path, method = 'GET', body = null, cookie = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const options = {
      method,
      headers: {},
    };
    if (body) {
      options.headers['Content-Type'] = 'application/json';
    }
    if (cookie) {
      options.headers['Cookie'] = cookie;
    }

    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try { if (data) json = JSON.parse(data); } catch (e) {}
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json || data
        });
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function extractCookie(res) {
  const setCookie = res.headers['set-cookie'];
  if (!setCookie) return null;
  return setCookie[0].split(';')[0];
}

async function runTests() {
  console.log("=== STARTING AUTH E2E TESTS ===\n");
  let cookie = null;
  let testUserId = null;

  try {
    // Cleanup if previous run failed
    await pool.query(`DELETE FROM "User" WHERE email = $1`, [TEST_EMAIL]);

    console.log("TEST 1: GET /api/auth/me without session");
    let res = await makeRequest('/me');
    if (res.status === 401) console.log("✅ PASS\n");
    else throw new Error(`Expected 401, got ${res.status}`);

    console.log("TEST 2: Create temporary test account (SIGNUP)");
    res = await makeRequest('/signup', 'POST', { email: TEST_EMAIL, password: TEST_PASSWORD });
    if (res.status === 200 && res.data.success) {
      console.log("✅ PASS");
      cookie = extractCookie(res);
      testUserId = res.data.user.id;
    } else throw new Error(`Expected 200, got ${res.status} - ${JSON.stringify(res.data)}`);

    console.log("\nTEST 3: Verify database User exists");
    const userRes = await pool.query(`SELECT * FROM "User" WHERE email = $1`, [TEST_EMAIL]); const user = userRes.rows[0];
    if (user && user.email === TEST_EMAIL) console.log("✅ PASS\n");
    else throw new Error("User not found in DB");

    console.log("TEST 4: Verify required Portfolio exists");
    const portRes = await pool.query(`SELECT * FROM "Portfolio" WHERE "userId" = $1`, [user.id]); const portfolio = portRes.rows[0];
    if (portfolio) console.log("✅ PASS\n");
    else throw new Error("Portfolio not found for user");

    console.log("TEST 5: GET /api/auth/me with authenticated session");
    res = await makeRequest('/me', 'GET', null, cookie);
    if (res.status === 200 && res.data.user.email === TEST_EMAIL) console.log("✅ PASS\n");
    else throw new Error(`Expected 200, got ${res.status}`);

    console.log("TEST 6: Login with correct credentials");
    res = await makeRequest('/login', 'POST', { email: TEST_EMAIL, password: TEST_PASSWORD });
    if (res.status === 200) {
      console.log("✅ PASS\n");
      cookie = extractCookie(res);
    } else throw new Error(`Expected 200, got ${res.status}`);

    console.log("TEST 7: Login with incorrect password");
    res = await makeRequest('/login', 'POST', { email: TEST_EMAIL, password: 'WrongPassword123' });
    if (res.status === 401) console.log("✅ PASS\n");
    else throw new Error(`Expected 401, got ${res.status}`);

    console.log("TEST 8: Duplicate signup");
    res = await makeRequest('/signup', 'POST', { email: TEST_EMAIL, password: TEST_PASSWORD });
    if (res.status >= 400 && res.status < 500) console.log(`✅ PASS (${res.status})\n`);
    else throw new Error(`Expected 4xx, got ${res.status}`);

    console.log("TEST 9: Logout");
    res = await makeRequest('/logout', 'POST', null, cookie);
    if (res.status === 200) console.log("✅ PASS\n");
    else throw new Error(`Expected 200, got ${res.status}`);

    console.log("TEST 10: GET /api/auth/me after logout");
    const loggedOutCookie = extractCookie(res); 
    // Usually the server sends a set-cookie with Max-Age=0 or something empty. 
    // The client would just not send the cookie. 
    res = await makeRequest('/me', 'GET', null, loggedOutCookie);
    if (res.status === 401) console.log("✅ PASS\n");
    else throw new Error(`Expected 401, got ${res.status}`);

    console.log("TEST 11: Call protected API after logout");
    res = await makeRequest('/me', 'GET', null, loggedOutCookie); // same route for testing auth protection
    if (res.status === 401) console.log("✅ PASS\n");
    else throw new Error(`Expected 401, got ${res.status}`);

    console.log("TEST 12: Login again");
    res = await makeRequest('/login', 'POST', { email: TEST_EMAIL, password: TEST_PASSWORD });
    if (res.status === 200) {
      console.log("✅ PASS\n");
      cookie = extractCookie(res);
    } else throw new Error(`Expected 200, got ${res.status}`);

    console.log("TEST 13: GET /api/auth/me again");
    res = await makeRequest('/me', 'GET', null, cookie);
    if (res.status === 200 && res.data.user.email === TEST_EMAIL) console.log("✅ PASS\n");
    else throw new Error(`Expected 200, got ${res.status}`);

    console.log("TEST 14: Clean up ONLY the temporary test account and its related records");
    await pool.query(`DELETE FROM "Portfolio" WHERE "userId" = $1`, [user.id]);
    await pool.query(`DELETE FROM "User" WHERE email = $1`, [TEST_EMAIL]);
    console.log("✅ PASS (Database cleaned)\n");

    console.log("=== ALL TESTS PASSED ===");
  } catch (error) {
    console.error("❌ FAILED:");
    console.error(error);
  } finally {
    await pool.end();
  }
}

runTests();
