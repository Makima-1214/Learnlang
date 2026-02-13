# LernLang - Aplikasi Belajar Bahasa Inggris dengan AI

LernLang adalah aplikasi web modern untuk belajar bahasa Inggris melalui latihan terjemahan yang dinilai oleh AI menggunakan model Gemma2:2b dari Ollama.

## Fitur Utama

- 🎯 **Generate Kalimat Otomatis**: AI menghasilkan kalimat bahasa Inggris dengan 3 tingkat kesulitan (Mudah, Sedang, Sulit)
- 📝 **Latihan Terjemahan**: Pengguna menerjemahkan kalimat bahasa Inggris ke bahasa Indonesia
- 🤖 **Evaluasi AI**: AI mengevaluasi terjemahan dengan:
  - Skor 0-100
  - Status: Benar (90-100), Hampir Benar (60-89), atau Salah (<60)
  - Terjemahan yang benar
  - Feedback konstruktif
- 💾 **Penyimpanan Lokal**: Riwayat latihan disimpan di localStorage browser
- 📊 **Statistik Belajar**: Melihat progress dengan statistik lengkap
- 🎨 **UI Modern**: Desain clean dengan warna hijau lembut tanpa gradasi

## Prasyarat

Sebelum menjalankan aplikasi, pastikan Anda telah menginstal:

1. **Node.js** (versi 18 atau lebih baru)
2. **Ollama** dengan model Gemma2:2b

### Instalasi Ollama dan Model

1. Download dan install Ollama dari [https://ollama.ai](https://ollama.ai)
2. Jalankan Ollama di terminal:
   ```bash
   ollama serve
   ```
3. Download model Gemma2:2b (di terminal baru):
   ```bash
   ollama pull gemma2:2b
   ```

## Instalasi Aplikasi

1. Clone repository ini
2. Install dependencies:
   ```bash
   npm install
   ```

## Menjalankan Aplikasi

1. Pastikan Ollama sudah berjalan di background:

   ```bash
   ollama serve
   ```

2. Jalankan aplikasi development server:

   ```bash
   npm run dev
   ```

3. Buka browser dan akses:
   ```
   http://localhost:3000
   ```

## Cara Menggunakan

1. **Mulai Belajar**:
   - Pilih tingkat kesulitan (Mudah/Sedang/Sulit)
   - Klik tombol "Mulai Belajar" atau "Generate Kalimat Baru"

2. **Latihan Terjemahan**:
   - Baca kalimat bahasa Inggris yang ditampilkan
   - Tulis terjemahan dalam bahasa Indonesia di kolom yang tersedia
   - Klik "Evaluasi Terjemahan"

3. **Lihat Hasil**:
   - Skor Anda (0-100)
   - Status (Benar/Hampir Benar/Salah)
   - Perbandingan terjemahan Anda vs terjemahan yang benar
   - Feedback dari AI

4. **Riwayat Belajar**:
   - Klik "Riwayat Belajar" di header
   - Lihat statistik lengkap
   - Filter berdasarkan status
   - Urutkan berdasarkan tanggal atau skor

## Teknologi yang Digunakan

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS 4
- **AI Model**: Gemma2:2b (via Ollama)
- **Storage**: localStorage (browser)
- **Font**: Geist Sans & Geist Mono

## Struktur Folder

```
learnlang/
├── app/
│   ├── api/
│   │   ├── generate-sentence/
│   │   │   └── route.js          # API untuk generate kalimat
│   │   └── evaluate/
│   │       └── route.js          # API untuk evaluasi terjemahan
│   ├── history/
│   │   └── page.js               # Halaman riwayat belajar
│   ├── globals.css               # Styling global dengan tema hijau
│   ├── layout.js                 # Root layout
│   └── page.js                   # Halaman utama
├── public/                       # Assets statis
├── package.json                  # Dependencies
└── README.md                     # Dokumentasi
```

## Konfigurasi Warna

Aplikasi menggunakan skema warna hijau lembut yang konsisten:

- Background: `#f0f9f4` (hijau sangat lembut)
- Primary: `#6fbf8f` (hijau sedang)
- Primary Dark: `#4a9d6a` (hijau tua untuk hover)
- Primary Light: `#a8dcc0` (hijau muda)
- Border: `#d1e8dd` (hijau border)
- Card Background: `#ffffff` (putih)

## Troubleshooting

### Error: Failed to generate sentence

**Solusi**: Pastikan Ollama sedang berjalan

```bash
ollama serve
```

### Error: Model not found

**Solusi**: Download model gemma2:2b

```bash
ollama pull gemma2:2b
```

### Port 11434 tidak dapat diakses

**Solusi**: Periksa apakah Ollama berjalan di port default (11434)

## Pengembangan Lebih Lanjut

Fitur yang bisa ditambahkan:

- [ ] Login/Register dengan database
- [ ] Leaderboard
- [ ] Berbagai kategori kalimat (bisnis, travel, daily conversation)
- [ ] Mode listening (speech-to-text)
- [ ] Ekspor riwayat ke PDF
- [ ] Grafik progress belajar
- [ ] Sistem achievement/badges

## Lisensi

MIT License

## Author

Fauzaro01

---

**LernLang** - Belajar Bahasa Inggris dengan AI © 2026
