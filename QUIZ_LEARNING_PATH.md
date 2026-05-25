# 🎯 Sistem Jalur Belajar Quiz

## Fitur Baru

### 1. **Jalur Belajar Interaktif**
- Quiz ditampilkan dalam bentuk jalur belajar visual seperti di halaman home
- Animasi mascot AI yang bergerak mengikuti progress user
- Desain path dengan bezier curve yang smooth dan menarik

### 2. **Sistem Lock/Unlock**
- Quiz hanya bisa diakses jika quiz sebelumnya sudah diselesaikan
- Quiz pertama (order = 0) selalu terbuka
- Quiz yang terkunci menampilkan icon gembok
- Toast notification jika user mencoba akses quiz yang terkunci

### 3. **Metadata Quiz Baru**
Admin sekarang bisa mengatur:
- **Order** (urutan level): 0 = pertama, 1 = kedua, dst.
- **Time Limit**: Batas waktu pengerjaan dalam menit (opsional)
- **Icon**: Emoji untuk quiz (contoh: 🧠, ⚡, 🌐, 🤖)
- **Color**: Warna tema untuk quiz (hex color)

### 4. **Visual Enhancements**
- Node quiz lebih besar dan lebih menarik
- Popup detail quiz dengan informasi lengkap
- Status indicator (completed/unlocked/locked)
- Badge urutan level
- Animasi smooth saat hover dan click

## Database Changes

### Schema Update
```prisma
model Quiz {
  // ... existing fields
  order       Int      @default(0)     // Urutan dalam jalur belajar
  timeLimit   Int?                     // Batas waktu (menit)
  icon        String?  @db.Text        // Icon/emoji
  color       String?  @default("#6366F1") // Warna tema
  // ...
}
```

### Migration
Sudah di-push ke database dengan `npx prisma db push`

## Cara Menggunakan (Admin)

### Membuat Quiz Baru
1. Buka `/admin/quizzes/create`
2. Isi informasi dasar:
   - **Judul Quiz**: Nama quiz
   - **Deskripsi**: Penjelasan singkat
   - **Urutan Level**: 0 untuk quiz pertama, 1 untuk kedua, dst.
   - **Batas Waktu**: Opsional, dalam menit
   - **Icon/Emoji**: Pilih emoji yang sesuai (🧠, ⚡, 🌐, 🤖, dll)
   - **Warna Tema**: Pilih warna dengan color picker
3. Tambahkan pertanyaan dan opsi jawaban
4. Centang "Publikasikan Quiz" jika siap dipublikasikan
5. Klik "Simpan Quiz"

### Tips Pengaturan Order
- **Order 0**: Quiz dasar/pengenalan (selalu terbuka)
- **Order 1**: Quiz lanjutan (terbuka setelah order 0 selesai)
- **Order 2**: Quiz menengah (terbuka setelah order 1 selesai)
- **Order 3+**: Quiz advanced (terbuka secara berurutan)

### Rekomendasi Icon & Warna
- **Level 1 (Dasar)**: 🧠 + #6366F1 (Indigo)
- **Level 2 (Vocab)**: ⚡ + #10B981 (Emerald)
- **Level 3 (Global)**: 🌐 + #1CB0F6 (Cyan)
- **Level 4 (Advanced)**: 🤖 + #A560E8 (Purple)
- **Level 5+**: 👑 + #F59E0B (Amber)

## Cara Kerja Sistem Lock

### Logic Unlock
```javascript
const isQuizUnlocked = (quiz) => {
  if (quiz.order === 0) return true; // Quiz pertama selalu terbuka
  
  const previousQuiz = quizzes.find(q => q.order === quiz.order - 1);
  if (!previousQuiz) return true;
  
  // Cek apakah quiz sebelumnya sudah diselesaikan
  return previousQuiz.results && previousQuiz.results.length > 0;
};
```

### User Experience
1. User melihat jalur belajar dengan semua quiz
2. Quiz yang terkunci ditampilkan dengan warna abu-abu dan icon gembok
3. User hanya bisa klik quiz yang sudah terbuka
4. Setelah menyelesaikan quiz, quiz berikutnya otomatis terbuka
5. Mascot AI bergerak ke posisi quiz aktif (quiz pertama yang belum selesai)

## API Changes

### GET /api/quizzes
Sekarang mengurutkan berdasarkan `order` (ascending) bukan `createdAt`

### POST /api/admin/quizzes
Menerima field tambahan:
- `order`: Integer (default 0)
- `timeLimit`: Integer nullable
- `icon`: String nullable
- `color`: String (default "#6366F1")

## File yang Diubah

1. **prisma/schema.prisma** - Tambah field baru di model Quiz
2. **app/quiz/page.js** - Halaman quiz dengan jalur belajar
3. **app/api/quizzes/route.js** - Sort by order
4. **app/api/admin/quizzes/route.js** - Accept new fields
5. **app/admin/quizzes/create/page.js** - Form untuk field baru

## Testing

### Test Scenario
1. ✅ Buat 3-4 quiz dengan order berbeda (0, 1, 2, 3)
2. ✅ Set icon dan warna berbeda untuk setiap quiz
3. ✅ Publikasikan semua quiz
4. ✅ Login sebagai user biasa
5. ✅ Buka `/quiz` - hanya quiz pertama yang terbuka
6. ✅ Selesaikan quiz pertama
7. ✅ Refresh - quiz kedua sekarang terbuka
8. ✅ Coba klik quiz ketiga (masih terkunci) - muncul toast error
9. ✅ Selesaikan quiz kedua
10. ✅ Quiz ketiga sekarang terbuka

## Future Enhancements

- [ ] Progress bar untuk setiap quiz
- [ ] Leaderboard per quiz
- [ ] Badge/achievement untuk menyelesaikan semua quiz
- [ ] Retry limit untuk quiz
- [ ] Minimum score requirement untuk unlock next quiz
- [ ] Quiz prerequisites (bisa skip jika sudah punya skill tertentu)
