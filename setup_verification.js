const http = require('http');

const API_URL = 'http://localhost:3000/api';
let sessionCookie = '';

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

async function runSetup() {
  const testEmail = `verify_wf2@example.com`;
  const testPassword = 'Password123!';

  console.log("Setting up Backend State...");
  
  // 1. Signup & Login
  await request('POST', '/auth/signup', { email: testEmail, password: testPassword });
  await request('POST', '/auth/login', { email: testEmail, password: testPassword });
  
  // 2. Open a Long Position
  await request('POST', '/orders', {
    symbol: 'BTCUSDT',
    type: 'LONG',
    orderType: 'MARKET',
    amount: 1.0,
    price: 60000 // Slippage will adjust this slightly
  });

  // 3. Push a controlled tick to simulate price drop
  await request('POST', '/engine/tick', {
    symbol: 'BTCUSDT',
    price: 55000,
    isKlineClosed: false
  });

  // 4. Query Authoritative Dashboard
  const dashRes = await request('GET', '/dashboard');
  const dash = dashRes.data;
  
  const btcPos = dash.activePositions.find(p => p.symbol === 'BTCUSDT');
  
  console.log(JSON.stringify({
    balance: dash.portfolio.balance,
    totalValue: dash.portfolio.totalValue,
    unrealizedPnL: dash.portfolio.unrealizedPnL,
    realizedPnL: dash.portfolio.realizedPnL,
    activePositionsCount: dash.activePositions.length,
    positionQuantity: btcPos ? btcPos.amount : 0,
    entryPrice: btcPos ? btcPos.entryPrice : 0,
    currentPrice: btcPos ? btcPos.currentPrice : 0,
    positionPnL: btcPos ? btcPos.pnl : 0
  }, null, 2));
}

runSetup();
