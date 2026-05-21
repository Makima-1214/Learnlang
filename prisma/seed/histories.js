async function seedHistories(prisma, users) {
  const historySeeds = [
    {
      userId: users[0].id,
      mode: "EN_ID",
      sourceLanguage: "en",
      targetLanguage: "id",
      sourceSentence: "The cat is sleeping on the couch.",
      userTranslation: "Kucing itu sedang tidur di sofa.",
      correctTranslation: "Kucing itu tidur di sofa.",
      score: 90,
      status: "BENAR",
      feedback:
        "Terjemahan sangat baik! Penggunaan 'sedang' tidak salah, namun bisa lebih ringkas.",
      difficulty: "EASY",
    },
    {
      userId: users[0].id,
      mode: "ID_EN",
      sourceLanguage: "id",
      targetLanguage: "en",
      sourceSentence: "Saya suka membaca buku di perpustakaan.",
      userTranslation: "I like reading books in the library.",
      correctTranslation: "I like reading books in the library.",
      score: 100,
      status: "BENAR",
      feedback: "Terjemahan sempurna! Tidak ada kesalahan.",
      difficulty: "EASY",
    },
    {
      userId: users[0].id,
      mode: "EN_ID",
      sourceLanguage: "en",
      targetLanguage: "id",
      sourceSentence:
        "Despite the heavy rain, the children continued to play outside.",
      userTranslation: "Meskipun hujan besar, anak-anak terus bermain di luar.",
      correctTranslation:
        "Meskipun hujan deras, anak-anak tetap bermain di luar.",
      score: 75,
      status: "HAMPIR_BENAR",
      feedback:
        "'Hujan besar' sebaiknya 'hujan deras'. 'Terus' bisa diganti 'tetap' untuk nuansa yang lebih tepat.",
      difficulty: "MEDIUM",
    },
    {
      userId: users[1].id,
      mode: "EN_ID",
      sourceLanguage: "en",
      targetLanguage: "id",
      sourceSentence: "She has been working here for five years.",
      userTranslation: "Dia sudah bekerja di sini selama lima tahun.",
      correctTranslation: "Dia telah bekerja di sini selama lima tahun.",
      score: 85,
      status: "BENAR",
      feedback:
        "Baik! 'Sudah' dan 'telah' keduanya bisa diterima dalam konteks ini.",
      difficulty: "MEDIUM",
    },
    {
      userId: users[1].id,
      mode: "ID_EN",
      sourceLanguage: "id",
      targetLanguage: "en",
      sourceSentence: "Mereka sedang mempersiapkan presentasi untuk besok.",
      userTranslation: "They are prepare presentation for tomorrow.",
      correctTranslation: "They are preparing a presentation for tomorrow.",
      score: 40,
      status: "SALAH",
      feedback:
        "Setelah 'are' harus menggunakan bentuk -ing (preparing). Juga perlu artikel 'a' sebelum 'presentation'.",
      difficulty: "MEDIUM",
    },
    {
      userId: users[1].id,
      mode: "EN_ID",
      sourceLanguage: "en",
      targetLanguage: "id",
      sourceSentence:
        "The government implemented new policies to combat climate change.",
      userTranslation:
        "Pemerintah membuat kebijakan baru untuk melawan perubahan iklim.",
      correctTranslation:
        "Pemerintah menerapkan kebijakan baru untuk memerangi perubahan iklim.",
      score: 70,
      status: "HAMPIR_BENAR",
      feedback:
        "'Implemented' lebih tepat diterjemahkan 'menerapkan' daripada 'membuat'. 'Combat' lebih tepat 'memerangi'.",
      difficulty: "HARD",
    },
    {
      userId: users[2].id,
      mode: "EN_ID",
      sourceLanguage: "en",
      targetLanguage: "id",
      sourceSentence: "Could you please pass me the salt?",
      userTranslation: "Bisakah kamu mengoper garam?",
      correctTranslation: "Bisakah kamu mengoper garamnya?",
      score: 80,
      status: "BENAR",
      feedback:
        "Bagus! Tapi lebih natural dengan menambahkan '-nya' menjadi 'garamnya'.",
      difficulty: "EASY",
    },
    {
      userId: users[2].id,
      mode: "ID_EN",
      sourceLanguage: "id",
      targetLanguage: "en",
      sourceSentence:
        "Kemarin saya pergi ke pasar untuk membeli sayuran segar.",
      userTranslation: "Yesterday I go to market to buy fresh vegetable.",
      correctTranslation:
        "Yesterday I went to the market to buy fresh vegetables.",
      score: 35,
      status: "SALAH",
      feedback:
        "Perlu past tense 'went' (bukan 'go'). Perlu artikel 'the' sebelum 'market'. 'Vegetable' harus jamak 'vegetables'.",
      difficulty: "EASY",
    },
    {
      userId: users[3].id,
      mode: "EN_ID",
      sourceLanguage: "en",
      targetLanguage: "id",
      sourceSentence:
        "The research findings suggest that exercise improves mental health.",
      userTranslation:
        "Temuan penelitian menunjukkan bahwa olahraga meningkatkan kesehatan mental.",
      correctTranslation:
        "Temuan penelitian menunjukkan bahwa olahraga meningkatkan kesehatan mental.",
      score: 100,
      status: "BENAR",
      feedback: "Terjemahan sempurna! Sangat akurat dan natural.",
      difficulty: "HARD",
    },
    {
      userId: users[3].id,
      mode: "ID_EN",
      sourceLanguage: "id",
      targetLanguage: "en",
      sourceSentence:
        "Meskipun dia sangat lelah, dia tetap menyelesaikan tugasnya.",
      userTranslation: "Although she is very tired, she still finish her task.",
      correctTranslation:
        "Although she was very tired, she still finished her task.",
      score: 50,
      status: "HAMPIR_BENAR",
      feedback:
        "Perlu menggunakan past tense: 'was' bukan 'is', 'finished' bukan 'finish'.",
      difficulty: "MEDIUM",
    },
    {
      userId: users[4].id,
      mode: "EN_ID",
      sourceLanguage: "en",
      targetLanguage: "id",
      sourceSentence: "I would have gone if you had told me earlier.",
      userTranslation: "Saya akan pergi jika kamu kasih tahu saya lebih awal.",
      correctTranslation:
        "Saya akan pergi jika kamu memberitahu saya lebih awal.",
      score: 60,
      status: "HAMPIR_BENAR",
      feedback:
        "Nuansa conditional perfect hilang. 'Kasih tahu' terlalu informal, gunakan 'memberitahu'.",
      difficulty: "HARD",
    },
    {
      userId: users[4].id,
      mode: "ID_EN",
      sourceLanguage: "id",
      targetLanguage: "en",
      sourceSentence: "Kami berharap cuaca besok cerah.",
      userTranslation: "We hope the weather tomorrow is sunny.",
      correctTranslation: "We hope the weather will be sunny tomorrow.",
      score: 70,
      status: "HAMPIR_BENAR",
      feedback:
        "Perlu 'will be' untuk masa depan. Posisi 'tomorrow' lebih natural di akhir kalimat.",
      difficulty: "EASY",
    },
  ];

  let historyCount = 0;
  for (const history of historySeeds) {
    await prisma.history.create({ data: history });
    historyCount++;
  }

  console.log(`✅ ${historyCount} history records created`);
  return historyCount;
}

module.exports = { seedHistories };
