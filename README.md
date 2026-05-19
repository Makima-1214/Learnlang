# 📚 LernLang - Belajar Bahasa Inggris dengan AI

Aplikasi web modern untuk belajar bahasa Inggris melalui latihan terjemahan yang dinilai oleh AI.

## ✨ Fitur

- 🎯 **Generate Kalimat AI** - Kalimat otomatis dengan 3 tingkat kesulitan (Mudah, Sedang, Sulit)
- 📝 **Latihan Terjemahan** - Terjemahkan kalimat Inggris ke Indonesia
- 🤖 **Evaluasi AI** - Score 0-100 dengan feedback konstruktif
- 👥 **Quiz & Kuis** - Sistem kuis dengan pertanyaan pilihan ganda
- 💬 **Komentar & Reaksi Real-Time** - Diskusi di blog dengan WebSocket
- 📚 **Blog & Artikel** - Baca artikel pembelajaran
- 👤 **User Profile** - Simpan progress belajar Anda
- 🎨 **Modern UI** - Desain clean dengan Shadcn/UI

## 🚀 Quick Start

### 1. Instalasi

```bash
# Clone repository
git clone <repo-url>
cd learnlang

# Install dependencies
npm install
```

### 2. Setup Database (MySQL)

```bash
# Setup Prisma
npx prisma generate
npx prisma migrate dev

# Seed sample data
npm run db:seed
```

### 3. Setup Ollama (untuk AI evaluation)

```bash
# Download & jalankan Ollama
ollama pull gemma2:2b
ollama serve
```

### 4. Setup Environment Variables

Buat file `.env.local`:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Database
DATABASE_URL=mysql://user:password@localhost:3306/learnlang

# Ollama (optional, untuk AI)
OLLAMA_API_URL=http://localhost:11434
```

### 5. Jalankan Aplikasi

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## 📖 Fitur Lengkap

### 🎓 Learning Module

- Generate kalimat dari AI
- Latihan terjemahan dengan feedback
- Lihat riwayat pembelajaran
- Statistik progress

### 📝 Quiz System

- Create & manage quiz (admin)
- Solve quiz dengan pilihan ganda
- Auto-scoring & detailed results
- Track quiz progress

### 💬 Blog & Community

- Read articles
- Real-time comments
- Reactions (👍 ❤️ 😂 🎉 🤔 👏)
- Comment & reaction notifications

### 👤 User Management

- Register & login
- Edit profile
- View activity history
- Admin dashboard

## 🛠 Tech Stack

- **Framework**: Next.js 16
- **Database**: MySQL + Prisma
- **Auth**: NextAuth.js
- **Real-Time**: Socket.IO
- **AI Model**: Gemma2:2b (Ollama)
- **UI**: Shadcn/UI + Tailwind CSS
- **Animation**: Framer Motion

## 📋 Available Commands

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm start                # Start production server
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Run migrations
npm run db:studio        # Open Prisma Studio
npm run db:reset         # Reset database
npm run db:seed          # Seed sample data
```

## 🔑 Default Login

```
Email: admin@example.com
Password: admin123
```

## 📂 Project Structure

```
learnlang/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   ├── admin/                # Admin pages
│   ├── quiz/                 # Quiz pages
│   ├── blogs/                # Blog pages
│   ├── chats/                # Direct messaging (real-time)
│   ├── diskusi/              # Discussion rooms
│   ├── friends/              # Friend management
│   ├── layout.js             # Root layout
│   └── page.js               # Home page
├── components/               # Reusable components
├── lib/                      # Utilities & helpers
├── prisma/                   # Database schema
└── public/                   # Static assets
```

## 🎯 Next Steps

- Login ke aplikasi
- Explore fitur Learning untuk belajar
- Coba Quiz System
- Baca articles di Blog section
- Join komunitas di comments & reactions

---

**LernLang** © 2026 - Learn English with AI
