const http = require('http');

const API_URL = 'http://localhost:3000/api';
let sessionCookie = '';
let userId = '';

async function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: `/api${path}`,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    if (sessionCookie) {
      options.headers['Cookie'] = sessionCookie;
    }

    const req = http.request(options, (res) => {
      if (res.headers['set-cookie']) {
        sessionCookie = res.headers['set-cookie'][0].split(';')[0];
      }

      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          if (data) {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } else {
            resolve({ status: res.statusCode, data: null });
          }
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTest() {
  console.log("Starting Workflow 2 Validation...");
  const timestamp = Date.now();
  const testEmail = `test_wf2_${timestamp}@example.com`;
  const testPassword = 'Password123!';

  try {
    // 1. Signup & Login
    console.log(`Creating test user: ${testEmail}`);
    await request('POST', '/auth/signup', { email: testEmail, password: testPassword });
    const loginRes = await request('POST', '/auth/login', { email: testEmail, password: testPassword });
    if (loginRes.status !== 200) throw new Error("Login failed");
    
    // 2. Fetch Initial Dashboard
    const initialDash = await request('GET', '/dashboard');
    console.log("Initial Dashboard Balance:", initialDash.data.portfolio.balance);
    
    // 3. Open a Long Position
    console.log("Placing Market BUY Order for 1 BTC at $60000...");
    const orderRes = await request('POST', '/orders', {
      symbol: 'BTCUSDT',
      type: 'LONG',
      orderType: 'MARKET',
      amount: 1.0,
      price: 60000
    });
    console.log("Order Response:", orderRes.data);

    // 4. Send Price Tick to backend engine (Simulate price drop)
    console.log("Simulating price tick to $55000...");
    const tickRes = await request('POST', '/engine/tick', {
      symbol: 'BTCUSDT',
      price: 55000,
      isKlineClosed: false
    });
    console.log("Tick Response:", tickRes.data);

    // 5. Verify Dashboard reflects authoritative MTM PnL
    const newDash = await request('GET', '/dashboard');
    const pos = newDash.data.activePositions.find(p => p.symbol === 'BTCUSDT');
    console.log("Updated Position Data:", pos);
    console.log("Updated Portfolio Unrealized PnL:", newDash.data.portfolio.unrealizedPnL);
    
    if (pos.pnl !== -5000) {
      throw new Error(`Expected PnL -5000, got ${pos.pnl}`);
    }
    console.log("✅ Server-side MTM PnL is correct!");

    // 6. Send Price Tick to trigger limit/liquidation (Optional)
    console.log("Simulating price tick to $70000 (Take Profit)...");
    const tickRes2 = await request('POST', '/engine/tick', {
      symbol: 'BTCUSDT',
      price: 70000,
      isKlineClosed: false
    });
    
    const finalDash = await request('GET', '/dashboard');
    const posFinal = finalDash.data.activePositions.find(p => p.symbol === 'BTCUSDT');
    console.log("Final Position Data (After 70k):", posFinal);
    console.log("Final Portfolio Realized PnL:", finalDash.data.portfolio.realizedPnL);

    // Cleanup: In a real environment, we'd delete the user here. For now we will rely on cleanup_test_data.js
    console.log("✅ Workflow 2 Test Complete");
  } catch (err) {
    console.error("Test failed:", err);
  }
}

runTest();
