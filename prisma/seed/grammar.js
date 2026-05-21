import GrammarData from "./grammars.js";
async function seedGrammar(prisma) {

  let count = 0;
  for (const item of GrammarData) {
    const exists = await prisma.grammarQuestion.findFirst({
      where: { level: item.level, sentence: item.sentence },
    });
    if (!exists) {
      await prisma.grammarQuestion.create({ data: item });
      count++;
    }
  }

  console.log(`✅ ${count} grammar questions seeded`);
  return count;
}

module.exports = { seedGrammar };
