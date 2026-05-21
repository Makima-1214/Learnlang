async function seedListening(prisma) {
  const listeningSeeds = [
    {
      level: "A1",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      sentence: "The cat is on the table.",
      clozeText: "The cat is on the ____.",
      options: { A: "chair", B: "table", C: "floor", D: "bed" },
      answer: "B",
    },
    {
      level: "A1",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      sentence: "I drink water every day.",
      clozeText: "I drink ____ every day.",
      options: { A: "tea", B: "milk", C: "water", D: "coffee" },
      answer: "C",
    },
    {
      level: "A1",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
      sentence: "She has two brothers.",
      clozeText: "She has two ____.",
      options: { A: "brothers", B: "sisters", C: "cousins", D: "aunts" },
      answer: "A",
    },
    {
      level: "A1",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
      sentence: "We eat rice for lunch.",
      clozeText: "We eat ____ for lunch.",
      options: { A: "bread", B: "rice", C: "soup", D: "eggs" },
      answer: "B",
    },
    {
      level: "A1",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
      sentence: "He goes to school by bus.",
      clozeText: "He goes to school by ____.",
      options: { A: "car", B: "bike", C: "bus", D: "train" },
      answer: "C",
    },
  ];

  let count = 0;
  for (const item of listeningSeeds) {
    const exists = await prisma.listeningQuestion.findFirst({
      where: { level: item.level, sentence: item.sentence },
    });
    if (!exists) {
      await prisma.listeningQuestion.create({ data: item });
      count++;
    }
  }

  console.log(`✅ ${count} listening questions seeded`);
  return count;
}

module.exports = { seedListening };
