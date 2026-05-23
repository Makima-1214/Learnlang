"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import DashboardLayout from "@/components/DashboardLayout";
import { motion } from "framer-motion";

// ==================================================
// CUSTOM SVG ILLUSTRATIONS — Matching landing page style
// ==================================================

const FlashcardIcon = () => (
  <svg className="w-14 h-14 drop-shadow-md" viewBox="0 0 80 80" fill="none">
    <rect x="14" y="18" width="40" height="48" rx="8" fill="#A7F3D0" transform="rotate(-8 14 18)" />
    <rect x="20" y="12" width="40" height="48" rx="8" fill="#34D399" transform="rotate(-3 20 12)" />
    <rect x="22" y="10" width="40" height="48" rx="8" fill="white" stroke="#10B981" strokeWidth="2.5" />
    <rect x="30" y="22" width="22" height="3" rx="1.5" fill="#10B981" opacity="0.6" />
    <rect x="30" y="29" width="16" height="3" rx="1.5" fill="#A7F3D0" />
    <path d="M54 14l1.5 3 3.5.5-2.5 2.5.5 3.5L54 21.5 51 23.5l.5-3.5L49 17.5l3.5-.5L54 14z" fill="#FBBF24" />
    <circle cx="42" cy="44" r="8" fill="#10B981" />
    <path d="M38 44l3 3 5-6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const HeadphoneIcon = () => (
  <svg className="w-14 h-14 drop-shadow-md" viewBox="0 0 80 80" fill="none">
    <path d="M18 42V32c0-12.15 9.85-22 22-22s22 9.85 22 22v10" stroke="#3B82F6" strokeWidth="5" strokeLinecap="round" />
    <rect x="10" y="36" width="14" height="22" rx="7" fill="#2563EB" />
    <rect x="12" y="38" width="10" height="16" rx="5" fill="#3B82F6" />
    <rect x="56" y="36" width="14" height="22" rx="7" fill="#2563EB" />
    <rect x="58" y="38" width="10" height="16" rx="5" fill="#3B82F6" />
    <rect x="30" y="38" width="3.5" height="14" rx="1.5" fill="#93C5FD">
      <animate attributeName="height" values="14;22;14" dur="0.8s" repeatCount="indefinite" />
      <animate attributeName="y" values="38;34;38" dur="0.8s" repeatCount="indefinite" />
    </rect>
    <rect x="36" y="34" width="3.5" height="22" rx="1.5" fill="#60A5FA">
      <animate attributeName="height" values="22;12;22" dur="1s" repeatCount="indefinite" />
      <animate attributeName="y" values="34;39;34" dur="1s" repeatCount="indefinite" />
    </rect>
    <rect x="42" y="36" width="3.5" height="18" rx="1.5" fill="#93C5FD">
      <animate attributeName="height" values="18;26;18" dur="0.7s" repeatCount="indefinite" />
      <animate attributeName="y" values="36;32;36" dur="0.7s" repeatCount="indefinite" />
    </rect>
    <rect x="48" y="40" width="3.5" height="10" rx="1.5" fill="#BFDBFE">
      <animate attributeName="height" values="10;18;10" dur="1.1s" repeatCount="indefinite" />
      <animate attributeName="y" values="40;36;40" dur="1.1s" repeatCount="indefinite" />
    </rect>
  </svg>
);

const PuzzleIcon = () => (
  <svg className="w-14 h-14 drop-shadow-md" viewBox="0 0 80 80" fill="none">
    <path d="M22 22h14a4 4 0 0 0 0-8 8 8 0 0 1 16 0 4 4 0 0 0 0 8h14v14a4 4 0 0 0 8 0 8 8 0 0 1 0 16 4 4 0 0 0-8 0v14H52a4 4 0 0 0 0 8 8 8 0 0 1-16 0 4 4 0 0 0 0-8H22V52a4 4 0 0 0-8 0 8 8 0 0 1 0-16 4 4 0 0 0 8 0V22z" fill="#FCD34D" />
    <path d="M22 22h14a4 4 0 0 0 0-8 8 8 0 0 1 16 0 4 4 0 0 0 0 8h14v14a4 4 0 0 0 8 0 8 8 0 0 1 0 16 4 4 0 0 0-8 0v8H22V22z" fill="#F59E0B" />
    <circle cx="52" cy="52" r="12" fill="rgba(255,255,255,0.5)" stroke="#7C3AED" strokeWidth="4" />
    <path d="M60 60l8 8" stroke="#7C3AED" strokeWidth="5" strokeLinecap="round" />
    <circle cx="48" cy="48" r="3" fill="rgba(255,255,255,0.9)" />
  </svg>
);

// ==================================================

const methods = [
  {
    key: "vocabulary",
    title: "Kosa Kata",
    badge: "Rekomendasi",
    desc: "Perkaya perbendaharaan kata harianmu lewat kartu interaktif yang seru.",
    Icon: FlashcardIcon,
    color: "from-emerald-500 to-teal-600",
    borderColor: "#059669",
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-700",
    badgeBorder: "border-emerald-300",
  },
  {
    key: "listening",
    title: "Pendengaran",
    badge: "Audio",
    desc: "Latih telingamu menangkap intonasi dan pelafalan langsung dari native.",
    Icon: HeadphoneIcon,
    color: "from-sky-500 to-blue-700",
    borderColor: "#1D4ED8",
    badgeBg: "bg-sky-100",
    badgeText: "text-sky-700",
    badgeBorder: "border-sky-300",
  },
  {
    key: "grammar",
    title: "Tata Bahasa",
    badge: "Structure",
    desc: "Temukan kata yang salah di dalam kalimat lalu perbaiki dengan panduan interaktif.",
    Icon: PuzzleIcon,
    color: "from-amber-500 to-orange-600",
    borderColor: "#D97706",
    badgeBg: "bg-amber-100",
    badgeText: "text-amber-700",
    badgeBorder: "border-amber-300",
  },
];

