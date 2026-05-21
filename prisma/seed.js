const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...\n");

  const { seedUsers } = require("./seed/users");
  const { seedHistories } = require("./seed/histories");
  const { seedBlogs } = require("./seed/blogs");
  const { seedCommentsAndReactions } = require("./seed/comments-reactions");
  const { seedQuizzes } = require("./seed/quizzes");
  const { seedRooms } = require("./seed/rooms");
  const { seedSocial } = require("./seed/social");
  const { seedQuizResults } = require("./seed/quiz-results");
  const { seedVocabularyQuestions } = require("./seed/questions");
  const { seedListening } = require("./seed/listening");
  const { seedGrammar } = require("./seed/grammar");
  const { seedAchievements } = require("./seed/achievements");

  const { admin, users } = await seedUsers(prisma);
  await seedHistories(prisma, users);
  await seedBlogs(prisma, admin);
  await seedCommentsAndReactions(prisma, users);
  const { quiz1, quiz2 } = await seedQuizzes(prisma, admin);
  await seedRooms(prisma, admin, users);
  await seedSocial(prisma, admin, users);
  await seedQuizResults(prisma, users, quiz1, quiz2);
  await seedVocabularyQuestions(prisma);
  await seedListening(prisma);
  await seedGrammar(prisma);
  await seedAchievements(prisma, admin, users);

  console.log("\n🎉 Seeding completed!\n");
  console.log("📌 Login credentials:");
  console.log("   Admin: admin@learnlang.com / admin123");
  console.log("   Users: budi@example.com / password123");
  console.log("          siti@example.com / password123");
  console.log("          andi@example.com / password123");
  console.log("          dewi@example.com / password123");
  console.log("          rizky@example.com / password123");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seeding failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
