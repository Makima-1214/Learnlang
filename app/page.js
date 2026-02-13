"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/learn");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#f0f9f4] flex items-center justify-center">
        <div className="text-[#1e3a2e] text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f9f4]">
      {/* Header */}
      <header className="bg-white border-b-2 border-[#d1e8dd]">
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-[#1e3a2e]">LernLang</h1>
          <div className="flex gap-3">
            <Link
              href="/login"
              className="px-6 py-2 bg-white border-2 border-[#6fbf8f] text-[#6fbf8f] rounded-lg hover:bg-[#f0f9f4] transition-colors font-semibold"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-6 py-2 bg-[#6fbf8f] text-white rounded-lg hover:bg-[#4a9d6a] transition-colors font-semibold"
            >
              Daftar
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-[#1e3a2e] mb-6">
            Belajar Bahasa Inggris dengan AI
          </h2>
          <p className="text-xl text-[#1e3a2e] opacity-80 mb-8 max-w-2xl mx-auto">
            Tingkatkan kemampuan bahasa Inggris Anda dengan latihan terjemahan
            yang dinilai oleh AI menggunakan teknologi terkini.
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-4 bg-[#6fbf8f] text-white rounded-lg hover:bg-[#4a9d6a] transition-colors font-semibold text-lg"
          >
            Mulai Belajar Gratis
          </Link>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <div className="bg-white rounded-xl shadow-sm border-2 border-[#d1e8dd] p-8">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-bold text-[#1e3a2e] mb-3">
              2 Mode Belajar
            </h3>
            <p className="text-[#1e3a2e] opacity-75">
              English → Indonesian dan Indonesian → English. Pilih mode sesuai
              kebutuhan Anda.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border-2 border-[#d1e8dd] p-8">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-bold text-[#1e3a2e] mb-3">
              Evaluasi AI
            </h3>
            <p className="text-[#1e3a2e] opacity-75">
              Dapatkan penilaian instant dengan skor 0-100 dan feedback detail
              dari AI.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border-2 border-[#d1e8dd] p-8">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-[#1e3a2e] mb-3">
              Tracking Progress
            </h3>
            <p className="text-[#1e3a2e] opacity-75">
              Pantau perkembangan belajar Anda dengan statistik dan riwayat
              lengkap.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border-2 border-[#d1e8dd] p-8">
            <div className="text-4xl mb-4">🎓</div>
            <h3 className="text-xl font-bold text-[#1e3a2e] mb-3">
              3 Tingkat Kesulitan
            </h3>
            <p className="text-[#1e3a2e] opacity-75">
              Mulai dari level mudah hingga sulit, sesuaikan dengan kemampuan
              Anda.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border-2 border-[#d1e8dd] p-8">
            <div className="text-4xl mb-4">💡</div>
            <h3 className="text-xl font-bold text-[#1e3a2e] mb-3">
              Feedback Konstruktif
            </h3>
            <p className="text-[#1e3a2e] opacity-75">
              Dapatkan penjelasan detail tentang kesalahan dan cara
              memperbaikinya.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border-2 border-[#d1e8dd] p-8">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-bold text-[#1e3a2e] mb-3">Data Aman</h3>
            <p className="text-[#1e3a2e] opacity-75">
              Semua progress Anda tersimpan aman di database dan dapat diakses
              kapan saja.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-xl shadow-sm border-2 border-[#d1e8dd] p-12 text-center">
          <h3 className="text-3xl font-bold text-[#1e3a2e] mb-4">
            Siap Meningkatkan Bahasa Inggris Anda?
          </h3>
          <p className="text-lg text-[#1e3a2e] opacity-75 mb-6">
            Daftar sekarang dan mulai perjalanan belajar Anda!
          </p>
          <Link
            href="/register"
            className="inline-block px-8 py-4 bg-[#6fbf8f] text-white rounded-lg hover:bg-[#4a9d6a] transition-colors font-semibold text-lg"
          >
            Daftar Sekarang
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t-2 border-[#d1e8dd] mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-[#1e3a2e]">
          <p className="text-sm">
            LernLang © 2026 - Belajar Bahasa Inggris dengan AI
          </p>
        </div>
      </footer>
    </div>
  );
}
