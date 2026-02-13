const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...\n");

  // ============================================
  // USERS
  // ============================================
  const hashedPassword = await bcrypt.hash("password123", 10);
  const adminPassword = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@learnlang.com" },
    update: {},
    create: {
      name: "Admin LernLang",
      email: "admin@learnlang.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });
  console.log(`✅ Admin user: ${admin.email}`);

  const users = [];
  const userSeeds = [
    { name: "Budi Santoso", email: "budi@example.com" },
    { name: "Siti Nurhaliza", email: "siti@example.com" },
    { name: "Andi Prasetya", email: "andi@example.com" },
    { name: "Dewi Lestari", email: "dewi@example.com" },
    { name: "Rizky Hidayat", email: "rizky@example.com" },
  ];

  for (const u of userSeeds) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        name: u.name,
        email: u.email,
        password: hashedPassword,
        role: "USER",
      },
    });
    users.push(user);
    console.log(`✅ User: ${user.email}`);
  }

  // ============================================
  // HISTORY (Learning records for users)
  // ============================================
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
  for (const h of historySeeds) {
    await prisma.history.create({ data: h });
    historyCount++;
  }
  console.log(`\n✅ ${historyCount} history records created`);

  // ============================================
  // BLOGS
  // ============================================
  const blogSeeds = [
    {
      title: "5 Tips Efektif Belajar Bahasa Inggris untuk Pemula",
      slug: "5-tips-efektif-belajar-bahasa-inggris-untuk-pemula",
      excerpt:
        "Mulai belajar bahasa Inggris bisa terasa menakutkan. Berikut 5 tips yang bisa membantu kamu memulai perjalanan belajar dengan lebih percaya diri.",
      coverImage: null,
      published: true,
      authorId: admin.id,
      content: `# 5 Tips Efektif Belajar Bahasa Inggris untuk Pemula

Belajar bahasa Inggris tidak harus sulit! Dengan strategi yang tepat, kamu bisa meningkatkan kemampuan bahasa Inggrismu secara signifikan. Berikut adalah 5 tips yang bisa kamu terapkan mulai hari ini.

## 1. 🎯 Tetapkan Tujuan yang Jelas

Sebelum mulai belajar, tentukan dulu **apa yang ingin kamu capai**. Apakah kamu ingin:
- Bisa berbicara sehari-hari?
- Lulus ujian TOEFL/IELTS?
- Membaca artikel berbahasa Inggris?

Dengan tujuan yang jelas, kamu bisa fokus pada area yang paling relevan.

## 2. 📚 Belajar Kosakata Secara Kontekstual

Jangan hanya menghafal daftar kata! Pelajari kosakata dalam **konteks kalimat**. Misalnya:

| Kata | Contoh Kalimat |
|------|----------------|
| *improve* | I want to **improve** my English skills. |
| *practice* | She **practices** speaking every day. |
| *fluent* | He is **fluent** in three languages. |

> 💡 **Tips:** Gunakan fitur latihan di LernLang untuk belajar kosakata dalam konteks!

## 3. 🗣️ Praktikkan Setiap Hari

Konsistensi adalah kunci. Luangkan minimal **15-30 menit** setiap hari untuk:
1. Mendengarkan podcast bahasa Inggris
2. Menulis jurnal sederhana
3. Berlatih terjemahan di LernLang

## 4. 📺 Manfaatkan Media yang Kamu Suka

Belajar bahasa Inggris bisa menyenangkan! Coba:
- Tonton film/series dengan **subtitle Inggris**
- Dengarkan lagu favorit dan pahami liriknya
- Ikuti akun media sosial berbahasa Inggris

## 5. 🤝 Jangan Takut Salah

Kesalahan adalah bagian dari proses belajar. Semakin banyak kamu berlatih dan membuat kesalahan, semakin cepat kamu belajar!

---

*Mulai perjalanan belajar bahasa Inggrismu sekarang di LernLang! 🚀*`,
    },
    {
      title: "Memahami Tenses dalam Bahasa Inggris: Panduan Lengkap",
      slug: "memahami-tenses-dalam-bahasa-inggris",
      excerpt:
        "Tenses sering menjadi momok bagi pelajar bahasa Inggris. Artikel ini membahas 3 tenses dasar yang wajib kamu kuasai.",
      coverImage: null,
      published: true,
      authorId: admin.id,
      content: `# Memahami Tenses dalam Bahasa Inggris

Tenses adalah salah satu fondasi penting dalam bahasa Inggris. Dengan memahami tenses, kamu bisa mengekspresikan waktu dengan tepat.

## Simple Present Tense

Digunakan untuk **kebiasaan** atau **fakta umum**.

**Rumus:**
\`\`\`
Subject + Verb (s/es) + Object
\`\`\`

**Contoh:**
- I **study** English every day.
- She **works** at a hospital.
- The sun **rises** in the east.

## Simple Past Tense

Digunakan untuk kejadian yang **sudah selesai** di masa lampau.

**Rumus:**
\`\`\`
Subject + Verb 2 (past form) + Object
\`\`\`

**Contoh:**
- I **studied** English yesterday.
- She **went** to the market.
- They **played** football last week.

### Irregular Verbs yang Sering Digunakan

| Base Form | Past Form | Arti |
|-----------|-----------|------|
| go | went | pergi |
| eat | ate | makan |
| see | saw | melihat |
| buy | bought | membeli |
| write | wrote | menulis |

## Present Continuous Tense

Digunakan untuk kejadian yang **sedang berlangsung**.

**Rumus:**
\`\`\`
Subject + am/is/are + Verb-ing + Object
\`\`\`

**Contoh:**
- I **am studying** English right now.
- She **is reading** a book.
- They **are playing** in the park.

## Tips Mengingat Tenses

1. **Perhatikan kata kunci waktu** - "every day" (present), "yesterday" (past), "right now" (continuous)
2. **Latihan rutin** - Semakin sering berlatih, semakin natural rasanya
3. **Gunakan LernLang** - Latih kemampuan tenses-mu dengan latihan terjemahan!

> 🎯 **Tantangan:** Coba terjemahkan kalimat-kalimat contoh di atas ke bahasa Indonesia menggunakan LernLang!`,
    },
    {
      title: "Kesalahan Umum dalam Terjemahan Bahasa Inggris - Indonesia",
      slug: "kesalahan-umum-terjemahan-bahasa-inggris-indonesia",
      excerpt:
        "Pelajari kesalahan-kesalahan yang sering dilakukan saat menerjemahkan dan bagaimana cara menghindarinya.",
      coverImage: null,
      published: true,
      authorId: admin.id,
      content: `# Kesalahan Umum dalam Terjemahan Bahasa Inggris - Indonesia

Menerjemahkan bukan hanya tentang mengganti kata per kata. Ada banyak jebakan yang sering ditemui. Yuk, pelajari kesalahan umum berikut!

## 1. Terjemahan Kata per Kata (Word-by-Word)

**❌ Salah:**
> "I am a student" → "Saya adalah seorang siswa"

**✅ Lebih natural:**
> "I am a student" → "Saya seorang siswa" atau "Saya siswa"

Dalam bahasa Indonesia, kata "adalah" sering kali tidak diperlukan.

## 2. Mengabaikan Konteks

Kata "get" punya banyak arti tergantung konteks:

| Kalimat | Arti "get" |
|---------|------------|
| I **get** a book | **mendapat** buku |
| I **get** up early | **bangun** pagi |
| I don't **get** it | tidak **mengerti** |
| **Get** out! | **Keluar!** |

## 3. False Friends (Kata yang Mirip tapi Beda Arti)

Hati-hati dengan kata-kata yang terlihat mirip:

- **Sensible** ≠ Sensitif → artinya *masuk akal*
- **Actually** ≠ Aktual → artinya *sebenarnya*
- **Eventually** ≠ Eventualitas → artinya *akhirnya*
- **Sympathetic** ≠ Simpatik → artinya *penuh simpati/empati*

## 4. Mengabaikan Artikel (a, an, the)

Bahasa Indonesia tidak punya artikel, tapi bahasa Inggris sangat bergantung padanya:

- **A** cat (seekor kucing - umum)
- **The** cat (kucing itu - spesifik)

## 5. Urutan Kata Adjektiva

Dalam bahasa Inggris, adjektiva datang **sebelum** kata benda:
- ✅ "A **beautiful** garden" (sebuah taman **indah**)
- ❌ "A garden beautiful"

---

## Cara Menghindari Kesalahan

1. **Baca ulang** terjemahanmu dan pastikan terdengar natural
2. **Pahami konteks** sebelum menerjemahkan
3. **Berlatih rutin** di LernLang untuk mendapat feedback AI!

> 💪 Semakin banyak berlatih, semakin sedikit kesalahan yang kamu buat!`,
    },
    {
      title: "Panduan Lengkap Menggunakan LernLang untuk Belajar Efektif",
      slug: "panduan-menggunakan-learnlang",
      excerpt:
        "Pelajari cara memaksimalkan penggunaan LernLang untuk meningkatkan kemampuan bahasa Inggrismu.",
      coverImage: null,
      published: false,
      authorId: admin.id,
      content: `# Panduan Lengkap Menggunakan LernLang

Selamat datang di LernLang! Panduan ini akan membantu kamu memaksimalkan penggunaan platform kami.

## Fitur Utama

### 🔄 Mode Terjemahan
LernLang menyediakan dua mode latihan:
1. **English → Indonesia (EN-ID):** Terjemahkan kalimat Inggris ke Indonesia
2. **Indonesia → English (ID-EN):** Terjemahkan kalimat Indonesia ke Inggris

### 📊 Tingkat Kesulitan
Pilih tingkat kesulitan sesuai kemampuanmu:
- **Easy:** Kalimat sederhana dengan kosakata dasar
- **Medium:** Kalimat dengan struktur lebih kompleks
- **Hard:** Kalimat dengan idiom dan grammar tingkat lanjut

### 🤖 AI Feedback
Setiap terjemahan akan dinilai oleh AI dengan:
- **Skor 0-100** berdasarkan akurasi
- **Feedback** terperinci tentang kesalahan dan saran perbaikan
- **Status:** Benar, Hampir Benar, atau Salah

## Tips Menggunakan LernLang

1. Mulai dari tingkat **Easy** dan naikkan secara bertahap
2. Baca **feedback AI** dengan seksama untuk setiap jawaban
3. Cek **History** untuk melihat perkembangan belajarmu
4. Targetkan minimal **5 latihan per hari**

---

> 📝 *Artikel ini masih dalam tahap draft dan akan diperbarui.*`,
    },
  ];

  let blogCount = 0;
  for (const b of blogSeeds) {
    const existing = await prisma.blog.findUnique({ where: { slug: b.slug } });
    if (!existing) {
      await prisma.blog.create({ data: b });
      blogCount++;
      console.log(`✅ Blog: ${b.title.substring(0, 50)}...`);
    } else {
      console.log(`⏭️  Blog already exists: ${b.title.substring(0, 50)}...`);
    }
  }

  console.log(`\n✅ ${blogCount} blogs created`);
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
