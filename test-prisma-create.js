const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const q = await prisma.vocabularyQuestion.findFirst();
  console.log("Original q type:", typeof q.options, q.options);
  
  const sq = await prisma.sessionQuestion.create({
    data: {
      sessionId: 'cmpgupn4o000rw7584g62eomc', // just reuse an existing session
      questionId: q.id,
      questionType: 'vocabulary',
      snapshot: q,
      order: 99,
    },
  });
  
  console.log("Created sq snapshot options type:", typeof sq.snapshot.options, sq.snapshot.options);
  
  await prisma.sessionQuestion.delete({ where: { id: sq.id } });
}

main().catch(console.error).finally(() => prisma.$disconnect());
