const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.dir(await prisma.vocabularyQuestion.findFirst(), { depth: null });
}

main().catch(console.error).finally(() => prisma.$disconnect());
