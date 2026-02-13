"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchHistory();
    }
  }, [status, router]);

  const fetchHistory = async () => {
    try {
      const response = await fetch("/api/history");
      const data = await response.json();

      if (response.ok) {
        setHistory(data.histories || []);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = async () => {
    if (confirm("Apakah Anda yakin ingin menghapus semua riwayat?")) {
      try {
        const response = await fetch("/api/history", {
          method: "DELETE",
        });

        if (response.ok) {
          setHistory([]);
        }
      } catch (error) {
        console.error("Error clearing history:", error);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "BENAR":
        return "bg-[#6fbf8f] text-white";
      case "HAMPIR_BENAR":
        return "bg-[#f59e0b] text-white";
      case "SALAH":
        return "bg-[#ef4444] text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "BENAR":
        return "BENAR";
      case "HAMPIR_BENAR":
        return "HAMPIR BENAR";
      case "SALAH":
        return "SALAH";
      default:
        return status;
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return "text-[#4a9d6a]";
    if (score >= 60) return "text-[#f59e0b]";
    return "text-[#ef4444]";
  };

  const getModeLabel = (mode) => {
    return mode === "EN_ID" ? "EN → ID" : "ID → EN";
  };

  const getDifficultyLabel = (difficulty) => {
    switch (difficulty) {
      case "EASY":
        return "Mudah";
      case "MEDIUM":
        return "Sedang";
      case "HARD":
        return "Sulit";
      default:
        return difficulty;
    }
  };

  const filteredHistory = history.filter((item) => {
    if (filter === "all") return true;
    if (filter === "benar") return item.status === "BENAR";
    if (filter === "hampir") return item.status === "HAMPIR_BENAR";
    if (filter === "salah") return item.status === "SALAH";
    return true;
  });

  const sortedHistory = [...filteredHistory].sort((a, b) => {
    if (sortBy === "date") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else if (sortBy === "score") {
      return b.score - a.score;
    }
    return 0;
  });

  const stats = {
    total: history.length,
    benar: history.filter((h) => h.status === "BENAR").length,
    hampir: history.filter((h) => h.status === "HAMPIR_BENAR").length,
    salah: history.filter((h) => h.status === "SALAH").length,
    averageScore:
      history.length > 0
        ? Math.round(
            history.reduce((sum, h) => sum + h.score, 0) / history.length,
          )
        : 0,
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#f0f9f4] flex items-center justify-center">
        <div className="text-[#1e3a2e] text-xl">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f0f9f4]">
      {/* Header */}
      <header className="bg-white border-b-2 border-[#d1e8dd]">
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link
              href="/learn"
              className="px-4 py-2 bg-[#a8dcc0] text-[#1e3a2e] rounded-lg hover:bg-[#6fbf8f] hover:text-white transition-colors"
            >
              ← Kembali
            </Link>
            <h1 className="text-3xl font-bold text-[#1e3a2e]">
              Riwayat Belajar
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[#1e3a2e]">{session.user.name}</span>
            {history.length > 0 && (
              <button
                onClick={clearHistory}
                className="px-4 py-2 bg-[#ef4444] text-white rounded-lg hover:bg-[#dc2626] transition-colors"
              >
                Hapus Semua
              </button>
            )}
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="px-4 py-2 bg-[#6fbf8f] text-white rounded-lg hover:bg-[#4a9d6a] transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {history.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border-2 border-[#d1e8dd] p-12 text-center">
            <h2 className="text-2xl font-bold text-[#1e3a2e] mb-3">
              Belum Ada Riwayat
            </h2>
            <p className="text-[#1e3a2e] mb-6">
              Mulai belajar untuk melihat riwayat latihan Anda di sini.
            </p>
            <Link
              href="/learn"
              className="inline-block px-6 py-3 bg-[#6fbf8f] text-white rounded-lg font-semibold hover:bg-[#4a9d6a] transition-colors"
            >
              Mulai Belajar
            </Link>
          </div>
        ) : (
          <>
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-white rounded-xl shadow-sm border-2 border-[#d1e8dd] p-6 text-center">
                <p className="text-sm text-[#1e3a2e] mb-1">Total Latihan</p>
                <p className="text-3xl font-bold text-[#1e3a2e]">
                  {stats.total}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border-2 border-[#6fbf8f] p-6 text-center">
                <p className="text-sm text-[#1e3a2e] mb-1">Benar</p>
                <p className="text-3xl font-bold text-[#4a9d6a]">
                  {stats.benar}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border-2 border-[#f59e0b] p-6 text-center">
                <p className="text-sm text-[#1e3a2e] mb-1">Hampir Benar</p>
                <p className="text-3xl font-bold text-[#f59e0b]">
                  {stats.hampir}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border-2 border-[#ef4444] p-6 text-center">
                <p className="text-sm text-[#1e3a2e] mb-1">Salah</p>
                <p className="text-3xl font-bold text-[#ef4444]">
                  {stats.salah}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border-2 border-[#d1e8dd] p-6 text-center">
                <p className="text-sm text-[#1e3a2e] mb-1">Rata-rata Skor</p>
                <p
                  className={`text-3xl font-bold ${getScoreColor(stats.averageScore)}`}
                >
                  {stats.averageScore}
                </p>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm border-2 border-[#d1e8dd] p-6 mb-6">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-50">
                  <label className="block text-[#1e3a2e] font-semibold mb-2">
                    Filter Status:
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { value: "all", label: "Semua" },
                      { value: "benar", label: "Benar" },
                      { value: "hampir", label: "Hampir Benar" },
                      { value: "salah", label: "Salah" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setFilter(option.value)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          filter === option.value
                            ? "bg-[#6fbf8f] text-white"
                            : "bg-[#a8dcc0] text-[#1e3a2e] hover:bg-[#6fbf8f] hover:text-white"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 min-w-50">
                  <label className="block text-[#1e3a2e] font-semibold mb-2">
                    Urutkan:
                  </label>
                  <div className="flex gap-2">
                    {[
                      { value: "date", label: "Tanggal" },
                      { value: "score", label: "Skor" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setSortBy(option.value)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          sortBy === option.value
                            ? "bg-[#6fbf8f] text-white"
                            : "bg-[#a8dcc0] text-[#1e3a2e] hover:bg-[#6fbf8f] hover:text-white"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* History List */}
            <div className="space-y-4">
              {sortedHistory.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border-2 border-[#d1e8dd] p-8 text-center">
                  <p className="text-[#1e3a2e]">
                    Tidak ada hasil dengan filter ini.
                  </p>
                </div>
              ) : (
                sortedHistory.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl shadow-sm border-2 border-[#d1e8dd] p-6"
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                              item.status,
                            )}`}
                          >
                            {getStatusLabel(item.status)}
                          </span>
                          <span className="text-sm px-3 py-1 bg-[#a8dcc0] text-[#1e3a2e] rounded-full">
                            {getModeLabel(item.mode)}
                          </span>
                          <span className="text-sm px-3 py-1 bg-[#a8dcc0] text-[#1e3a2e] rounded-full">
                            {getDifficultyLabel(item.difficulty)}
                          </span>
                          <span
                            className={`text-2xl font-bold ${getScoreColor(item.score)}`}
                          >
                            {item.score}/100
                          </span>
                        </div>
                        <p className="text-sm text-[#1e3a2e] opacity-75">
                          {new Date(item.createdAt).toLocaleString("id-ID", {
                            dateStyle: "long",
                            timeStyle: "short",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-semibold text-[#1e3a2e] mb-1">
                          {item.mode === "EN_ID"
                            ? "Kalimat Bahasa Inggris:"
                            : "Kalimat Bahasa Indonesia:"}
                        </p>
                        <div className="bg-[#f0f9f4] rounded-lg p-3 border-2 border-[#d1e8dd]">
                          <p className="text-[#1e3a2e]">
                            {item.sourceSentence}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-[#1e3a2e] mb-1">
                          Terjemahan Anda:
                        </p>
                        <div className="bg-[#f0f9f4] rounded-lg p-3 border-2 border-[#d1e8dd]">
                          <p className="text-[#1e3a2e]">
                            {item.userTranslation}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-[#1e3a2e] mb-1">
                          Terjemahan yang Benar:
                        </p>
                        <div className="bg-[#e8f5e9] rounded-lg p-3 border-2 border-[#6fbf8f]">
                          <p className="text-[#1e3a2e]">
                            {item.correctTranslation}
                          </p>
                        </div>
                      </div>

                      {item.feedback && (
                        <div>
                          <p className="text-sm font-semibold text-[#1e3a2e] mb-1">
                            Feedback:
                          </p>
                          <div className="bg-[#f0f9f4] rounded-lg p-3 border-2 border-[#d1e8dd]">
                            <p className="text-[#1e3a2e]">{item.feedback}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
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
