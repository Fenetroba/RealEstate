const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany();
  console.log("Users:", users.map(u => ({ id: u.id, email: u.email, wallet: u.walletAddress })));

  const requests = await prisma.request.findMany();
  console.log("Requests count:", requests.length);
  if (requests.length > 0) {
    console.log("Samples:", requests.map(r => ({ id: r.id, submittedBy: r.submittedBy })));
  }
}

check().then(() => prisma.$disconnect());
