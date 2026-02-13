# 🚀 Quick Start Guide - LernLang

Panduan cepat untuk langsung menggunakan aplikasi LernLang.

## ⚡ Super Quick Start (5 Menit)

### Step 1: Install Ollama (2 menit)

```bash
# Windows: Download dari https://ollama.ai/download dan install
# Atau gunakan command berikut di PowerShell (sebagai Admin):
winget install Ollama.Ollama
```

### Step 2: Download Model (2 menit)

```bash
ollama pull gemma2:2b
```

### Step 3: Install Dependencies (30 detik)

```bash
npm install
```

### Step 4: Jalankan Aplikasi (10 detik)

```bash
# Terminal 1: Jalankan Ollama
ollama serve

# Terminal 2: Jalankan Aplikasi
npm run dev
```

### Step 5: Buka Browser

Akses: http://localhost:3000

## ✅ Checklist Sebelum Mulai

- [ ] Node.js terinstall (`node --version` untuk cek)
- [ ] Ollama terinstall (`ollama --version` untuk cek)
- [ ] Model gemma2:2b terdownload (`ollama list` untuk cek)
- [ ] Dependencies npm terinstall
- [ ] Ollama service berjalan di background

## 🎯 Cara Pakai Aplikasi

1. **Generate Kalimat**
   - Pilih tingkat kesulitan
   - Klik "Mulai Belajar"

2. **Terjemahkan**
   - Baca kalimat bahasa Inggris
   - Tulis terjemahan dalam bahasa Indonesia

3. **Evaluasi**
   - Klik "Evaluasi Terjemahan"
   - Lihat skor dan feedback

4. **Lihat Riwayat**
   - Klik "Riwayat Belajar" di header
   - Review latihan sebelumnya

## 🐛 Troubleshooting Cepat

### Error: "Failed to generate sentence"

```bash
# Cek Ollama berjalan
ollama serve
```

### Error: "Model not found"

```bash
# Download model
ollama pull gemma2:2b
```

### Port 3000 sudah digunakan

```bash
# Gunakan port lain
npm run dev -- -p 3001
```

### Aplikasi lambat

- Pastikan hanya 1 instance Ollama yang berjalan
- Close aplikasi berat lainnya
- Model pertama kali butuh waktu "warm up"

## 📝 Tips & Tricks

1. **Warm Up Model** (untuk response lebih cepat):

   ```bash
   ollama run gemma2:2b
   # Ketik sesuatu, tunggu response, lalu exit dengan /bye
   ```

2. **Keep Ollama Running**:
   Biarkan `ollama serve` tetap berjalan di background.

3. **Test Ollama**:
   Buka http://localhost:11434 - jika muncul "Ollama is running", berarti OK!

4. **Multi-tab**:
   Buka aplikasi di beberapa tab untuk latihan lebih banyak.

## 📚 Resource Tambahan

- [README.md](./README.md) - Dokumentasi lengkap
- [OLLAMA_SETUP.md](./OLLAMA_SETUP.md) - Setup Ollama detail
- [Ollama Docs](https://github.com/ollama/ollama) - Dokumentasi resmi Ollama

## 🎨 Fitur UI

- ✅ Warna hijau lembut yang menenangkan
- ✅ Responsive design (mobile-friendly)
- ✅ Animasi smooth
- ✅ Feedback visual yang jelas
- ✅ Dark mode ready (bisa ditambahkan)

## 💡 Ide Latihan

1. **Daily Practice**: Latihan 10 kalimat setiap hari
2. **Progressive Difficulty**: Mulai easy → medium → hard
3. **Review Mistakes**: Cek riwayat untuk pola kesalahan
4. **Speed Challenge**: Coba berapa kalimat dalam 10 menit

## 🏆 Target Skor

- **Beginner**: Rata-rata 60+
- **Intermediate**: Rata-rata 75+
- **Advanced**: Rata-rata 85+
- **Expert**: Rata-rata 95+

---

**Selamat Belajar! 🎓**

Jika ada pertanyaan atau issue, check README.md atau buat issue di GitHub.
