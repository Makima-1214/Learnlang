"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LearnPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [mode, setMode] = useState("EN_ID"); // EN_ID or ID_EN
  const [currentSentence, setCurrentSentence] = useState("");
  const [userTranslation, setUserTranslation] = useState("");
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [error, setError] = useState("");
  const [questionCount, setQuestionCount] = useState(0);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const generateSentence = async () => {
    setLoading(true);
    setError("");
    setEvaluation(null);
    setUserTranslation("");

    try {
      const response = await fetch("/api/generate-sentence", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ difficulty, mode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate sentence");
      }

      setCurrentSentence(data.sentence);
      setQuestionCount((prev) => prev + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const evaluateTranslation = async () => {
    if (!userTranslation.trim()) {
      setError("Silakan masukkan terjemahan terlebih dahulu");
      return;
    }

    setEvaluating(true);
    setError("");

    try {
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sourceSentence: currentSentence,
          userTranslation: userTranslation,
          mode: mode,
          difficulty: difficulty,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to evaluate");
      }

      setEvaluation(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setEvaluating(false);
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

  if (status === "loading") {
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
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-[#1e3a2e]">LernLang</h1>
            <div className="flex items-center gap-4">
              <span className="text-[#1e3a2e]">Halo, {session.user.name}!</span>
              <Link
                href="/history"
                className="px-4 py-2 bg-[#a8dcc0] text-[#1e3a2e] rounded-lg hover:bg-[#6fbf8f] hover:text-white transition-colors"
              >
                Riwayat
              </Link>
              {session.user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="px-4 py-2 bg-[#6fbf8f] text-white rounded-lg hover:bg-[#4a9d6a] transition-colors"
                >
                  Admin
                </Link>
              )}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="px-4 py-2 bg-[#ef4444] text-white rounded-lg hover:bg-[#dc2626] transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Welcome Section with Mode Selector */}
        <div className="bg-white rounded-xl shadow-sm border-2 border-[#d1e8dd] p-8 mb-6">
          <h2 className="text-2xl font-bold text-[#1e3a2e] mb-3">
            Mode Belajar
          </h2>

          {/* Mode Selection */}
          <div className="mb-6">
            <label className="block text-[#1e3a2e] font-semibold mb-2">
              Pilih Mode:
            </label>
            <div className="flex gap-3 mb-4">
              <button
                onClick={() => setMode("EN_ID")}
                className={`flex-1 px-6 py-4 rounded-lg font-medium transition-colors ${
                  mode === "EN_ID"
                    ? "bg-[#6fbf8f] text-white"
                    : "bg-[#a8dcc0] text-[#1e3a2e] hover:bg-[#6fbf8f] hover:text-white"
                }`}
              >
                <div className="font-bold text-lg mb-1">
                  English → Indonesian
                </div>
                <div className="text-sm opacity-90">
                  Terjemahkan dari bahasa Inggris ke Indonesia
                </div>
              </button>
              <button
                onClick={() => setMode("ID_EN")}
                className={`flex-1 px-6 py-4 rounded-lg font-medium transition-colors ${
                  mode === "ID_EN"
                    ? "bg-[#6fbf8f] text-white"
                    : "bg-[#a8dcc0] text-[#1e3a2e] hover:bg-[#6fbf8f] hover:text-white"
                }`}
              >
                <div className="font-bold text-lg mb-1">
                  Indonesian → English
                </div>
                <div className="text-sm opacity-90">
                  Terjemahkan dari bahasa Indonesia ke Inggris
                </div>
              </button>
            </div>
          </div>

          {/* Difficulty Selection */}
          <div className="mb-4">
            <label className="block text-[#1e3a2e] font-semibold mb-2">
              Tingkat Kesulitan:
            </label>
            <div className="flex gap-3">
              {["EASY", "MEDIUM", "HARD"].map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    difficulty === level
                      ? "bg-[#6fbf8f] text-white"
                      : "bg-[#a8dcc0] text-[#1e3a2e] hover:bg-[#6fbf8f] hover:text-white"
                  }`}
                >
                  {level === "EASY"
                    ? "Mudah"
                    : level === "MEDIUM"
                      ? "Sedang"
                      : "Sulit"}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={generateSentence}
            disabled={loading}
            className="w-full bg-[#6fbf8f] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#4a9d6a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? "Menghasilkan..."
              : questionCount === 0
                ? "Mulai Belajar"
                : "Generate Kalimat Baru"}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-[#fee2e2] border-2 border-[#ef4444] rounded-lg p-4 mb-6">
            <p className="text-[#991b1b] font-medium">{error}</p>
          </div>
        )}

        {/* Question Section */}
        {currentSentence && (
          <div className="bg-white rounded-xl shadow-sm border-2 border-[#d1e8dd] p-8 mb-6">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-[#1e3a2e]">
                  {mode === "EN_ID"
                    ? "Kalimat Bahasa Inggris:"
                    : "Kalimat Bahasa Indonesia:"}
                </h3>
                <div className="flex gap-2">
                  <span className="text-sm px-3 py-1 bg-[#a8dcc0] text-[#1e3a2e] rounded-full">
                    {mode === "EN_ID" ? "EN → ID" : "ID → EN"}
                  </span>
                  <span className="text-sm px-3 py-1 bg-[#a8dcc0] text-[#1e3a2e] rounded-full">
                    {difficulty === "EASY"
                      ? "Mudah"
                      : difficulty === "MEDIUM"
                        ? "Sedang"
                        : "Sulit"}
                  </span>
                </div>
              </div>
              <div className="bg-[#f0f9f4] rounded-lg p-4 border-2 border-[#d1e8dd]">
                <p className="text-xl text-[#1e3a2e] font-medium">
                  {currentSentence}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-[#1e3a2e] font-semibold mb-2">
                {mode === "EN_ID"
                  ? "Terjemahan Anda (Bahasa Indonesia):"
                  : "Your Translation (English):"}
              </label>
              <textarea
                value={userTranslation}
                onChange={(e) => setUserTranslation(e.target.value)}
                placeholder={
                  mode === "EN_ID"
                    ? "Ketik terjemahan Anda di sini..."
                    : "Type your translation here..."
                }
                className="w-full px-4 py-3 border-2 border-[#d1e8dd] rounded-lg focus:outline-none focus:border-[#6fbf8f] text-[#1e3a2e] resize-none"
                rows="4"
                disabled={evaluating}
              />
            </div>

            <button
              onClick={evaluateTranslation}
              disabled={evaluating || !userTranslation.trim()}
              className="w-full bg-[#6fbf8f] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#4a9d6a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {evaluating ? "Mengevaluasi..." : "Evaluasi Terjemahan"}
            </button>
          </div>
        )}

        {/* Evaluation Result */}
        {evaluation && (
          <div className="bg-white rounded-xl shadow-sm border-2 border-[#d1e8dd] p-8">
            <h3 className="text-2xl font-bold text-[#1e3a2e] mb-6 text-center">
              Hasil Evaluasi
            </h3>

            <div className="space-y-6">
              {/* Score and Status */}
              <div className="flex flex-col items-center gap-4 pb-6 border-b-2 border-[#d1e8dd]">
                <div className="text-center">
                  <p className="text-sm text-[#1e3a2e] mb-2">Skor Anda:</p>
                  <p
                    className={`text-6xl font-bold ${getScoreColor(evaluation.score)}`}
                  >
                    {evaluation.score}
                  </p>
                  <p className="text-sm text-[#1e3a2e] mt-1">dari 100</p>
                </div>
                <span
                  className={`px-6 py-2 rounded-full font-semibold text-lg ${getStatusColor(
                    evaluation.status,
                  )}`}
                >
                  {getStatusLabel(evaluation.status)}
                </span>
              </div>

              {/* Translations Comparison */}
              <div>
                <h4 className="font-semibold text-[#1e3a2e] mb-2">
                  Terjemahan Anda:
                </h4>
                <div className="bg-[#f0f9f4] rounded-lg p-4 border-2 border-[#d1e8dd]">
                  <p className="text-[#1e3a2e]">{userTranslation}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-[#1e3a2e] mb-2">
                  Terjemahan yang Benar:
                </h4>
                <div className="bg-[#e8f5e9] rounded-lg p-4 border-2 border-[#6fbf8f]">
                  <p className="text-[#1e3a2e] font-medium">
                    {evaluation.correctTranslation}
                  </p>
                </div>
              </div>

              {/* Feedback */}
              <div>
                <h4 className="font-semibold text-[#1e3a2e] mb-2">Feedback:</h4>
                <div className="bg-[#f0f9f4] rounded-lg p-4 border-2 border-[#d1e8dd]">
                  <p className="text-[#1e3a2e]">{evaluation.feedback}</p>
                </div>
              </div>

              <button
                onClick={generateSentence}
                className="w-full bg-[#6fbf8f] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#4a9d6a] transition-colors mt-4"
              >
                Latihan Soal Baru
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t-2 border-[#d1e8dd] mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-[#1e3a2e]">
          <p className="text-sm">
            LernLang © 2026 - Belajar Bahasa Inggris dengan AI
          </p>
        </div>
      </footer>
    </div>
  );
}
