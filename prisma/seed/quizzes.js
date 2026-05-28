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

  const quiz3 = await prisma.quiz.create({
    data: {
      title: "Quiz Adjektif",
      description:
        "Pelajari adjektif bahasa Inggris dan terjemahannya dalam bahasa Indonesia.",
      published: true,
      createdById: admin.id,
      questions: {
        create: [
          {
            question: "big",
            order: 1,
            options: {
              create: [
                { option: "besar", isCorrect: true, order: 1 },
                { option: "kecil", isCorrect: false, order: 2 },
                { option: "sedang", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "beautiful",
            order: 2,
            options: {
              create: [
                { option: "cantik", isCorrect: true, order: 1 },
                { option: "jelek", isCorrect: false, order: 2 },
                { option: "biasa", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "fast",
            order: 3,
            options: {
              create: [
                { option: "cepat", isCorrect: true, order: 1 },
                { option: "lambat", isCorrect: false, order: 2 },
                { option: "sedang", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "cold",
            order: 4,
            options: {
              create: [
                { option: "dingin", isCorrect: true, order: 1 },
                { option: "panas", isCorrect: false, order: 2 },
                { option: "sejuk", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "happy",
            order: 5,
            options: {
              create: [
                { option: "bahagia", isCorrect: true, order: 1 },
                { option: "sedih", isCorrect: false, order: 2 },
                { option: "marah", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "strong",
            order: 6,
            options: {
              create: [
                { option: "kuat", isCorrect: true, order: 1 },
                { option: "lemah", isCorrect: false, order: 2 },
                { option: "biasa", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "smart",
            order: 7,
            options: {
              create: [
                { option: "pintar", isCorrect: true, order: 1 },
                { option: "bodoh", isCorrect: false, order: 2 },
                { option: "malas", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "dirty",
            order: 8,
            options: {
              create: [
                { option: "kotor", isCorrect: true, order: 1 },
                { option: "bersih", isCorrect: false, order: 2 },
                { option: "rapi", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "expensive",
            order: 9,
            options: {
              create: [
                { option: "mahal", isCorrect: true, order: 1 },
                { option: "murah", isCorrect: false, order: 2 },
                { option: "normal", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "old",
            order: 10,
            options: {
              create: [
                { option: "tua", isCorrect: true, order: 1 },
                { option: "muda", isCorrect: false, order: 2 },
                { option: "baru", isCorrect: false, order: 3 },
              ],
            },
          },
        ],
      },
    },
  });
  console.log(`✅ Quiz created: ${quiz3.title}`);

  const quiz4 = await prisma.quiz.create({
    data: {
      title: "Quiz Angka & Waktu",
      description: "Terjemahkan angka dan istilah waktu dari bahasa Inggris.",
      published: true,
      createdById: admin.id,
      questions: {
        create: [
          {
            question: "one",
            order: 1,
            options: {
              create: [
                { option: "satu", isCorrect: true, order: 1 },
                { option: "dua", isCorrect: false, order: 2 },
              ],
            },
          },
          {
            question: "five",
            order: 2,
            options: {
              create: [
                { option: "lima", isCorrect: true, order: 1 },
                { option: "empat", isCorrect: false, order: 2 },
              ],
            },
          },
          {
            question: "ten",
            order: 3,
            options: {
              create: [
                { option: "sepuluh", isCorrect: true, order: 1 },
                { option: "sembilan", isCorrect: false, order: 2 },
              ],
            },
          },
          {
            question: "day",
            order: 4,
            options: {
              create: [
                { option: "hari", isCorrect: true, order: 1 },
                { option: "malam", isCorrect: false, order: 2 },
              ],
            },
          },
          {
            question: "night",
            order: 5,
            options: {
              create: [
                { option: "malam", isCorrect: true, order: 1 },
                { option: "siang", isCorrect: false, order: 2 },
              ],
            },
          },
          {
            question: "morning",
            order: 6,
            options: {
              create: [
                { option: "pagi", isCorrect: true, order: 1 },
                { option: "sore", isCorrect: false, order: 2 },
              ],
            },
          },
          {
            question: "week",
            order: 7,
            options: {
              create: [
                { option: "minggu", isCorrect: true, order: 1 },
                { option: "bulan", isCorrect: false, order: 2 },
              ],
            },
          },
          {
            question: "month",
            order: 8,
            options: {
              create: [
                { option: "bulan", isCorrect: true, order: 1 },
                { option: "tahun", isCorrect: false, order: 2 },
              ],
            },
          },
          {
            question: "year",
            order: 9,
            options: {
              create: [
                { option: "tahun", isCorrect: true, order: 1 },
                { option: "abad", isCorrect: false, order: 2 },
              ],
            },
          },
          {
            question: "hour",
            order: 10,
            options: {
              create: [
                { option: "jam", isCorrect: true, order: 1 },
                { option: "detik", isCorrect: false, order: 2 },
              ],
            },
          },
        ],
      },
    },
  });
  console.log(`✅ Quiz created: ${quiz4.title}`);

  const quiz5 = await prisma.quiz.create({
    data: {
      title: "Quiz Makanan & Minuman",
      description:
        "Pelajari nama-nama makanan dan minuman dalam bahasa Inggris.",
      published: true,
      createdById: admin.id,
      questions: {
        create: [
          {
            question: "rice",
            order: 1,
            options: {
              create: [
                { option: "nasi", isCorrect: true, order: 1 },
                { option: "roti", isCorrect: false, order: 2 },
                { option: "pasta", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "bread",
            order: 2,
            options: {
              create: [
                { option: "roti", isCorrect: true, order: 1 },
                { option: "nasi", isCorrect: false, order: 2 },
                { option: "kue", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "meat",
            order: 3,
            options: {
              create: [
                { option: "daging", isCorrect: true, order: 1 },
                { option: "ikan", isCorrect: false, order: 2 },
                { option: "ayam", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "milk",
            order: 4,
            options: {
              create: [
                { option: "susu", isCorrect: true, order: 1 },
                { option: "jus", isCorrect: false, order: 2 },
                { option: "teh", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "apple",
            order: 5,
            options: {
              create: [
                { option: "apel", isCorrect: true, order: 1 },
                { option: "jeruk", isCorrect: false, order: 2 },
                { option: "mangga", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "coffee",
            order: 6,
            options: {
              create: [
                { option: "kopi", isCorrect: true, order: 1 },
                { option: "teh", isCorrect: false, order: 2 },
                { option: "air", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "sugar",
            order: 7,
            options: {
              create: [
                { option: "gula", isCorrect: true, order: 1 },
                { option: "garam", isCorrect: false, order: 2 },
                { option: "minyak", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "salt",
            order: 8,
            options: {
              create: [
                { option: "garam", isCorrect: true, order: 1 },
                { option: "gula", isCorrect: false, order: 2 },
                { option: "merica", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "fish",
            order: 9,
            options: {
              create: [
                { option: "ikan", isCorrect: true, order: 1 },
                { option: "udang", isCorrect: false, order: 2 },
                { option: "kepiting", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "cheese",
            order: 10,
            options: {
              create: [
                { option: "keju", isCorrect: true, order: 1 },
                { option: "yogurt", isCorrect: false, order: 2 },
                { option: "mentega", isCorrect: false, order: 3 },
              ],
            },
          },
        ],
      },
    },
  });
  console.log(`✅ Quiz created: ${quiz5.title}`);

  const quiz6 = await prisma.quiz.create({
    data: {
      title: "Quiz Keluarga",
      description:
        "Pelajari anggota keluarga dan hubungan keluarga dalam bahasa Inggris.",
      published: true,
      createdById: admin.id,
      questions: {
        create: [
          {
            question: "mother",
            order: 1,
            options: {
              create: [
                { option: "ibu", isCorrect: true, order: 1 },
                { option: "ayah", isCorrect: false, order: 2 },
                { option: "saudara", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "father",
            order: 2,
            options: {
              create: [
                { option: "ayah", isCorrect: true, order: 1 },
                { option: "ibu", isCorrect: false, order: 2 },
                { option: "kakak", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "brother",
            order: 3,
            options: {
              create: [
                { option: "kakak laki-laki", isCorrect: true, order: 1 },
                { option: "kakak perempuan", isCorrect: false, order: 2 },
                { option: "adik laki-laki", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "sister",
            order: 4,
            options: {
              create: [
                { option: "kakak perempuan", isCorrect: true, order: 1 },
                { option: "kakak laki-laki", isCorrect: false, order: 2 },
                { option: "adik perempuan", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "grandmother",
            order: 5,
            options: {
              create: [
                { option: "nenek", isCorrect: true, order: 1 },
                { option: "kakek", isCorrect: false, order: 2 },
                { option: "tante", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "grandfather",
            order: 6,
            options: {
              create: [
                { option: "kakek", isCorrect: true, order: 1 },
                { option: "nenek", isCorrect: false, order: 2 },
                { option: "paman", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "aunt",
            order: 7,
            options: {
              create: [
                { option: "tante", isCorrect: true, order: 1 },
                { option: "paman", isCorrect: false, order: 2 },
                { option: "sepupu", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "uncle",
            order: 8,
            options: {
              create: [
                { option: "paman", isCorrect: true, order: 1 },
                { option: "tante", isCorrect: false, order: 2 },
                { option: "sepupu", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "cousin",
            order: 9,
            options: {
              create: [
                { option: "sepupu", isCorrect: true, order: 1 },
                { option: "tante", isCorrect: false, order: 2 },
                { option: "paman", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "son",
            order: 10,
            options: {
              create: [
                { option: "anak laki-laki", isCorrect: true, order: 1 },
                { option: "anak perempuan", isCorrect: false, order: 2 },
                { option: "anak", isCorrect: false, order: 3 },
              ],
            },
          },
        ],
      },
    },
  });
  console.log(`✅ Quiz created: ${quiz6.title}`);

  const quiz7 = await prisma.quiz.create({
    data: {
      title: "Quiz Warna",
      description:
        "Terjemahkan nama-nama warna dari bahasa Inggris ke Indonesia.",
      published: true,
      createdById: admin.id,
      questions: {
        create: [
          {
            question: "red",
            order: 1,
            options: {
              create: [
                { option: "merah", isCorrect: true, order: 1 },
                { option: "biru", isCorrect: false, order: 2 },
                { option: "hijau", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "blue",
            order: 2,
            options: {
              create: [
                { option: "biru", isCorrect: true, order: 1 },
                { option: "merah", isCorrect: false, order: 2 },
                { option: "kuning", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "green",
            order: 3,
            options: {
              create: [
                { option: "hijau", isCorrect: true, order: 1 },
                { option: "kuning", isCorrect: false, order: 2 },
                { option: "biru", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "yellow",
            order: 4,
            options: {
              create: [
                { option: "kuning", isCorrect: true, order: 1 },
                { option: "oranye", isCorrect: false, order: 2 },
                { option: "hijau", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "black",
            order: 5,
            options: {
              create: [
                { option: "hitam", isCorrect: true, order: 1 },
                { option: "putih", isCorrect: false, order: 2 },
                { option: "abu-abu", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "white",
            order: 6,
            options: {
              create: [
                { option: "putih", isCorrect: true, order: 1 },
                { option: "hitam", isCorrect: false, order: 2 },
                { option: "abu-abu", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "orange",
            order: 7,
            options: {
              create: [
                { option: "oranye", isCorrect: true, order: 1 },
                { option: "kuning", isCorrect: false, order: 2 },
                { option: "merah", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "purple",
            order: 8,
            options: {
              create: [
                { option: "ungu", isCorrect: true, order: 1 },
                { option: "biru", isCorrect: false, order: 2 },
                { option: "merah", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "pink",
            order: 9,
            options: {
              create: [
                { option: "merah muda", isCorrect: true, order: 1 },
                { option: "merah", isCorrect: false, order: 2 },
                { option: "ungu", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "gray",
            order: 10,
            options: {
              create: [
                { option: "abu-abu", isCorrect: true, order: 1 },
                { option: "hitam", isCorrect: false, order: 2 },
                { option: "putih", isCorrect: false, order: 3 },
              ],
            },
          },
        ],
      },
    },
  });
  console.log(`✅ Quiz created: ${quiz7.title}`);

  const quiz8 = await prisma.quiz.create({
    data: {
      title: "Quiz Tempat & Lokasi",
      description:
        "Pelajari nama-nama tempat dan lokasi penting dalam bahasa Inggris.",
      published: true,
      createdById: admin.id,
      questions: {
        create: [
          {
            question: "hospital",
            order: 1,
            options: {
              create: [
                { option: "rumah sakit", isCorrect: true, order: 1 },
                { option: "sekolah", isCorrect: false, order: 2 },
                { option: "kantor", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "school",
            order: 2,
            options: {
              create: [
                { option: "sekolah", isCorrect: true, order: 1 },
                { option: "rumah sakit", isCorrect: false, order: 2 },
                { option: "toko", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "market",
            order: 3,
            options: {
              create: [
                { option: "pasar", isCorrect: true, order: 1 },
                { option: "toko", isCorrect: false, order: 2 },
                { option: "bank", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "bank",
            order: 4,
            options: {
              create: [
                { option: "bank", isCorrect: true, order: 1 },
                { option: "kantor", isCorrect: false, order: 2 },
                { option: "pasar", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "restaurant",
            order: 5,
            options: {
              create: [
                { option: "restoran", isCorrect: true, order: 1 },
                { option: "kafe", isCorrect: false, order: 2 },
                { option: "warung", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "library",
            order: 6,
            options: {
              create: [
                { option: "perpustakaan", isCorrect: true, order: 1 },
                { option: "toko buku", isCorrect: false, order: 2 },
                { option: "sekolah", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "airport",
            order: 7,
            options: {
              create: [
                { option: "bandara", isCorrect: true, order: 1 },
                { option: "stasiun", isCorrect: false, order: 2 },
                { option: "terminal", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "station",
            order: 8,
            options: {
              create: [
                { option: "stasiun", isCorrect: true, order: 1 },
                { option: "bandara", isCorrect: false, order: 2 },
                { option: "terminal", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "park",
            order: 9,
            options: {
              create: [
                { option: "taman", isCorrect: true, order: 1 },
                { option: "hutan", isCorrect: false, order: 2 },
                { option: "kebun", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "church",
            order: 10,
            options: {
              create: [
                { option: "gereja", isCorrect: true, order: 1 },
                { option: "masjid", isCorrect: false, order: 2 },
                { option: "kuil", isCorrect: false, order: 3 },
              ],
            },
          },
        ],
      },
    },
  });
  console.log(`✅ Quiz created: ${quiz8.title}`);

  const quiz9 = await prisma.quiz.create({
    data: {
      title: "Quiz Pekerjaan",
      description:
        "Terjemahkan berbagai jenis pekerjaan dan profesi dari bahasa Inggris.",
      published: true,
      createdById: admin.id,
      questions: {
        create: [
          {
            question: "doctor",
            order: 1,
            options: {
              create: [
                { option: "dokter", isCorrect: true, order: 1 },
                { option: "perawat", isCorrect: false, order: 2 },
                { option: "guru", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "teacher",
            order: 2,
            options: {
              create: [
                { option: "guru", isCorrect: true, order: 1 },
                { option: "dokter", isCorrect: false, order: 2 },
                { option: "insinyur", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "engineer",
            order: 3,
            options: {
              create: [
                { option: "insinyur", isCorrect: true, order: 1 },
                { option: "arsitek", isCorrect: false, order: 2 },
                { option: "desainer", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "nurse",
            order: 4,
            options: {
              create: [
                { option: "perawat", isCorrect: true, order: 1 },
                { option: "dokter", isCorrect: false, order: 2 },
                { option: "bidan", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "farmer",
            order: 5,
            options: {
              create: [
                { option: "petani", isCorrect: true, order: 1 },
                { option: "nelayan", isCorrect: false, order: 2 },
                { option: "penggembala", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "artist",
            order: 6,
            options: {
              create: [
                { option: "seniman", isCorrect: true, order: 1 },
                { option: "desainer", isCorrect: false, order: 2 },
                { option: "fotografer", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "lawyer",
            order: 7,
            options: {
              create: [
                { option: "pengacara", isCorrect: true, order: 1 },
                { option: "hakim", isCorrect: false, order: 2 },
                { option: "notaris", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "pilot",
            order: 8,
            options: {
              create: [
                { option: "pilot", isCorrect: true, order: 1 },
                { option: "kapten", isCorrect: false, order: 2 },
                { option: "navigator", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "chef",
            order: 9,
            options: {
              create: [
                { option: "koki", isCorrect: true, order: 1 },
                { option: "pelayan", isCorrect: false, order: 2 },
                { option: "pemilik restoran", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "musician",
            order: 10,
            options: {
              create: [
                { option: "musisi", isCorrect: true, order: 1 },
                { option: "penyanyi", isCorrect: false, order: 2 },
                { option: "penari", isCorrect: false, order: 3 },
              ],
            },
          },
        ],
      },
    },
  });
  console.log(`✅ Quiz created: ${quiz9.title}`);

  const quiz10 = await prisma.quiz.create({
    data: {
      title: "Quiz Aktivitas Sehari-hari",
      description: "Pelajari kata-kata aktivitas harian dalam bahasa Inggris.",
      published: true,
      createdById: admin.id,
      questions: {
        create: [
          {
            question: "wake up",
            order: 1,
            options: {
              create: [
                { option: "bangun tidur", isCorrect: true, order: 1 },
                { option: "tidur", isCorrect: false, order: 2 },
                { option: "berbaring", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "shower",
            order: 2,
            options: {
              create: [
                { option: "mandi", isCorrect: true, order: 1 },
                { option: "membasuh", isCorrect: false, order: 2 },
                { option: "mencuci", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "breakfast",
            order: 3,
            options: {
              create: [
                { option: "sarapan", isCorrect: true, order: 1 },
                { option: "makan siang", isCorrect: false, order: 2 },
                { option: "makan malam", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "work",
            order: 4,
            options: {
              create: [
                { option: "bekerja", isCorrect: true, order: 1 },
                { option: "istirahat", isCorrect: false, order: 2 },
                { option: "bermain", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "lunch",
            order: 5,
            options: {
              create: [
                { option: "makan siang", isCorrect: true, order: 1 },
                { option: "sarapan", isCorrect: false, order: 2 },
                { option: "makan malam", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "exercise",
            order: 6,
            options: {
              create: [
                { option: "berolahraga", isCorrect: true, order: 1 },
                { option: "bermain", isCorrect: false, order: 2 },
                { option: "berjalan", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "dinner",
            order: 7,
            options: {
              create: [
                { option: "makan malam", isCorrect: true, order: 1 },
                { option: "makan siang", isCorrect: false, order: 2 },
                { option: "sarapan", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "read",
            order: 8,
            options: {
              create: [
                { option: "membaca", isCorrect: true, order: 1 },
                { option: "menulis", isCorrect: false, order: 2 },
                { option: "menggambar", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "watch",
            order: 9,
            options: {
              create: [
                { option: "menonton", isCorrect: true, order: 1 },
                { option: "melihat", isCorrect: false, order: 2 },
                { option: "mengamati", isCorrect: false, order: 3 },
              ],
            },
          },
          {
            question: "sleep",
            order: 10,
            options: {
              create: [
                { option: "tidur", isCorrect: true, order: 1 },
                { option: "bangun", isCorrect: false, order: 2 },
                { option: "berbaring", isCorrect: false, order: 3 },
              ],
            },
          },
        ],
      },
    },
  });
  console.log(`✅ Quiz created: ${quiz10.title}`);

  return {
    quiz1,
    quiz2,
    quiz3,
    quiz4,
    quiz5,
    quiz6,
    quiz7,
    quiz8,
    quiz9,
    quiz10,
  };
}

module.exports = { seedQuizzes };
