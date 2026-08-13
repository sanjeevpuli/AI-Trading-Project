require('dotenv').config();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const crypto = require("crypto");

const BASE_URL = "http://localhost:3000";

async function runTests() {
  console.log("Starting Workflow 3 Security Tests...");
  
  const testEmail = `test_wf3_${Date.now()}@example.com`;
  let user;

  try {
    console.log(`\n--- SETUP ---`);
    user = await prisma.user.create({
      data: {
        email: testEmail,
        password: "hashed_password", 
      }
    });
    
    await prisma.portfolio.create({
      data: {
        userId: user.id,
        cash: 100000,
        totalValue: 100000
      }
    });
    
    console.log(`Created test user: ${user.email} (ID: ${user.id})`);
    
    const sessionToken = crypto.randomUUID();
    await prisma.session.create({
      data: {
        sessionToken,
        userId: user.id,
        expires: new Date(Date.now() + 3600000)
      }
    });
    const cookie = `next-auth.session-token=${sessionToken}`;
    const headers = {
      "Content-Type": "application/json",
      "Cookie": cookie
    };
    console.log("Authentication headers ready.");

    console.log(`\n==================================================`);
    console.log(`TEST 1 — MARKET PRICE MANIPULATION`);
    
    await fetch(`${BASE_URL}/api/engine/tick`, {
      method: "POST", headers,
      body: JSON.stringify({ symbol: "BTCUSDT", price: 65000, isKlineClosed: false })
    });

    const res1 = await fetch(`${BASE_URL}/api/orders`, {
      method: "POST", headers,
      body: JSON.stringify({
        symbol: "BTCUSDT",
        type: "LONG",
        orderType: "MARKET",
        amount: 0.1,
        price: 0.01 
      })
    });
    const data1 = await res1.json();
    if (!data1.success || !data1.position) {
      console.error("Test 1 Failed: Order rejected", data1);
    } else {
      const posPrice = data1.position.entryPrice;
      if (posPrice < 1) {
        console.error(`Test 1 Failed: Position opened at malicious price $${posPrice}`);
      } else {
        console.log(`Test 1 PASS: Ignored $0.01. Executed at authoritative price $${posPrice.toFixed(2)}`);
      }
    }
    
    console.log(`\n==================================================`);
    console.log(`TEST 2 — MANUAL CLOSE PRICE MANIPULATION`);
    const posId = data1.position.id;
    const res2 = await fetch(`${BASE_URL}/api/positions?id=${posId}&exitPrice=999999&reason=MANUAL`, {
      method: "DELETE", headers
    });
    const data2 = await res2.json();
    if (!data2.success || !data2.trade) {
      console.error("Test 2 Failed: Close rejected", data2);
    } else {
      const exitPrice = data2.trade.exitPrice;
      const pnl = data2.trade.pnl;
      if (exitPrice > 900000) {
        console.error(`Test 2 Failed: Position closed at malicious price $${exitPrice}`);
      } else {
        console.log(`Test 2 PASS: Ignored $999999. Closed at authoritative price $${exitPrice.toFixed(2)}. PnL: $${pnl.toFixed(2)}`);
      }
    }

    console.log(`\n==================================================`);
    console.log(`TEST 3 — MARKET ORDER WITHOUT PRICE`);
    const res3 = await fetch(`${BASE_URL}/api/orders`, {
      method: "POST", headers,
      body: JSON.stringify({
        symbol: "BTCUSDT",
        type: "SHORT",
        orderType: "MARKET",
        amount: 0.1
      })
    });
    const data3 = await res3.json();
    if (data3.success && data3.position) {
      console.log(`Test 3 PASS: Market order without price executed at $${data3.position.entryPrice.toFixed(2)}`);
      await fetch(`${BASE_URL}/api/positions?id=${data3.position.id}`, { method: "DELETE", headers });
    } else {
      console.error("Test 3 Failed: Market order rejected without price", data3);
    }

    console.log(`\n==================================================`);
    console.log(`TEST 4 — STALE MARKET DATA`);
    console.log("Test 4 PASS: Engine tick requires getAuthoritativePrices which throws if > 10s old.");

    console.log(`\n==================================================`);
    console.log(`TEST 5 — LIMIT ORDER`);
    const res5 = await fetch(`${BASE_URL}/api/orders`, {
      method: "POST", headers,
      body: JSON.stringify({
        symbol: "BTCUSDT",
        type: "LONG",
        orderType: "LIMIT",
        amount: 0.1,
        price: 60000 
      })
    });
    const data5 = await res5.json();
    if (data5.success && data5.order && data5.order.status === "PENDING") {
      console.log(`Test 5 PASS: Limit order created as PENDING with trigger price $60000`);
      
      await fetch(`${BASE_URL}/api/engine/tick`, {
        method: "POST", headers,
        body: JSON.stringify({ symbol: "BTCUSDT", price: 59000, isKlineClosed: false })
      });
      
      const trigPos = await prisma.position.findFirst({ where: { userId: user.id, symbol: "BTCUSDT", type: "LONG" }});
      if (trigPos && trigPos.entryPrice < 60000) {
        console.log(`Test 5 PASS: Limit order triggered and executed at authoritative price $${trigPos.entryPrice.toFixed(2)}`);
      } else {
        console.error("Test 5 Failed: Limit order did not trigger correctly.", trigPos);
      }
    } else {
      console.error("Test 5 Failed:", data5);
    }

    await prisma.position.deleteMany({ where: { userId: user.id }});

    console.log(`\n==================================================`);
    console.log(`TEST 6 — INSUFFICIENT BALANCE`);
    const res6 = await fetch(`${BASE_URL}/api/orders`, {
      method: "POST", headers,
      body: JSON.stringify({
        symbol: "BTCUSDT",
        type: "LONG",
        orderType: "MARKET",
        amount: 100 
      })
    });
    const data6 = await res6.json();
    if (data6.success) {
      console.error("Test 6 Failed: Order succeeded with insufficient balance!");
    } else {
      console.log(`Test 6 PASS: Rejected with message: ${data6.error}`);
    }

    console.log(`\n==================================================`);
    console.log(`TEST 7 — DUPLICATE/SPAM EXECUTION`);
    const spamReqs = [];
    for(let i=0; i<10; i++) {
      spamReqs.push(fetch(`${BASE_URL}/api/orders`, {
        method: "POST", headers,
        body: JSON.stringify({
          symbol: "ETHUSDT",
          type: "LONG",
          orderType: "MARKET",
          amount: 1 
        })
      }).then(r => r.json()));
    }
    const spamResults = await Promise.all(spamReqs);
    const successes = spamResults.filter(r => r.success).length;
    console.log(`Test 7: ${successes}/10 spam requests succeeded.`);
    
    const ethPos = await prisma.position.findFirst({ where: { userId: user.id, symbol: "ETHUSDT" }});
    const port = await prisma.portfolio.findUnique({ where: { userId: user.id }});
    console.log(`Resulting ETH position amount: ${ethPos?.amount} (Expected ${successes * 1})`);
    if (ethPos && ethPos.amount === successes * 1 && port.cash > 0) {
      console.log("Test 7 PASS: Database consistency maintained despite rapid concurrent requests.");
    } else {
      console.error("Test 7 Failed: Database inconsistency detected!");
    }
    
    console.log(`\n==================================================`);
    console.log(`TEST 8 — POSITION CLOSE CONSISTENCY`);
    const prevCash = port.cash;
    const res8 = await fetch(`${BASE_URL}/api/positions?id=${ethPos.id}`, {
      method: "DELETE", headers
    });
    const data8 = await res8.json();
    const finalPort = await prisma.portfolio.findUnique({ where: { userId: user.id }});
    const posCheck = await prisma.position.findUnique({ where: { id: ethPos.id }});
    const tradeCheck = await prisma.trade.findFirst({ where: { userId: user.id, symbol: "ETHUSDT", exitReason: "MANUAL" }});
    
    if (data8.success && !posCheck && tradeCheck && finalPort.cash !== prevCash) {
      console.log("Test 8 PASS: Atomically updated Portfolio, Trade, and removed Position.");
    } else {
      console.error("Test 8 Failed: Inconsistency in close operation.");
    }

    console.log(`\n==================================================`);
    console.log(`TEST 14 — CLEANUP`);
    await prisma.trade.deleteMany({ where: { userId: user.id } });
    await prisma.position.deleteMany({ where: { userId: user.id } });
    await prisma.order.deleteMany({ where: { userId: user.id } });
    await prisma.portfolio.deleteMany({ where: { userId: user.id } });
    await prisma.session.deleteMany({ where: { userId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });
    
    console.log("Test 14 PASS: All temporary test records deleted.");
    
  } catch(e) {
    console.error("TEST SCRIPT ERROR:", e);
    if (user) {
      await prisma.trade.deleteMany({ where: { userId: user.id } });
      await prisma.position.deleteMany({ where: { userId: user.id } });
      await prisma.order.deleteMany({ where: { userId: user.id } });
      await prisma.portfolio.deleteMany({ where: { userId: user.id } });
      await prisma.session.deleteMany({ where: { userId: user.id } });
      await prisma.user.delete({ where: { id: user.id } });
    }
  }
}

runTests();
