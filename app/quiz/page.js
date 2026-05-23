"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import LoadingScreen from "@/components/LoadingScreen";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import AIMascot from "@/components/AIMascot";

// ==================================================
// CUSTOM SVG ICONS — hand-drawn game style
// ==================================================

const SparkleIcon = () => (
  <svg className="w-4 h-4 text-yellow-300 animate-pulse" viewBox="0 0 16 16" fill="none">
    <path d="M8 0L9.5 5.5L15 7L9.5 8.5L8 14L6.5 8.5L1 7L6.5 5.5L8 0Z" fill="currentColor" />
  </svg>
);

const TrophyHeaderIcon = () => (
  <svg className="w-14 h-14 text-yellow-400 drop-shadow-[0_4px_10px_rgba(250,204,21,0.4)]" viewBox="0 0 80 80" fill="none">
    <path d="M25 45V20h30v25c0 10-8 18-18 18s-12-8-12-18z" fill="#FEF08A" stroke="#CA8A04" strokeWidth="4" />
    <path d="M37 63v10h6V63h-6z" fill="#E2E8F0" stroke="#CA8A04" strokeWidth="4" />
    <rect x="30" y="70" width="20" height="5" rx="2.5" fill="#E2E8F0" stroke="#CA8A04" strokeWidth="4" />
    <path d="M25 25H18v10c0 4 3 7 7 7v-17zM55 25h7v10c0 4-3 7-7 7v-17z" fill="white" stroke="#CA8A04" strokeWidth="4" strokeLinejoin="round" />
    <circle cx="40" cy="35" r="5" fill="#EAB308" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg className="w-5 h-5 text-white shrink-0 drop-shadow-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

const HelpIcon = () => (
  <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

const UsersIcon = () => (
  <svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const ZapIcon = () => (
  <svg className="w-4 h-4 text-amber-500 fill-amber-400 shrink-0" viewBox="0 0 24 24">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
  </svg>
);

const PlayIcon = () => (
  <svg className="w-4 h-4 text-white shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="5 3 19 12 5 21 5 3"></polygon>
  </svg>
);

const EmptyBookIcon = () => (
  <svg className="w-24 h-24 mx-auto mb-6 drop-shadow-md" viewBox="0 0 100 100" fill="none">
    {/* Open book */}
    <path d="M15 30c0-3 8-8 35-8s35 5 35 8v42c0 3-8 6-35 6s-35-3-35-6V30z" fill="#E0E7FF" />
    <path d="M50 22v50" stroke="#6366F1" strokeWidth="2" strokeDasharray="4 2" />
    <path d="M50 22c-12 0-28 2-32 5v45c4-3 20-5 32-5" fill="#EEF2FF" stroke="#818CF8" strokeWidth="1.5" />
    <path d="M50 22c12 0 28 2 32 5v45c-4-3-20-5-32-5" fill="white" stroke="#818CF8" strokeWidth="1.5" />
    <circle cx="78" cy="20" r="4" fill="#FBBF24" />
    <circle cx="22" cy="24" r="3" fill="#6EE7B7" />
  </svg>
);

// ── Level styles (cycles for unlimited quizzes) ───────────────────────────────
const LEVEL_STYLES = [
  { color: "#6366F1", border: "#4338CA", bg: "from-indigo-400 to-indigo-600",   light: "bg-indigo-50 border-indigo-200 text-indigo-600",   icon: "🧠", label: "Pemula"   },
  { color: "#10B981", border: "#047857", bg: "from-emerald-400 to-teal-500",    light: "bg-emerald-50 border-emerald-200 text-emerald-600", icon: "⚡", label: "Dasar"    },
  { color: "#1CB0F6", border: "#0288D1", bg: "from-sky-400 to-blue-500",        light: "bg-sky-50 border-sky-200 text-sky-600",             icon: "🌊", label: "Menengah" },
  { color: "#A560E8", border: "#7B1FA2", bg: "from-violet-400 to-purple-600",   light: "bg-violet-50 border-violet-200 text-violet-600",    icon: "🔥", label: "Mahir"    },
  { color: "#F59E0B", border: "#B45309", bg: "from-amber-400 to-orange-500",    light: "bg-amber-50 border-amber-200 text-amber-600",       icon: "👑", label: "Expert"   },
  { color: "#EC4899", border: "#BE185D", bg: "from-rose-400 to-pink-600",       light: "bg-rose-50 border-rose-200 text-rose-600",          icon: "💎", label: "Master"   },
];
const getLvl = (i) => LEVEL_STYLES[i % LEVEL_STYLES.length];

// ── SVG path & node positions generator ──────────────────────────────────────
const NODE_LEFT  = 120;
const NODE_RIGHT = 280;
const NODE_STEP  = 140;
const SVG_W      = 400;

function buildPath(count) {
  if (count === 0) return { path: "", nodes: [], svgH: 100 };

  const nodes = Array.from({ length: count }, (_, i) => ({
    x: i % 2 === 0 ? NODE_RIGHT : NODE_LEFT,
    y: 80 + i * NODE_STEP,
  }));

  const svgH = 80 + (count - 1) * NODE_STEP + 80;

  let d = `M${nodes[0].x},${nodes[0].y}`;
  for (let i = 1; i < nodes.length; i++) {
    const prev = nodes[i - 1];
    const curr = nodes[i];
    const midY = (prev.y + curr.y) / 2;
    d += ` C${prev.x},${midY} ${curr.x},${midY} ${curr.x},${curr.y}`;
  }

  return { path: d, nodes, svgH };
}

function getMascotOffset(activeIndex, total) {
  if (total <= 1) return "0%";
  return `${(activeIndex / (total - 1)) * 100}%`;
}

export default function QuizListPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [quizzes, setQuizzes]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [activeIdx, setActiveIdx]   = useState(0);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    else if (status === "authenticated") fetchQuizzes();
  }, [status, router]);

  const fetchQuizzes = async () => {
    try {
      const res = await fetch("/api/quizzes");
      if (res.ok) {
        const data = await res.json();
        setQuizzes(data);
        const firstIncomplete = data.findIndex(q => !q.results?.length);
        setActiveIdx(firstIncomplete === -1 ? data.length - 1 : firstIncomplete);
      } else toast.error("Gagal memuat quiz");
    } catch {
      toast.error("Gagal memuat quiz");
    } finally {
      setLoading(false);
    }
  };

  const { path, nodes, svgH } = useMemo(() => buildPath(quizzes.length), [quizzes.length]);

  if (loading || status === "loading") return <LoadingScreen />;
  if (status === "unauthenticated") return null;

  const selectedQuiz = quizzes.find(q => q.id === selectedId);

  return (
    <DashboardLayout>
      <style dangerouslySetInnerHTML={{ __html: `
        .cloud-bg {
          position: absolute;
          background: white;
          border-radius: 999px;
          opacity: 0.7;
          border: 3px solid #E2E8F0;
        }
        .duo-btn {
          border-bottom-width: 4px;
          transition: all 0.1s ease;
        }
        .duo-btn:hover  { transform: translateY(-2px); border-bottom-width: 6px; }
        .duo-btn:active { transform: translateY(4px);  border-bottom-width: 0px; }
      `}} />

      <div className="min-h-[calc(100vh-4rem)] bg-white relative w-full font-[family-name:var(--font-nunito)]">

        {/* Cloud decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="cloud-bg w-48 h-16 top-12 -left-12 shadow-sm animate-[bounce_4s_infinite]" />
          <div className="cloud-bg w-64 h-20 top-32 -right-16 shadow-sm animate-[bounce_5s_infinite]" />
          <div className="cloud-bg w-40 h-14 top-96 left-1/4 shadow-sm animate-[bounce_6s_infinite]" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 flex flex-col gap-10 relative z-10">

          {/* ── Hero Banner — Gamified ── */}
          <motion.section
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="overflow-hidden rounded-3xl bg-gradient-to-r from-[#6366F1] to-[#818CF8] p-8 sm:p-12 text-white shadow-xl border-4 border-b-8 border-[#4338CA] relative"
          >
            <div className="flex flex-col gap-5 relative z-10">
              <div className="inline-flex items-center gap-2 rounded-xl bg-white/20 backdrop-blur-sm px-4 py-2 text-sm font-black text-white border-2 border-white/30 shadow-sm w-fit uppercase tracking-wider">
                <SparkleIcon />
                Peta Pembelajaran
              </div>

              <div className="max-w-2xl flex items-center justify-between gap-6">
                <div>
                  <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4 drop-shadow-md leading-tight">
                    Jalur Kuis Kamu!
                  </h1>
                  <p className="text-lg sm:text-xl text-white/90 font-bold leading-relaxed max-w-xl">
                    Selesaikan petualangan belajar setapak demi setapak untuk menguji semua pemahaman bahasamu.
                  </p>
                </div>
                <div className="hidden sm:block">
                  <TrophyHeaderIcon />
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mt-2">
                {[
                  ["Kuis", `${quizzes.length} Level`],
                  ["Lulus", `${quizzes.filter(q => q.results?.length).length} Selesai`],
                  ["Desain", "Peta Jalan"],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-2xl border-4 border-[#4338CA] bg-white text-[#4338CA] px-5 py-3 shadow-[0_4px_0_#4338CA] transform hover:-translate-y-1 active:translate-y-1 active:shadow-none transition-all cursor-default">
                    <div className="text-xl font-black leading-none mb-1">{value}</div>
                    <div className="text-[10px] font-bold opacity-80 uppercase tracking-widest">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* ── Empty State ── */}
          {quizzes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-16 px-6 bg-white rounded-3xl border-4 border-b-8 border-gray-200 shadow-sm"
            >
              <EmptyBookIcon />
              <h2 className="text-2xl font-black text-gray-900 mb-2">
                Belum ada kuis tersedia
              </h2>
              <p className="text-sm font-bold text-gray-500 max-w-sm mx-auto">
                Kuis petualangan sedang dipersiapkan oleh tim guru bahasa Inggris. Pantau terus ya!
              </p>
            </motion.div>
          ) : (
            <>
              {/* ── Section Label ── */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-3 justify-center mb-4"
              >
                <div className="h-1 w-20 rounded-full bg-gradient-to-r from-[#6366F1] to-transparent" />
                <span className="text-[11px] font-black uppercase tracking-[0.25em] text-[#6366F1]">
                  PETA JALUR BELAJARMU
                </span>
                <div className="h-1 w-20 rounded-full bg-gradient-to-l from-[#6366F1] to-transparent" />
              </motion.div>

              {/* ── Map Display ── */}
              <div className="relative">
                <div className="absolute top-10 left-0 w-72 h-72 bg-indigo-100/30 rounded-full blur-3xl pointer-events-none -z-10" />
                <div className="absolute bottom-10 right-0 w-72 h-72 bg-yellow-100/20 rounded-full blur-3xl pointer-events-none -z-10" />

                <div className="flex justify-center">
                  <div className="relative" style={{ width: SVG_W, height: svgH }}>

                    {/* Bezier Path Road */}
                    <svg
                      className="absolute inset-0 w-full h-full pointer-events-none z-0"
                      viewBox={`0 0 ${SVG_W} ${svgH}`}
                      fill="none"
                    >
                      <defs>
                        <linearGradient id="pathGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%"   stopColor="#6366F1" />
                          <stop offset="33%"  stopColor="#10B981" />
                          <stop offset="66%"  stopColor="#1CB0F6" />
                          <stop offset="100%" stopColor="#A560E8" />
                        </linearGradient>
                      </defs>
                      <path d={path} stroke="#F1F5F9" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round" />
                      <motion.path
                        d={path}
                        stroke="url(#pathGrad)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray="18 26"
                        initial={{ strokeDashoffset: 200 }}
                        animate={{ strokeDashoffset: 0 }}
                        transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
                      />
                    </svg>

                    {/* Hopping Explorer Mascot */}
                    {path && (
                      <motion.div
                        style={{
                          offsetPath: `path('${path}')`,
                          offsetRotate: "0deg",
                          transformOrigin: "50% 100%",
                          position: "absolute",
                          top: 0,
                          left: 0,
                        }}
                        animate={{
                          offsetDistance: getMascotOffset(activeIdx, quizzes.length),
                          y: -14,
                        }}
                        transition={{ type: "spring", stiffness: 60, damping: 14 }}
                        className="pointer-events-none z-30 flex flex-col items-center"
                      >
                        <div className="w-48 h-48 flex items-center justify-center origin-bottom scale-[0.32] drop-shadow-lg">
                          <AIMascot mood="neutral" skin="explorer" />
                        </div>
                      </motion.div>
                    )}

                    {/* Step Map Buttons */}
                    {nodes.map((node, i) => {
                      const quiz       = quizzes[i];
                      const lvl        = getLvl(i);
                      const done       = quiz?.results?.length > 0;
                      const isActive   = i === activeIdx;
                      const isSelected = quiz?.id === selectedId;
                      const popLeft    = node.x >= SVG_W / 2;

                      return (
                        <div
                          key={quiz?.id ?? i}
                          style={{ left: node.x, top: node.y, zIndex: isSelected ? 40 : 10 }}
                          className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                        >
                          {isSelected && (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                              className="absolute w-20 h-20 border-2 border-dashed border-[#6366F1] rounded-full opacity-60"
                            />
                          )}

                          <button
                            onClick={() => {
                              setActiveIdx(i);
                              setSelectedId(isSelected ? null : quiz.id);
                            }}
                            style={{ backgroundColor: lvl.color, borderBottomColor: lvl.border }}
                            className="w-14 h-14 rounded-full border-2 border-b-[6px] border-white text-white font-black flex items-center justify-center cursor-pointer transition-all hover:scale-110 active:translate-y-1 active:border-b-2 shadow-lg relative"
                          >
                            {done ? (
                              <CheckCircleIcon />
                            ) : (
                              <span className="text-xl">{lvl.icon}</span>
                            )}
                            {isActive && !isSelected && !done && (
                              <span className="absolute -top-3.5 bg-yellow-400 text-yellow-950 text-[8px] font-black px-1.5 py-0.5 rounded border border-yellow-300 shadow uppercase tracking-wider animate-bounce">
                                GO
                              </span>
                            )}
                            <span className="absolute -bottom-5 text-[10px] font-black text-gray-400">
                              #{i + 1}
                            </span>
                          </button>

                          {/* Detail Popup Box */}
                          <AnimatePresence>
                            {isSelected && quiz && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.88, x: popLeft ? 12 : -12 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.88, x: popLeft ? 12 : -12 }}
                                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                                className={`absolute z-50 w-64 bg-white border-4 border-gray-200 rounded-3xl shadow-2xl top-1/2 -translate-y-1/2 ${
                                  popLeft ? "right-full mr-8" : "left-full ml-8"
                                }`}
                              >
                                {popLeft ? (
                                  <div className="absolute top-1/2 -translate-y-1/2 -right-3 w-4 h-4 bg-white border-t-4 border-r-4 border-gray-200 rotate-45" />
                                ) : (
                                  <div className="absolute top-1/2 -translate-y-1/2 -left-3 w-4 h-4 bg-white border-b-4 border-l-4 border-gray-200 rotate-45" />
                                )}

                                <div className={`h-2.5 w-full rounded-t-[20px] bg-gradient-to-r ${lvl.bg}`} />

                                <div className="p-5 flex flex-col gap-3">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase border-2 ${lvl.light}`}>
                                      {lvl.icon} {lvl.label}
                                    </span>
                                    {done && (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[10px] font-black uppercase bg-emerald-100 text-emerald-700 border-2 border-emerald-200">
                                        Lulus
                                      </span>
                                    )}
                                  </div>

                                  <h4 className="font-black text-gray-950 text-base leading-tight">{quiz.title}</h4>
                                  {quiz.description && (
                                    <p className="text-xs font-bold text-gray-500 leading-relaxed line-clamp-3">{quiz.description}</p>
                                  )}

                                  <div className="flex items-center gap-4 text-[10px] font-black uppercase text-gray-400 border-t border-gray-100 pt-2.5">
                                    <span className="flex items-center gap-1"><HelpIcon />{quiz._count.questions} Soal</span>
                                    <span className="flex items-center gap-1"><UsersIcon />{quiz._count.results} Peserta</span>
                                  </div>

                                  {done && (() => {
                                    const r   = quiz.results[0];
                                    const pct = Math.round((r.score / r.totalQuestions) * 100);
                                    return (
                                      <div className="rounded-2xl bg-emerald-50 border-2 border-emerald-200 px-3 py-2.5">
                                        <div className="flex justify-between mb-1.5">
                                          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">Skor Terbaik</span>
                                          <span className="text-sm font-black text-emerald-700">{pct}%</span>
                                        </div>
                                        <div className="h-1.5 w-full rounded-full bg-emerald-100 overflow-hidden">
                                          <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500" style={{ width: `${pct}%` }} />
                                        </div>
                                        <p className="text-[10px] text-emerald-500 font-bold mt-1">{r.score}/{r.totalQuestions} benar</p>
                                      </div>
                                    );
                                  })()}

                                  <button
                                    onClick={() => router.push(`/quiz/${quiz.id}`)}
                                    style={done ? {} : { backgroundColor: lvl.color, borderBottomColor: lvl.border }}
                                    className={`duo-btn w-full py-3 rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-sm border-2
                                      ${done
                                        ? "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                                        : "text-white"
                                      }`}
                                  >
                                    {done ? (
                                      <>
                                        <ZapIcon />
                                        Kerjakan Lagi
                                      </>
                                    ) : (
                                      <>
                                        <PlayIcon />
                                        Mulai Kuis
                                      </>
                                    )}
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="mt-10 text-center text-sm font-bold text-gray-400"
                >
                  💡 Klik tombol bundar di peta untuk melihat detail quiz!
                </motion.p>
              </div>
            </>
          )}

        </div>
      </div>
    </DashboardLayout>
  );
}
