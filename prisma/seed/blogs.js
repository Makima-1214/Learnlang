async function seedBlogs(prisma, admin) {
  const blogSeeds = [
    {
      title: "5 Tips Efektif Belajar Bahasa Inggris untuk Pemula",
      slug: "5-tips-efektif-belajar-bahasa-inggris-untuk-pemula",
      excerpt:
        "Mulai belajar bahasa Inggris bisa terasa menakutkan. Berikut 5 tips yang bisa membantu kamu memulai perjalanan belajar dengan lebih percaya diri.",
      coverImage: null,
      published: true,
      authorId: admin.id,
      content:
        "Artikel ini membahas 5 tips sederhana untuk pemula: tetapkan tujuan, belajar kosakata secara kontekstual, praktik setiap hari, manfaatkan media favorit, dan jangan takut salah.",
    },
    {
      title: "Memahami Tenses dalam Bahasa Inggris: Panduan Lengkap",
      slug: "memahami-tenses-dalam-bahasa-inggris",
      excerpt:
        "Tenses sering menjadi momok bagi pelajar bahasa Inggris. Artikel ini membahas 3 tenses dasar yang wajib kamu kuasai.",
      coverImage: null,
      published: true,
      authorId: admin.id,
      content:
        "Panduan ringkas tenses: simple present untuk kebiasaan/fakta, simple past untuk kejadian lampau, dan present continuous untuk kejadian yang sedang berlangsung.",
    },
    {
      title: "Kesalahan Umum dalam Terjemahan Bahasa Inggris - Indonesia",
      slug: "kesalahan-umum-terjemahan-bahasa-inggris-indonesia",
      excerpt:
        "Pelajari kesalahan-kesalahan yang sering dilakukan saat menerjemahkan dan bagaimana cara menghindarinya.",
      coverImage: null,
      published: true,
      authorId: admin.id,
      content:
        "Bahas kesalahan terjemahan kata per kata, konteks, false friends, artikel, dan urutan kata adjektiva.",
    },
    {
      title: "Panduan Lengkap Menggunakan LernLang untuk Belajar Efektif",
      slug: "panduan-menggunakan-learnlang",
      excerpt:
        "Pelajari cara memaksimalkan penggunaan LernLang untuk meningkatkan kemampuan bahasa Inggrismu.",
      coverImage: null,
      published: false,
      authorId: admin.id,
      content:
        "Panduan penggunaan platform LernLang untuk mode latihan, tingkat kesulitan, dan feedback AI.",
    },
    {
      title: "Rutinitas 15 Menit untuk Konsisten Belajar Bahasa Inggris",
      slug: "rutinitas-15-menit-belajar-bahasa-inggris",
      excerpt:
        "Belajar bahasa Inggris tidak harus lama. Dengan rutinitas 15 menit yang konsisten, progresmu bisa lebih stabil setiap hari.",
      coverImage: null,
      published: true,
      authorId: admin.id,
      content:
        "Rutinitas singkat: review kosakata, membaca, lalu menulis atau menerjemahkan selama 15 menit setiap hari.",
    },
  ];

  let blogCount = 0;
  for (const blog of blogSeeds) {
    const existing = await prisma.blog.findUnique({
      where: { slug: blog.slug },
    });
    if (!existing) {
      await prisma.blog.create({ data: blog });
      blogCount++;
      console.log(`✅ Blog: ${blog.title.substring(0, 50)}...`);
    } else {
      console.log(`⏭️  Blog already exists: ${blog.title.substring(0, 50)}...`);
    }
  }

  console.log(`\n✅ ${blogCount} blogs created`);
  return blogCount;
}

module.exports = { seedBlogs };
async function seedBlogs(prisma, admin) {
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
\
\
\
Subject + Verb (s/es) + Object
\
\
\

**Contoh:**
- I **study** English every day.
- She **works** at a hospital.
- The sun **rises** in the east.

## Simple Past Tense

Digunakan untuk kejadian yang **sudah selesai** di masa lampau.

**Rumus:**
\
\
\
Subject + Verb 2 (past form) + Object
\
\
\

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
\
\
\
Subject + am/is/are + Verb-ing + Object
\
\
\

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
    {
      title: "Rutinitas 15 Menit untuk Konsisten Belajar Bahasa Inggris",
      slug: "rutinitas-15-menit-belajar-bahasa-inggris",
      excerpt:
        "Belajar bahasa Inggris tidak harus lama. Dengan rutinitas 15 menit yang konsisten, progresmu bisa lebih stabil setiap hari.",
      coverImage: null,
      published: true,
      authorId: admin.id,
      content: `# Rutinitas 15 Menit untuk Konsisten Belajar Bahasa Inggris

Konsistensi lebih penting daripada durasi panjang. Artikel ini merangkum rutinitas singkat yang bisa kamu ulang setiap hari agar belajar tetap berjalan tanpa terasa berat.

## 1. 5 Menit Review Kosakata

Ulangi 5-10 kata baru yang sudah dipelajari kemarin.

## 2. 5 Menit Membaca

Baca satu paragraf artikel, lalu tandai kata yang belum dipahami.

## 3. 5 Menit Menulis atau Menerjemahkan

Tulis satu atau dua kalimat sederhana, atau terjemahkan kalimat pendek di LernLang.

> Kunci utamanya adalah kecil, konsisten, dan bisa diulang setiap hari.
`,
    },
  ];

  let blogCount = 0;
  for (const blog of blogSeeds) {
    const existing = await prisma.blog.findUnique({
      where: { slug: blog.slug },
    });
    if (!existing) {
      await prisma.blog.create({ data: blog });
      blogCount++;
      console.log(`✅ Blog: ${blog.title.substring(0, 50)}...`);
    } else {
      console.log(`⏭️  Blog already exists: ${blog.title.substring(0, 50)}...`);
    }
  }

  console.log(`\n✅ ${blogCount} blogs created`);
  return blogCount;
}

module.exports = { seedBlogs };
