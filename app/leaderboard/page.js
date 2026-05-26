"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import UserAvatar from "@/components/UserAvatar";
import { motion, AnimatePresence } from "framer-motion";

// ── Custom SVG Icons ──────────────────────────────────────────────────────────

const IconCrown = ({ size = 24, color = "#F59E0B" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M3 18h18M5 18l2-9 5 4 5-7 2 9"
      stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"
    />
    <circle cx="5"  cy="9"  r="1.5" fill={color} />
    <circle cx="12" cy="5"  r="1.5" fill="#EF4444" />
    <circle cx="19" cy="9"  r="1.5" fill={color} />
  </svg>
);

const IconStar = ({ size = 16, color = "#F59E0B" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M12 2l2.9 6.1L22 9.3l-5 4.9 1.2 6.8L12 17.8l-6.2 3.2L7 14.2 2 9.3l7.1-1.2L12 2z"
      fill={color} stroke={color} strokeWidth="1.5" strokeLinejoin="round"
    />
  </svg>
);

const IconTrophy = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M6 9H4.5A1.5 1.5 0 0 1 3 7.5V6a1.5 1.5 0 0 1 1.5-1.5h3"
      stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
    <path d="M18 9h1.5A1.5 1.5 0 0 0 21 7.5V6a1.5 1.5 0 0 0-1.5-1.5h-3"
      stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
    <path d="M8 3h8v8a4 4 0 0 1-8 0V3z"
      fill="rgba(245,158,11,0.15)" stroke="#F59E0B" strokeWidth="2" strokeLinejoin="round" />
    <path d="M12 15v3M9 18h6" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const IconMedal = ({ rank }) => {
  const configs = {
    1: { outer: "#F59E0B", inner: "#FDE68A", shine: "#FFFBEB", label: "#92400E" },
    2: { outer: "#94A3B8", inner: "#CBD5E1", shine: "#F8FAFC", label: "#334155" },
    3: { outer: "#CD7C3A", inner: "#FDBA74", shine: "#FFF7ED", label: "#7C2D12" },
  };
  const c = configs[rank];
  if (!c) return null;
  return (
    <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
      <circle cx="18" cy="18" r="16" fill={c.outer} />
      <circle cx="18" cy="18" r="12" fill={c.inner} />
      <circle cx="14" cy="14" r="4" fill={c.shine} opacity="0.5" />
      <text x="18" y="23" textAnchor="middle" fontSize="13" fontWeight="900" fill={c.label}>
        {rank}
      </text>
    </svg>
  );
};

const IconFlame = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path
      d="M12 3C12 3 6.5 9 6.5 13.5a5.5 5.5 0 0 0 11 0c0-2.8-1.8-5.5-1.8-5.5S14.5 10.5 12 10.5c0 0 1-3.5-1-7z"
      fill="url(#flameGrad)" stroke="#F97316" strokeWidth="1.2" strokeLinecap="round"
    />
    <defs>
      <linearGradient id="flameGrad" x1="12" y1="3" x2="12" y2="19" gradientUnits="userSpaceOnUse">
        <stop stopColor="#FBBF24" />
        <stop offset="1" stopColor="#EF4444" />
      </linearGradient>
    </defs>
  </svg>
);

const IconBolt = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M13 2L4.5 13.5H11L10 22L20.5 10H14L13 2Z"
      fill="#6366F1" stroke="#4338CA" strokeWidth="1.5" strokeLinejoin="round" />
  </svg>
);

const IconSearch = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="11" cy="11" r="7" stroke="#9CA3AF" strokeWidth="2.2" />
    <path d="M16.5 16.5L21 21" stroke="#9CA3AF" strokeWidth="2.2" strokeLinecap="round" />
  </svg>
);

const IconShield = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 2L4 6v5c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V6L12 2z"
      fill="rgba(99,102,241,0.15)" stroke="#6366F1" strokeWidth="2" strokeLinejoin="round" />
    <path d="M9 12l2 2 4-4" stroke="#6366F1" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ── League tier config ────────────────────────────────────────────────────────

const LEAGUES = [
  { id: "all",      label: "Semua",    minXP: 0,    color: "#6366F1", bg: "#EEF2FF" },
  { id: "bronze",   label: "Perunggu", minXP: 0,    color: "#CD7C3A", bg: "#FFF7ED" },
  { id: "silver",   label: "Perak",    minXP: 100,  color: "#94A3B8", bg: "#F8FAFC" },
  { id: "gold",     label: "Emas",     minXP: 300,  color: "#F59E0B", bg: "#FFFBEB" },
  { id: "platinum", label: "Platinum", minXP: 700,  color: "#38BDF8", bg: "#F0F9FF" },
  { id: "diamond",  label: "Diamond",  minXP: 1500, color: "#A78BFA", bg: "#F5F3FF" },
];

