"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      if (session.user.role !== "ADMIN") {
        router.push("/learn");
      } else {
        fetchStats();
      }
    }
  }, [status, session, router]);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      const data = await response.json();

      if (response.ok) {
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#f0f9f4] flex items-center justify-center">
        <div className="text-[#1e3a2e] text-xl">Loading...</div>
      </div>
    );
  }

  if (!session || session.user.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f0f9f4]">
      {/* Header */}
      <header className="bg-white border-b-2 border-[#d1e8dd]">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link
                href="/learn"
                className="px-4 py-2 bg-[#a8dcc0] text-[#1e3a2e] rounded-lg hover:bg-[#6fbf8f] hover:text-white transition-colors"
              >
                ← Dashboard
              </Link>
              <h1 className="text-3xl font-bold text-[#1e3a2e]">Admin Panel</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[#1e3a2e]">
                {session.user.name} (Admin)
              </span>
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

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-[#1e3a2e] mb-6">
          Statistik Platform
        </h2>

        {stats && (
          <>
            {/* Overall Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-xl shadow-sm border-2 border-[#d1e8dd] p-6 text-center">
                <p className="text-sm text-[#1e3a2e] mb-1">Total Users</p>
                <p className="text-4xl font-bold text-[#6fbf8f]">
                  {stats.totalUsers}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border-2 border-[#d1e8dd] p-6 text-center">
                <p className="text-sm text-[#1e3a2e] mb-1">Total Latihan</p>
                <p className="text-4xl font-bold text-[#6fbf8f]">
                  {stats.totalExercises}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border-2 border-[#d1e8dd] p-6 text-center">
                <p className="text-sm text-[#1e3a2e] mb-1">Rata-rata Skor</p>
                <p className="text-4xl font-bold text-[#6fbf8f]">
                  {stats.averageScore}
                </p>
              </div>
              <div className="bg-white rounded-xl shadow-sm border-2 border-[#d1e8dd] p-6 text-center">
                <p className="text-sm text-[#1e3a2e] mb-1">Total Admins</p>
                <p className="text-4xl font-bold text-[#6fbf8f]">
                  {stats.totalAdmins}
                </p>
              </div>
            </div>

            {/* Mode Distribution */}
            <div className="bg-white rounded-xl shadow-sm border-2 border-[#d1e8dd] p-6 mb-6">
              <h3 className="text-xl font-bold text-[#1e3a2e] mb-4">
                Distribusi Mode
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-lg font-semibold text-[#1e3a2e] mb-2">
                    EN → ID
                  </p>
                  <p className="text-3xl font-bold text-[#6fbf8f]">
                    {stats.modeDistribution.EN_ID}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-[#1e3a2e] mb-2">
                    ID → EN
                  </p>
                  <p className="text-3xl font-bold text-[#6fbf8f]">
                    {stats.modeDistribution.ID_EN}
                  </p>
                </div>
              </div>
            </div>

            {/* Difficulty Distribution */}
            <div className="bg-white rounded-xl shadow-sm border-2 border-[#d1e8dd] p-6 mb-6">
              <h3 className="text-xl font-bold text-[#1e3a2e] mb-4">
                Distribusi Kesulitan
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-lg font-semibold text-[#1e3a2e] mb-2">
                    Mudah
                  </p>
                  <p className="text-3xl font-bold text-[#6fbf8f]">
                    {stats.difficultyDistribution.EASY}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-[#1e3a2e] mb-2">
                    Sedang
                  </p>
                  <p className="text-3xl font-bold text-[#6fbf8f]">
                    {stats.difficultyDistribution.MEDIUM}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-[#1e3a2e] mb-2">
                    Sulit
                  </p>
                  <p className="text-3xl font-bold text-[#6fbf8f]">
                    {stats.difficultyDistribution.HARD}
                  </p>
                </div>
              </div>
            </div>

            {/* Status Distribution */}
            <div className="bg-white rounded-xl shadow-sm border-2 border-[#d1e8dd] p-6">
              <h3 className="text-xl font-bold text-[#1e3a2e] mb-4">
                Distribusi Status
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-lg font-semibold text-[#1e3a2e] mb-2">
                    Benar
                  </p>
                  <p className="text-3xl font-bold text-[#4a9d6a]">
                    {stats.statusDistribution.BENAR}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-[#1e3a2e] mb-2">
                    Hampir Benar
                  </p>
                  <p className="text-3xl font-bold text-[#f59e0b]">
                    {stats.statusDistribution.HAMPIR_BENAR}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-semibold text-[#1e3a2e] mb-2">
                    Salah
                  </p>
                  <p className="text-3xl font-bold text-[#ef4444]">
                    {stats.statusDistribution.SALAH}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t-2 border-[#d1e8dd] mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-[#1e3a2e]">
          <p className="text-sm">LernLang © 2026 - Admin Panel</p>
        </div>
      </footer>
    </div>
  );
}
