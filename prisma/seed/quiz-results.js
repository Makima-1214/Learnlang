async function seedQuizResults(prisma, users, quiz1, quiz2) {
  console.log("\n🏆 Seeding quiz results...");

  const quizResultSeeds = [
    {
      id: `quizresult-${users[0].id}-${quiz1.id}-1`,
      quizId: quiz1.id,
      userId: users[0].id,
      score: 10,
      totalQuestions: 10,
      answers: JSON.stringify({ attempt: 1, source: "seed" }),
      completedAt: new Date("2026-01-01T08:00:00.000Z"),
    },
    {
      id: `quizresult-${users[0].id}-${quiz1.id}-2`,
      quizId: quiz1.id,
      userId: users[0].id,
      score: 10,
      totalQuestions: 10,
      answers: JSON.stringify({ attempt: 2, source: "seed" }),
      completedAt: new Date("2026-01-02T08:00:00.000Z"),
    },
    {
      id: `quizresult-${users[0].id}-${quiz2.id}-3`,
      quizId: quiz2.id,
      userId: users[0].id,
      score: 10,
      totalQuestions: 10,
      answers: JSON.stringify({ attempt: 3, source: "seed" }),
      completedAt: new Date("2026-01-03T08:00:00.000Z"),
    },
    {
      id: `quizresult-${users[0].id}-${quiz2.id}-4`,
      quizId: quiz2.id,
      userId: users[0].id,
      score: 10,
      totalQuestions: 10,
      answers: JSON.stringify({ attempt: 4, source: "seed" }),
      completedAt: new Date("2026-01-04T08:00:00.000Z"),
    },
    {
      id: `quizresult-${users[0].id}-${quiz1.id}-5`,
      quizId: quiz1.id,
      userId: users[0].id,
      score: 10,
      totalQuestions: 10,
      answers: JSON.stringify({ attempt: 5, source: "seed" }),
      completedAt: new Date("2026-01-05T08:00:00.000Z"),
    },
    {
      id: `quizresult-${users[1].id}-${quiz1.id}-1`,
      quizId: quiz1.id,
      userId: users[1].id,
      score: 8,
      totalQuestions: 10,
      answers: JSON.stringify({ attempt: 1, source: "seed" }),
      completedAt: new Date("2026-01-02T09:00:00.000Z"),
    },
    {
      id: `quizresult-${users[2].id}-${quiz2.id}-1`,
      quizId: quiz2.id,
      userId: users[2].id,
      score: 7,
      totalQuestions: 10,
      answers: JSON.stringify({ attempt: 1, source: "seed" }),
      completedAt: new Date("2026-01-02T10:00:00.000Z"),
    },
    {
      id: `quizresult-${users[3].id}-${quiz1.id}-1`,
      quizId: quiz1.id,
      userId: users[3].id,
      score: 9,
      totalQuestions: 10,
      answers: JSON.stringify({ attempt: 1, source: "seed" }),
      completedAt: new Date("2026-01-03T10:00:00.000Z"),
    },
    {
      id: `quizresult-${users[4].id}-${quiz2.id}-1`,
      quizId: quiz2.id,
      userId: users[4].id,
      score: 6,
      totalQuestions: 10,
      answers: JSON.stringify({ attempt: 1, source: "seed" }),
      completedAt: new Date("2026-01-04T10:00:00.000Z"),
    },
  ];

  for (const result of quizResultSeeds) {
    await prisma.quizResult.upsert({
      where: { id: result.id },
      update: {},
      create: result,
    });
  }

  console.log(`✅ ${quizResultSeeds.length} quiz results created`);
  return quizResultSeeds.length;
}

module.exports = { seedQuizResults };
