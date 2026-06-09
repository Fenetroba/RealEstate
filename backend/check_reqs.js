const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function check() {
  const reqs = await prisma.request.findMany({
    select: { id: true, status: true, property: { select: { status: true } } }
  });
  console.log(reqs);
}

check().then(() => prisma.$disconnect());
