const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.dir(await prisma.sessionQuestion.findFirst({
    where: { questionType: 'vocabulary' }
  }), { depth: null });
}

main().catch(console.error).finally(() => prisma.$disconnect());
