"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

// ── Custom Icons ──────────────────────────────────────────────────────────────

const UsersIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
    <circle cx="9" cy="7" r="3.5" fill="white" />
    <path d="M2 20c0-3.5 3-6 7-6s7 2.5 7 6" stroke="white" strokeWidth="2.2" strokeLinecap="round" fill="none" />
    <circle cx="18" cy="8" r="2.5" fill="white" opacity="0.6" />
    <path d="M22 20c0-2.5-1.5-4.5-4-4.5" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />
  </svg>
);

const ShieldIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
    <path d="M12 2L4 6v5c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V6L12 2z" fill="white" opacity="0.3" stroke="white" strokeWidth="2" strokeLinejoin="round" />
    <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const BookIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M6.5 3H20v18H6.5A2.5 2.5 0 0 1 4 19.5v-14A2.5 2.5 0 0 1 6.5 3z" fill="white" opacity="0.3" stroke="white" strokeWidth="2" />
    <line x1="8" y1="8" x2="16" y2="8" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
    <line x1="8" y1="12" x2="14" y2="12" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const TrendIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
    <path d="M3 17L9 11L13 15L21 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M21 7v5M21 7h-5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="9" cy="11" r="2" fill="white" opacity="0.6" />
    <circle cx="13" cy="15" r="2" fill="white" opacity="0.6" />
  </svg>
);

const CrownIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
    <path d="M3 18h18M5 18l2-8 5 4 5-8 2 8" stroke="#FBBF24" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <circle cx="5" cy="10" r="1.5" fill="#FBBF24" />
    <circle cx="12" cy="6" r="1.5" fill="#EF4444" />
    <circle cx="19" cy="10" r="1.5" fill="#FBBF24" />
  </svg>
);

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      if (session.user.role !== "ADMIN") {
        router.push("/learn");
      } else {
        fetchDashboardData();
      }
    }
  }, [status, session, router]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/admin/dashboard");
      const data = await response.json();
      if (response.ok) setDashboardData(data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl font-black text-indigo-500 animate-pulse">
          Memuat Dashboard...
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== "ADMIN") return null;

  const stats = dashboardData?.stats || {};
  const recentLearners = dashboardData?.recentLearners || [];
  const exercisesByMode = dashboardData?.exercisesByMode || [];

  return (
    <div className="min-h-screen bg-gray-50 font-[family-name:var(--font-nunito)]">
      <style dangerouslySetInnerHTML={{ __html: `
        .stat-card { border-bottom-width: 6px; transition: all 0.2s ease; }
        .stat-card:hover { transform: translateY(-4px); border-bottom-width: 8px; }
      `}} />

      <main className="max-w-5xl mx-auto px-6 py-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-10"
        >
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">
              Dashboard
            </h1>
            <p className="text-gray-500 font-bold">
              Halo, {session.user.name}! 👋 Selamat datang di panel admin
            </p>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { icon: <UsersIcon />, label: "Total Pengguna", value: stats.totalUsers || 0, color: "from-indigo-500 to-indigo-600", border: "border-indigo-700" },
            { icon: <ShieldIcon />, label: "Administrator",  value: stats.totalAdmins || 0, color: "from-amber-500 to-amber-600",  border: "border-amber-700"  },
            { icon: <BookIcon />,   label: "Total Latihan",  value: stats.totalExercises || 0, color: "from-emerald-500 to-emerald-600", border: "border-emerald-700" },
            { icon: <TrendIcon />,  label: "Pengguna Aktif", value: stats.activeUsers || 0, color: "from-pink-500 to-pink-600",    border: "border-pink-700"   },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`stat-card bg-white rounded-3xl border-4 ${stat.border} p-6 shadow-sm`}
            >
              <div className={`bg-gradient-to-br ${stat.color} p-3 rounded-2xl w-fit mb-4 shadow-md`}>
                {stat.icon}
              </div>
              <div className="text-4xl font-black text-gray-900 mb-1">
                {stat.value.toLocaleString()}
              </div>
              <div className="text-sm font-bold text-gray-500">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Distribution & Top Learners */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Mode Distribution */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-3xl border-4 border-b-8 border-gray-200 p-6 shadow-sm"
          >
            <h3 className="text-xl font-black text-gray-900 mb-1">Distribusi Mode</h3>
            <p className="text-sm font-bold text-gray-400 mb-6">Berdasarkan tipe translasi</p>
            <div className="space-y-4">
              {exercisesByMode.length > 0 ? (
                exercisesByMode.map((mode, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${mode.mode === "EN_ID" ? "bg-indigo-500" : "bg-emerald-500"}`} />
                      <span className="font-black text-gray-700">
                        {mode.mode === "EN_ID" ? "EN → ID" : "ID → EN"}
                      </span>
                    </div>
                    <div className="text-2xl font-black text-gray-900">{mode._count}</div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400 font-bold">Belum ada data</div>
              )}
            </div>
          </motion.div>

          {/* Top Learners */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="lg:col-span-2 bg-white rounded-3xl border-4 border-b-8 border-gray-200 p-6 shadow-sm"
          >
            <div className="flex items-center gap-3 mb-6">
              <CrownIcon />
              <div>
                <h3 className="text-xl font-black text-gray-900">Top Learners</h3>
                <p className="text-sm font-bold text-gray-400">Pengguna paling aktif (7 hari terakhir)</p>
              </div>
            </div>

            {recentLearners.length > 0 ? (
              <div className="space-y-3">
                {recentLearners.slice(0, 5).map((learner, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl w-8 text-center">
                        {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : (
                          <span className="font-black text-gray-400 text-base">#{i + 1}</span>
                        )}
                      </div>
                      <div>
                        <div className="font-black text-gray-900">{learner.name}</div>
                        <div className="text-xs font-bold text-gray-400">{learner.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className={`px-3 py-1 rounded-full text-xs font-black ${
                        learner.role === "ADMIN" ? "bg-amber-100 text-amber-700" : "bg-indigo-100 text-indigo-700"
                      }`}>
                        {learner.role}
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-black text-indigo-600">{learner._count.histories}</div>
                        <div className="text-xs font-bold text-gray-400">latihan</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400 font-bold">
                Belum ada pengguna aktif dalam 7 hari terakhir
              </div>
            )}
          </motion.div>
        </div>

      </main>
    </div>
  );
}
