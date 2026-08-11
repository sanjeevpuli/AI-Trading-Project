const http = require('http');

async function run() {
  console.log("Waiting for Next.js server to be ready...");
  await new Promise(r => setTimeout(r, 5000));

  // 1. Signup/Login
  const loginRes = await fetch("http://localhost:3000/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "test@example.com", password: "Password123!" })
  });

  let cookie = loginRes.headers.get('set-cookie');
  if (loginRes.status !== 200) {
    console.log("Login failed, trying signup...");
    const signupRes = await fetch("http://localhost:3000/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com", password: "Password123!" })
    });
    cookie = signupRes.headers.get('set-cookie');
  }

  console.log("Authentication successful, cookie acquired.");
  
  // 2. Fetch Dashboard
  console.log("\n--- FETCHING DASHBOARD ---");
  const dashboardRes = await fetch("http://localhost:3000/api/dashboard", {
    headers: { "Cookie": cookie }
  });
  const dashboard = await dashboardRes.json();
  console.log("Dashboard Portfolio:", JSON.stringify(dashboard.portfolio, null, 2));
  console.log("Dashboard Active Positions Count:", dashboard.activePositions?.length);
  
  // 3. Create a Test Order
  console.log("\n--- CREATING TEST ORDER ---");
  const orderRes = await fetch("http://localhost:3000/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Cookie": cookie },
    body: JSON.stringify({
      symbol: "BTCUSDT",
      type: "LONG",
      orderType: "MARKET",
      amount: 1.5,
      price: 65000.0,
      stopLoss: 60000.0,
      takeProfit: 70000.0
    })
  });
  const orderResult = await orderRes.json();
  console.log("Order Creation Result:", JSON.stringify(orderResult, null, 2));

  // 4. Fetch Dashboard Again to verify state change
  console.log("\n--- FETCHING DASHBOARD AFTER ORDER ---");
  const dashboardRes2 = await fetch("http://localhost:3000/api/dashboard", {
    headers: { "Cookie": cookie }
  });
  const dashboard2 = await dashboardRes2.json();
  console.log("Dashboard Portfolio:", JSON.stringify(dashboard2.portfolio, null, 2));
  console.log("Dashboard Active Positions:", JSON.stringify(dashboard2.activePositions, null, 2));
  
  // 5. Fetch Trades (used by Flutter)
  console.log("\n--- FETCHING TRADES (FLUTTER) ---");
  const tradesRes = await fetch("http://localhost:3000/api/trades", {
    headers: { "Cookie": cookie }
  });
  const trades = await tradesRes.json();
  console.log("Execution History Count:", trades.executionHistory?.length);
  if (trades.executionHistory?.length > 0) {
    console.log("Latest Trade:", JSON.stringify(trades.executionHistory[0], null, 2));
  }

  // 6. Fetch Signals (Performance check)
  console.log("\n--- FETCHING SIGNALS ---");
  const start = Date.now();
  const signalsRes = await fetch("http://localhost:3000/api/signals", {
    headers: { "Cookie": cookie }
  });
  const end = Date.now();
  console.log(`Signals API Latency: ${end - start}ms`);
}

run().catch(console.error);
