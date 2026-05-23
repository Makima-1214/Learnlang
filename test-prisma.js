const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const session = await prisma.learningSession.findFirst({
    where: { method: 'vocabulary' },
    include: {
      questions: {
        orderBy: { order: "asc" },
      },
    },
  });
  
  if (!session) return console.log('No session');

  const questions = session.questions.map((sq) => ({
    sessionQuestionId: sq.id,
    questionId: sq.questionId,
    userAnswer: sq.userAnswer,
    isCorrect: sq.isCorrect,
    ...sq.snapshot,
  }));
  
  console.log(JSON.stringify(questions, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