function getLeague(xp) {
  if (xp >= 1500) return LEAGUES[5];
  if (xp >= 700)  return LEAGUES[4];
  if (xp >= 300)  return LEAGUES[3];
  if (xp >= 100)  return LEAGUES[2];
  return LEAGUES[1];
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LeaderboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUserRank, setCurrentUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeLeague, setActiveLeague] = useState("all");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/leaderboard?limit=50")
      .then((r) => r.json())
      .then((data) => {
        if (data.data) {
          setLeaderboard(data.data.leaderboard ?? []);
          setCurrentUserRank(data.data.currentUserRank ?? null);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [status]);

  // Filter
  const filtered = leaderboard.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase());
    if (activeLeague === "all") return matchSearch;
    const league = getLeague(u.totalXP);
    return matchSearch && league.id === activeLeague;
  });

  const top3 = filtered.slice(0, 3);
  const rest  = filtered.slice(3);

  if (status === "loading" || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            >
              <IconCrown size={40} />
            </motion.div>
            <p className="font-black text-gray-400 text-sm animate-pulse">Memuat papan peringkat...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <style dangerouslySetInnerHTML={{ __html: `
        .duo-card { border-bottom-width: 6px; transition: all 0.2s; }
        .duo-card:hover { transform: translateY(-2px); }
        .league-btn { border-bottom-width: 3px; transition: all 0.1s; }
        .league-btn:active { transform: translateY(2px); border-bottom-width: 0; }
      `}} />

      <div className="min-h-screen bg-[#F0F4FF] font-[family-name:var(--font-nunito)] pb-16">

        {/* ── Hero Header ── */}
        <div className="bg-gradient-to-br from-indigo-600 via-indigo-500 to-violet-500 px-6 pt-10 pb-20 relative overflow-hidden">
          {/* Decorative orbs */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-2xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-400/20 rounded-full -ml-16 blur-2xl" />

          <div className="max-w-3xl mx-auto relative z-10 text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex justify-center mb-4"
            >
              <div className="bg-white/15 backdrop-blur-sm border-2 border-white/30 p-4 rounded-3xl">
                <IconCrown size={40} color="white" />
              </div>
            </motion.div>
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-4xl font-black text-white mb-2 tracking-tight"
            >
              Papan Peringkat
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-indigo-100 font-bold text-sm"
            >
              Kumpulkan XP dari pencapaian dan raih puncak liga!
            </motion.p>

            {/* Current user rank pill */}
            {currentUserRank && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center gap-3 mt-5 bg-white/15 backdrop-blur-sm border-2 border-white/30 px-5 py-2.5 rounded-2xl"
              >
                <IconShield size={18} />
                <span className="text-white font-black text-sm">
                  Peringkat kamu: #{currentUserRank.rank}
                </span>
                <span className="text-indigo-200 font-bold text-xs">
                  {currentUserRank.totalXP} XP
                </span>
              </motion.div>
            )}
          </div>
        </div>

        {/* ── Content pulled up over hero ── */}
        <div className="max-w-3xl mx-auto px-4 -mt-12 relative z-10 space-y-5">

          {/* Search + League filter card */}
          <div className="bg-white rounded-3xl border-4 border-b-8 border-gray-200 p-5 shadow-sm space-y-4">
            {/* Search */}
            <div className="flex items-center gap-3 bg-gray-50 border-2 border-gray-200 rounded-2xl px-4 py-2.5">
              <IconSearch size={18} />
              <input
                type="text"
                placeholder="Cari pemain..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent font-bold text-sm text-gray-700 placeholder-gray-400 outline-none"
              />
            </div>

            {/* League tabs */}
            <div className="flex gap-2 flex-wrap">
              {LEAGUES.map((lg) => (
                <button
                  key={lg.id}
                  onClick={() => setActiveLeague(lg.id)}
                  className="league-btn px-3 py-1.5 rounded-xl font-black text-xs border-2 transition-all"
                  style={
                    activeLeague === lg.id
                      ? { background: lg.bg, borderColor: lg.color, color: lg.color, borderBottomColor: lg.color }
                      : { background: "white", borderColor: "#E5E7EB", color: "#9CA3AF" }
                  }
                >
                  {lg.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Top 3 Podium ── */}
          {top3.length >= 3 && search === "" && activeLeague === "all" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl border-4 border-b-8 border-gray-200 p-6 shadow-sm"
            >
              <div className="flex items-end justify-center gap-3">
                {/* 2nd place */}
                <PodiumCard user={top3[1]} position={2} delay={0.1} session={session} />
                {/* 1st place */}
                <PodiumCard user={top3[0]} position={1} delay={0} session={session} />
                {/* 3rd place */}
                <PodiumCard user={top3[2]} position={3} delay={0.2} session={session} />
              </div>
            </motion.div>
          )}

          {/* ── Full list ── */}
          <div className="bg-white rounded-3xl border-4 border-b-8 border-gray-200 overflow-hidden shadow-sm">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b-2 border-gray-100">
              <div className="flex items-center gap-2">
                <IconTrophy size={18} />
                <span className="font-black text-gray-800 text-sm">
                  {filtered.length} Pemain
                </span>
              </div>
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                Diurutkan berdasarkan XP
              </span>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <IconCrown size={40} color="#E5E7EB" />
                <p className="font-black mt-3 text-sm">Tidak ada pemain ditemukan</p>
              </div>
            ) : (
              <div className="divide-y-2 divide-gray-50">
                <AnimatePresence>
                  {filtered.map((user, idx) => {
                    const isMe = session?.user?.id === user.id;
                    const league = getLeague(user.totalXP);
                    return (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className={`flex items-center gap-4 px-5 py-3.5 transition-colors ${
                          isMe ? "bg-indigo-50" : "hover:bg-gray-50"
                        }`}
                      >
                        {/* Rank */}
                        <div className="w-9 flex justify-center shrink-0">
                          {user.rank <= 3 ? (
                            <IconMedal rank={user.rank} />
                          ) : (
                            <span className={`text-sm font-black ${isMe ? "text-indigo-600" : "text-gray-400"}`}>
                              #{user.rank}
                            </span>
                          )}
                        </div>

                        {/* Avatar */}
                        <UserAvatar
                          src={user.avatar}
                          name={user.name}
                          className="w-10 h-10 shrink-0"
                          size={32}
                          showInitial
                        />

                        {/* Name + league */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`font-black text-sm truncate ${isMe ? "text-indigo-800" : "text-gray-800"}`}>
                              {isMe ? `${user.name} (Kamu)` : user.name}
                            </span>
                            {isMe && (
                              <span className="shrink-0 px-1.5 py-0.5 bg-indigo-100 text-indigo-600 text-[9px] font-black rounded-lg border border-indigo-200">
                                KAMU
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span
                              className="text-[9px] font-black px-2 py-0.5 rounded-full border"
                              style={{ background: league.bg, color: league.color, borderColor: league.color + "40" }}
                            >
                              {league.label}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400">
                              {user.achievementCount} pencapaian
                            </span>
                          </div>
                        </div>

                        {/* XP */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <IconBolt size={14} />
                          <span className={`font-black text-sm ${isMe ? "text-indigo-600" : "text-gray-700"}`}>
                            {user.totalXP.toLocaleString()}
                          </span>
                          <span className="text-[10px] font-bold text-gray-400">XP</span>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* ── League info card ── */}
          <div className="bg-white rounded-3xl border-4 border-b-8 border-gray-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <IconFlame size={18} />
              <span className="font-black text-gray-800 text-sm">Sistem Liga</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {LEAGUES.slice(1).map((lg) => (
                <div
                  key={lg.id}
                  className="flex items-center gap-2.5 p-3 rounded-2xl border-2"
                  style={{ background: lg.bg, borderColor: lg.color + "40" }}
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center border-2 border-b-4 shrink-0"
                    style={{ background: lg.color + "20", borderColor: lg.color }}
                  >
                    <IconStar size={14} color={lg.color} />
                  </div>
                  <div>
                    <div className="font-black text-xs" style={{ color: lg.color }}>{lg.label}</div>
                    <div className="text-[9px] font-bold text-gray-400">{lg.minXP}+ XP</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}

// ── Podium Card sub-component ─────────────────────────────────────────────────

function PodiumCard({ user, position, delay, session }) {
  const isMe = session?.user?.id === user.id;
  const heights = { 1: "h-28", 2: "h-20", 3: "h-16" };
  const sizes   = { 1: "w-16 h-16", 2: "w-12 h-12", 3: "w-12 h-12" };
  const podiumColors = {
    1: { bg: "#FEF3C7", border: "#F59E0B", text: "#92400E" },
    2: { bg: "#F1F5F9", border: "#94A3B8", text: "#334155" },
    3: { bg: "#FFF7ED", border: "#CD7C3A", text: "#7C2D12" },
  };
  const c = podiumColors[position];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="flex flex-col items-center gap-2 flex-1"
    >
      {/* Crown for #1 */}
      {position === 1 && (
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <IconCrown size={28} color="#F59E0B" />
        </motion.div>
      )}

      {/* Avatar */}
      <div className={`relative ${position === 1 ? "ring-4 ring-amber-400 ring-offset-2" : ""} rounded-full`}>
        <UserAvatar
          src={user.avatar}
          name={user.name}
          className={`${sizes[position]} shrink-0`}
          size={position === 1 ? 48 : 36}
          showInitial
        />
        {isMe && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 rounded-full border-2 border-white" />
        )}
      </div>

      {/* Name */}
      <div className="text-center">
        <p className="font-black text-gray-800 text-xs truncate max-w-[80px]">
          {isMe ? "Kamu" : user.name}
        </p>
        <div className="flex items-center justify-center gap-1 mt-0.5">
          <IconBolt size={11} />
          <span className="text-[10px] font-black text-indigo-600">{user.totalXP} XP</span>
        </div>
      </div>

      {/* Podium block */}
      <div
        className={`w-full ${heights[position]} rounded-t-2xl border-2 border-b-0 flex items-center justify-center`}
        style={{ background: c.bg, borderColor: c.border }}
      >
        <IconMedal rank={position} />
      </div>
    </motion.div>
  );
}
