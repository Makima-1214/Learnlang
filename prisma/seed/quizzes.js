async function seedQuizzes(prisma, admin) {
  console.log("\n📝 Seeding quizzes...");

  const quiz1 = await prisma.quiz.create({
    data: {
      title: "Quiz Vocabulary Dasar",
      description:
        "Uji kemampuan vocabulary dasar bahasa Inggris Anda dengan 10 pertanyaan pilihan ganda.",
      published: true,
      createdById: admin.id,
      questions: {
        create: [
          {
            question: "apple",
            order: 1,
            options: {
              create: [
                { option: "apel", isCorrect: true, order: 1 },
                { option: "anggur", isCorrect: false, order: 2 },
                { option: "jeruk", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "book",
            order: 2,
            options: {
              create: [
                { option: "buku", isCorrect: true, order: 1 },
                { option: "pensil", isCorrect: false, order: 2 },
                { option: "tas", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "cat",
            order: 3,
            options: {
              create: [
                { option: "kucing", isCorrect: true, order: 1 },
                { option: "anjing", isCorrect: false, order: 2 },
                { option: "burung", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "water",
            order: 4,
            options: {
              create: [
                { option: "air", isCorrect: true, order: 1 },
                { option: "api", isCorrect: false, order: 2 },
                { option: "udara", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "house",
            order: 5,
            options: {
              create: [
                { option: "rumah", isCorrect: true, order: 1 },
                { option: "kantor", isCorrect: false, order: 2 },
                { option: "sekolah", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "car",
            order: 6,
            options: {
              create: [
                { option: "mobil", isCorrect: true, order: 1 },
                { option: "motor", isCorrect: false, order: 2 },
                { option: "sepeda", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "table",
            order: 7,
            options: {
              create: [
                { option: "meja", isCorrect: true, order: 1 },
                { option: "kursi", isCorrect: false, order: 2 },
                { option: "lemari", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "tree",
            order: 8,
            options: {
              create: [
                { option: "pohon", isCorrect: true, order: 1 },
                { option: "bunga", isCorrect: false, order: 2 },
                { option: "rumput", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "sun",
            order: 9,
            options: {
              create: [
                { option: "matahari", isCorrect: true, order: 1 },
                { option: "bulan", isCorrect: false, order: 2 },
                { option: "bintang", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "computer",
            order: 10,
            options: {
              create: [
                { option: "komputer", isCorrect: true, order: 1 },
                { option: "televisi", isCorrect: false, order: 2 },
                { option: "radio", isCorrect: false, order: 3 },
              ],
            },
          },
        ],
      },
    },
  });
  console.log(`✅ Quiz created: ${quiz1.title}`);

  const quiz2 = await prisma.quiz.create({
    data: {
      title: "Quiz Kata Kerja",
      description:
        "Latihan menerjemahkan kata kerja bahasa Inggris ke Indonesia.",
      published: true,
      createdById: admin.id,
      questions: {
        create: [
          {
            question: "run",
            order: 1,
            options: {
              create: [
                { option: "lari", isCorrect: true, order: 1 },
                { option: "jalan", isCorrect: false, order: 2 },
              ],
            },
          },
          {
            question: "eat",
            order: 2,
            options: {
              create: [
                { option: "makan", isCorrect: true, order: 1 },
                { option: "minum", isCorrect: false, order: 2 },
              ],
            },
          },
          {
            question: "sleep",
            order: 3,
            options: {
              create: [
                { option: "tidur", isCorrect: true, order: 1 },
                { option: "bangun", isCorrect: false, order: 2 },
              ],
            },
          },
          {
            question: "write",
            order: 4,
            options: {
              create: [
                { option: "menulis", isCorrect: true, order: 1 },
                { option: "membaca", isCorrect: false, order: 2 },
              ],
            },
          },
          {
            question: "jump",
            order: 5,
            options: {
              create: [
                { option: "melompat", isCorrect: true, order: 1 },
                { option: "merangkak", isCorrect: false, order: 2 },
              ],
            },
          },
          {
            question: "swim",
            order: 6,
            options: {
              create: [
                { option: "berenang", isCorrect: true, order: 1 },
                { option: "menyelam", isCorrect: false, order: 2 },
              ],
            },
          },
          {
            question: "fly",
            order: 7,
            options: {
              create: [
                { option: "terbang", isCorrect: true, order: 1 },
                { option: "jatuh", isCorrect: false, order: 2 },
              ],
            },
          },
          {
            question: "talk",
            order: 8,
            options: {
              create: [
                { option: "berbicara", isCorrect: true, order: 1 },
                { option: "mendengar", isCorrect: false, order: 2 },
              ],
            },
          },
          {
            question: "dance",
            order: 9,
            options: {
              create: [
                { option: "menari", isCorrect: true, order: 1 },
                { option: "bernyanyi", isCorrect: false, order: 2 },
              ],
            },
          },
          {
            question: "study",
            order: 10,
            options: {
              create: [
                { option: "belajar", isCorrect: true, order: 1 },
                { option: "bermain", isCorrect: false, order: 2 },
              ],
            },
          },
        ],
      },
    },
  });
  console.log(`✅ Quiz created: ${quiz2.title}`);

  return { quiz1, quiz2 };
}

module.exports = { seedQuizzes };
