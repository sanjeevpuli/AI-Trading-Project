const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanup() {
  const users = await prisma.user.findMany({
    where: { email: { startsWith: 'verify_wf2' } }
  });

  for (const u of users) {
    await prisma.order.deleteMany({ where: { userId: u.id } });
    await prisma.position.deleteMany({ where: { userId: u.id } });
    await prisma.trade.deleteMany({ where: { userId: u.id } });
    await prisma.portfolioMetrics.deleteMany({ where: { userId: u.id } });
    await prisma.portfolio.deleteMany({ where: { userId: u.id } });
    await prisma.watchlist.deleteMany({ where: { userId: u.id } });
    await prisma.user.delete({ where: { id: u.id } });
    console.log(`Cleaned up user ${u.email}`);
  }
}
cleanup().then(() => process.exit(0));
