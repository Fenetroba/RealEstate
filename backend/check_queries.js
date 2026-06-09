const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function check() {
  // simulate listDbRequests with req.query.status = 'PENDING'
  const status = 'PENDING';
  const type = undefined;
  const where = {};
  if (status) where.status = status;
  if (type) where.type = type;
  
  const requests = await prisma.request.findMany({
      where,
      include: { property: { select: { id: true, status: true, tokenId: true } } }
  });
  console.log(requests);
}

check().then(() => prisma.$disconnect());