export default function LearnPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  const handleStart = async (key) => {
    try {
      const res = await fetch("/api/learn/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method: key, level: "A1", limit: 5 }),
      });
      const payload = await res.json();
      if (!res.ok || !payload?.success) return;
      const id = payload.data?.session?.id;
      if (id) {
        sessionStorage.setItem("learningSessionId", id);
        sessionStorage.setItem("learningMethod", key);
        router.push(`/learn/${key}`);
      }
    } catch (err) {
      console.error("Error starting session:", err);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-lg font-black text-[#6366F1] animate-pulse">Memuat...</div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <DashboardLayout>
      <style dangerouslySetInnerHTML={{
        __html: `
        .duo-btn {
          border-bottom-width: 4px;
          transition: all 0.1s ease;
        }
        .duo-btn:hover {
          transform: translateY(-2px);
          border-bottom-width: 6px;
        }
        .duo-btn:active {
          transform: translateY(4px);
          border-bottom-width: 0px;
        }
        .cloud-bg {
          position: absolute;
          background: white;
          border-radius: 999px;
          opacity: 0.7;
          border: 3px solid #E2E8F0;
        }
      `}} />

      <div className="min-h-[calc(100vh-4rem)] bg-white relative w-full font-[family-name:var(--font-nunito)]">

        {/* Cloud Decorations — same as landing page */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="cloud-bg w-48 h-16 top-12 -left-12 shadow-sm animate-[bounce_4s_infinite]" />
          <div className="cloud-bg w-64 h-20 top-32 -right-16 shadow-sm animate-[bounce_5s_infinite]" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 flex flex-col gap-10 relative z-10">

          {/* ── Hero Banner — Chunky game style like landing ── */}
          <motion.section
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="overflow-hidden rounded-3xl bg-gradient-to-r from-[#6366F1] to-[#818CF8] p-8 sm:p-12 text-white shadow-xl border-4 border-b-8 border-[#4338CA] relative"
          >
            <div className="flex flex-col gap-5 relative z-10">
              <div className="inline-flex items-center gap-2 rounded-xl bg-white/20 backdrop-blur-sm px-4 py-2 text-sm font-black text-white border-2 border-white/30 shadow-sm w-fit uppercase tracking-wider">
                🧭 Pilih Mode Latihan
              </div>

              <div className="max-w-2xl">
                <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4 drop-shadow-md leading-tight">
                  Pilih Petualanganmu!
                </h1>
                <p className="text-lg sm:text-xl text-white/90 font-bold leading-relaxed max-w-xl">
                  Selesaikan modul latihan yang dirancang khusus untuk membuatmu cepat fasih berbahasa Inggris.
                </p>
              </div>

              <div className="flex flex-wrap gap-4 mt-2">
                {[
                  ["A1", "Level Dasar"],
                  ["5 Soal", "Per Modul"],
                  ["Seru!", "Gamifikasi"],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-2xl border-4 border-[#4338CA] bg-white text-[#4338CA] px-5 py-3 shadow-[0_4px_0_#4338CA] transform hover:-translate-y-1 active:translate-y-1 active:shadow-none transition-all cursor-default">
                    <div className="text-xl font-black leading-none mb-1">{value}</div>
                    <div className="text-[10px] font-bold opacity-80 uppercase tracking-widest">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* ── Mode Cards — Chunky duo-btn style ── */}
          <div className="flex flex-col gap-4">
            <h3 className="text-2xl font-black text-gray-950 text-center">Pilih Mode Latihan</h3>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {methods.map((m) => {
                const Icon = m.Icon;
                return (
                  <motion.button
                    key={m.key}
                    type="button"
                    onClick={() => handleStart(m.key)}
                    className="group text-left h-full"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <div
                      className="h-full overflow-hidden border-4 border-b-[8px] border-gray-200 hover:border-[#6366F1]/70 rounded-3xl transition-all duration-200 active:translate-y-2 active:border-b-4 bg-white shadow-sm hover:shadow-xl duo-btn"
                      style={{ borderBottomColor: '#E5E7EB' }}
                    >
                      <div className="p-6 h-full flex flex-col gap-4">
                        {/* Top row: icon + badge */}
                        <div className="flex items-start justify-between gap-4">
                          <div className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${m.color} text-white shadow-md border-2 border-b-4 border-black/10`}>
                            <Icon />
                          </div>
                          <span className={`rounded-xl px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${m.badgeBg} ${m.badgeText} border-2 ${m.badgeBorder} group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors`}>
                            {m.badge}
                          </span>
                        </div>

                        {/* Title & desc */}
                        <div className="flex-1 mt-1">
                          <h2 className="text-2xl font-black text-gray-900 mb-2 group-hover:text-[#6366F1] transition-colors">
                            {m.title}
                          </h2>
                          <p className="text-sm font-bold text-gray-500 leading-relaxed">
                            {m.desc}
                          </p>
                        </div>

                        {/* CTA */}
                        <div className="flex items-center gap-2 text-sm font-black text-[#6366F1] uppercase tracking-wider pt-3">
                          Mulai Main
                          <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
