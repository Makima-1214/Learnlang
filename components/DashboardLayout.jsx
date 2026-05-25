"use client";

import Link from "next/link";
import { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import UserAvatar from "@/components/UserAvatar";
import { Icon } from "@iconify/react";

const DashboardLayoutContext = createContext(false);

// ══════════════════════════════════════════════════
//  CUSTOM SVG ICONS — Kustom unik, bukan pasaran
// ══════════════════════════════════════════════════

const NavIconLearn = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke={active ? "#6366F1" : "#9CA3AF"} strokeWidth="2" strokeDasharray={active ? "0" : "3 2"} opacity={active ? 1 : 0.7} />
    <circle cx="12" cy="12" r="5" stroke={active ? "#10B981" : "#9CA3AF"} strokeWidth="1.5" opacity={active ? 0.8 : 0.35} />
    <path d="M15.18 8.82l-1.76 5.29-5.29 1.76 1.76-5.29 5.29-1.76z" fill={active ? "#6366F1" : "#9CA3AF"} stroke={active ? "#4F46E5" : "none"} strokeWidth="0.8" strokeLinejoin="round" opacity={active ? 1 : 0.6} />
    <circle cx="12" cy="12" r="1.5" fill={active ? "white" : "#9CA3AF"} opacity={active ? 1 : 0.8} />
  </svg>
);

const NavIconGame = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <rect x="2" y="7" width="20" height="12" rx="5" fill={active ? "rgba(245,158,11,0.12)" : "transparent"} stroke={active ? "#F59E0B" : "#9CA3AF"} strokeWidth="2" opacity={active ? 1 : 0.7} />
    <path d="M7 13h4M9 11v4" stroke={active ? "#F59E0B" : "#9CA3AF"} strokeWidth="2.2" strokeLinecap="round" />
    <circle cx="15" cy="11.5" r="1.1" fill={active ? "#F59E0B" : "#9CA3AF"} opacity={active ? 1 : 0.7} />
    <circle cx="17.5" cy="13" r="1.1" fill={active ? "#F59E0B" : "#9CA3AF"} opacity={active ? 1 : 0.7} />
    <circle cx="15" cy="14.5" r="1.1" fill={active ? "#F59E0B" : "#9CA3AF"} opacity={active ? 1 : 0.7} />
    <circle cx="12.5" cy="13" r="1.1" fill={active ? "#F59E0B" : "#9CA3AF"} opacity={active ? 1 : 0.7} />
  </svg>
);

const NavIconArticle = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <rect x="3" y="4" width="14" height="17" rx="2.5" fill={active ? "rgba(147,51,234,0.1)" : "transparent"} stroke={active ? "#9333EA" : "#9CA3AF"} strokeWidth="2" opacity={active ? 1 : 0.7} />
    <rect x="7" y="4" width="14" height="14" rx="2" fill={active ? "rgba(147,51,234,0.07)" : "transparent"} stroke={active ? "#9333EA" : "#9CA3AF"} strokeWidth="1.5" opacity={active ? 0.6 : 0.3} />
    <path d="M6 9h8M6 12h8M6 15h5" stroke={active ? "#9333EA" : "#9CA3AF"} strokeWidth="1.8" strokeLinecap="round" opacity={active ? 1 : 0.5} />
  </svg>
);

const NavIconDiscuss = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M20 9a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v3.5a4 4 0 0 0 4 4h1l1.5 2.5 1.5-2.5h4a4 4 0 0 0 4-4V9z" fill={active ? "rgba(28,176,246,0.1)" : "transparent"} stroke={active ? "#1CB0F6" : "#9CA3AF"} strokeWidth="2" strokeLinejoin="round" opacity={active ? 1 : 0.7} />
    <path d="M8 10.5h8M8 13h5" stroke={active ? "#1CB0F6" : "#9CA3AF"} strokeWidth="1.8" strokeLinecap="round" opacity={active ? 1 : 0.5} />
  </svg>
);

const NavIconChat = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke={active ? "#EC4899" : "#9CA3AF"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill={active ? "rgba(236,72,153,0.15)" : "transparent"} opacity={active ? 1 : 0.7} />
  </svg>
);

const NavIconFriends = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke={active ? "#14B8A6" : "#9CA3AF"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity={active ? 1 : 0.7} />
    <circle cx="9" cy="7" r="4" stroke={active ? "#14B8A6" : "#9CA3AF"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill={active ? "rgba(20,184,166,0.15)" : "transparent"} opacity={active ? 1 : 0.7} />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke={active ? "#14B8A6" : "#9CA3AF"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity={active ? 1 : 0.7} />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke={active ? "#14B8A6" : "#9CA3AF"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity={active ? 1 : 0.7} />
  </svg>
);

const NavIconProfile = ({ active }) => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="7.5" r="3.5" fill={active ? "rgba(16,185,129,0.12)" : "transparent"} stroke={active ? "#10B981" : "#9CA3AF"} strokeWidth="2" opacity={active ? 1 : 0.7} />
    <path d="M4 20c0-3.314 3.134-6 7-6h2c3.866 0 7 2.686 7 6" stroke={active ? "#10B981" : "#9CA3AF"} strokeWidth="2" strokeLinecap="round" opacity={active ? 1 : 0.7} />
    {active && <><circle cx="18.5" cy="7" r="3.5" fill="#10B981" /><path d="M17 7l1 1 2-2" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></>}
  </svg>
);

// Bell icon
const IconBell = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Status icons
const StatusFlame = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 3C12 3 6.5 9 6.5 13.5a5.5 5.5 0 0 0 11 0c0-2.8-1.8-5.5-1.8-5.5S14.5 10.5 12 10.5c0 0 1-3.5-1-7z" fill="url(#fg1)" stroke="#F97316" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    <defs><linearGradient id="fg1" x1="12" y1="3" x2="12" y2="19" gradientUnits="userSpaceOnUse"><stop stopColor="#FBBF24" /><stop offset="1" stopColor="#EF4444" /></linearGradient></defs>
  </svg>
);

const StatusBattery = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="1.5" y="7" width="17" height="10" rx="2.5" stroke="#1CB0F6" strokeWidth="2" fill="rgba(28,176,246,0.08)" />
    <rect x="20" y="10" width="2.5" height="4" rx="1.2" fill="#1CB0F6" opacity="0.5" />
    <rect x="3.5" y="9" width="11" height="6" rx="1.5" fill="#1CB0F6" opacity="0.85" />
  </svg>
);

// Liga / Trophy icon
const IconLeague = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M6 9H4.5A1.5 1.5 0 0 1 3 7.5V6a1.5 1.5 0 0 1 1.5-1.5h3" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
    <path d="M18 9h1.5A1.5 1.5 0 0 0 21 7.5V6a1.5 1.5 0 0 0-1.5-1.5h-3" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
    <path d="M8 3h8v8a4 4 0 0 1-8 0V3z" fill="rgba(245,158,11,0.15)" stroke="#F59E0B" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M12 15v3M9 18h6" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// Friends / People icon
const IconFriendAdd = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="9" cy="7" r="4" fill="rgba(99,102,241,0.12)" stroke="#6366F1" strokeWidth="2"/>
    <path d="M19 8v6M22 11h-6" stroke="#6366F1" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// Mission / Target icon
const IconMission = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" stroke="#10B981" strokeWidth="2" strokeDasharray="3 2" opacity="0.4"/>
    <circle cx="12" cy="12" r="5.5" stroke="#10B981" strokeWidth="2" opacity="0.7"/>
    <circle cx="12" cy="12" r="2.5" fill="#10B981"/>
    <path d="M12 3v2M12 19v2M3 12h2M19 12h2" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
  </svg>
);

// Clock / Timer icon for mission item
const IconClock = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9" fill="rgba(245,158,11,0.1)" stroke="#F59E0B" strokeWidth="2"/>
    <path d="M12 7v5l3 3" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// ══════════════════════════════════════════════════
//  NAV CONFIG PER SECTION
// ══════════════════════════════════════════════════
const MENU_UTAMA = [
  { href: "/learn",   label: "Belajar",   Icon: NavIconLearn,   accent: "#6366F1", bg: "#EEF2FF", border: "#6366F1", text: "#4338CA" },
  { href: "/quiz",    label: "Game Seru", Icon: NavIconGame,    accent: "#F59E0B", bg: "#FFFBEB", border: "#F59E0B", text: "#92400E" },
  { href: "/blogs",   label: "Artikel",   Icon: NavIconArticle, accent: "#9333EA", bg: "#F3E8FF", border: "#9333EA", text: "#6B21A8" },
];

const SOSIAL_KOMPETISI = [
  { href: "/diskusi",     label: "Diskusi",    Icon: NavIconDiscuss, accent: "#1CB0F6", bg: "#E0F2FE", border: "#1CB0F6", text: "#0369A1" },
  { href: "/chats",       label: "Chats AI",   Icon: NavIconChat,    accent: "#EC4899", bg: "#FDF2F8", border: "#EC4899", text: "#9D174D" },
  { href: "/friends",     label: "Cari Teman", Icon: NavIconFriends, accent: "#14B8A6", bg: "#F0FDFA", border: "#14B8A6", text: "#0F766E" },
];

const AKUN = [
  { href: "/profile", label: "Profil", Icon: NavIconProfile, accent: "#10B981", bg: "#ECFDF5", border: "#10B981", text: "#065F46" },
];

// Gabungan untuk Mobile Bottom Nav
const MOBILE_NAV = [
  MENU_UTAMA[0], // Belajar
  MENU_UTAMA[1], // Game Seru
  SOSIAL_KOMPETISI[0], // Diskusi
  SOSIAL_KOMPETISI[1], // Chats AI
  SOSIAL_KOMPETISI[2], // Cari Teman
  AKUN[0], // Profil
];

// Chevron toggle icon
const IconChevronLeft = ({ collapsed }) => (
  <svg
    width="16" height="16" viewBox="0 0 24 24" fill="none"
    style={{ transform: collapsed ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s" }}
  >
    <polyline points="15 18 9 12 15 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconChevronRight = ({ collapsed }) => (
  <svg
    width="16" height="16" viewBox="0 0 24 24" fill="none"
    style={{ transform: collapsed ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.3s" }}
  >
    <polyline points="9 18 15 12 9 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ══════════════════════════════════════════════════
//  KOMPONEN UTAMA
// ══════════════════════════════════════════════════
export default function DashboardLayout({ children }) {
  const isNested = useContext(DashboardLayoutContext);

  const pathname = usePathname();
  const { data: session } = useSession();

  // Collapse state untuk kedua sidebar
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  // State untuk data sidebar kanan
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const [missions, setMissions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUserRank, setCurrentUserRank] = useState(null);

  // Fetch data dari API
  useEffect(() => {
    if (isNested) return;

    const fetchData = async () => {
      if (!session?.id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [statsRes, leaderboardRes, suggestionsRes, missionsRes] = await Promise.all([
          fetch("/api/user/stats"),
          fetch("/api/leaderboard?limit=3"),
          fetch("/api/friends/suggestions?limit=1"),
          fetch("/api/daily-missions"),
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData.stats);
        }

        if (leaderboardRes.ok) {
          const leaderboardData = await leaderboardRes.json();
          setLeaderboard(leaderboardData.leaderboard);
          setCurrentUserRank(leaderboardData.currentUserRank);
        }

        if (suggestionsRes.ok) {
          const suggestionsData = await suggestionsRes.json();
          setSuggestions(suggestionsData.suggestions);
        }

        if (missionsRes.ok) {
          const missionsData = await missionsRes.json();
          setMissions(missionsData.missions);
        }
      } catch (error) {
        console.error("Error fetching sidebar data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session?.id, isNested]);

  // Early return AFTER all hooks
  if (isNested) return <>{children}</>;

  const isActive = (href) =>
    pathname === href || (href !== "/" && pathname?.startsWith(href + "/"));

  const renderNavItem = ({ href, label, Icon, accent, bg, border, text }, collapsed = false) => {
    const active = isActive(href);
    if (collapsed) {
      return (
        <Link key={href} href={href} title={label}
          className={`relative flex items-center justify-center w-10 h-10 mx-auto rounded-2xl border-2 transition-all duration-200
            ${active ? "border-b-4 shadow-sm" : "border-transparent text-gray-400 hover:bg-gray-50"}`}
          style={active ? { background: bg, borderColor: border } : {}}
        >
          <span className={`shrink-0 transition-transform duration-200 ${active ? "scale-110" : ""}`}>
            <Icon active={active} />
          </span>
          {active && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border-2 border-white" style={{ background: accent }} />}
        </Link>
      );
    }
    return (
      <Link key={href} href={href}
        className={`relative flex items-center gap-3 px-3.5 py-3 rounded-2xl font-black text-[14px] border-2 transition-all duration-200 group
          ${active ? "border-b-4 shadow-sm" : "border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-800"}`}
        style={active ? { background: bg, borderColor: border, color: text } : {}}
      >
        {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full" style={{ background: accent }} />}
        <span className={`shrink-0 transition-transform duration-200 ${active ? "scale-110" : "group-hover:scale-105"}`}>
          <Icon active={active} />
        </span>
        <span className="flex-1">{label}</span>
        {active && <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: accent }} />}
      </Link>
    );
  };

  return (
    <DashboardLayoutContext.Provider value={true}>
      <div className="min-h-screen bg-[#F0F4FF] font-[family-name:var(--font-nunito)]">
      
      {/* Hide Scrollbar Globally for sidebar */}
      <style dangerouslySetInnerHTML={{__html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />

      {/* ═══════════════════════════════════════════
          SIDEBAR KIRI — Fixed, collapsible 240px ↔ 72px
         ═══════════════════════════════════════════ */}
      <aside
        className="hidden md:flex flex-col fixed left-0 top-0 h-screen bg-white border-r-2 border-gray-100 z-40 shadow-[6px_0_32px_rgba(99,102,241,0.07)] transition-all duration-300"
        style={{ width: leftCollapsed ? 72 : 240 }}
      >
        {/* Toggle button */}
        <button
          onClick={() => setLeftCollapsed(c => !c)}
          className="absolute -right-4 top-6 z-10 bg-white border-2 border-gray-200 rounded-full w-8 h-8 flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
          title={leftCollapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
        >
          <IconChevronLeft collapsed={leftCollapsed} />
        </button>

        {/* Logo */}
        <div className={`px-4 pt-6 pb-4 border-b-2 border-gray-50 shrink-0 ${leftCollapsed ? "flex justify-center" : ""}`}>
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative shrink-0">
              <svg className="w-10 h-10 group-hover:scale-110 transition-transform duration-300 drop-shadow-md" viewBox="0 0 100 100" fill="none">
                <rect x="15" y="18" width="70" height="64" rx="18" fill="#6366F1" />
                <rect x="15" y="18" width="70" height="56" rx="18" fill="#818CF8" />
                <line x1="50" y1="18" x2="50" y2="5" stroke="#4338CA" strokeWidth="5" strokeLinecap="round" />
                <circle cx="50" cy="5" r="5" fill="#FBBF24" />
                <circle cx="8"  cy="48" r="8" fill="#4338CA" />
                <circle cx="92" cy="48" r="8" fill="#4338CA" />
                <rect x="24" y="32" width="52" height="24" rx="7" fill="#1E1B4B" />
                <ellipse cx="31" cy="50" rx="4" ry="2.5" fill="#FF8A80" opacity="0.9" />
                <ellipse cx="69" cy="50" rx="4" ry="2.5" fill="#FF8A80" opacity="0.9" />
                <circle cx="40" cy="44" r="5" fill="#10B981" />
                <circle cx="60" cy="44" r="5" fill="#10B981" />
                <circle cx="40" cy="44" r="2" fill="white" />
                <circle cx="60" cy="44" r="2" fill="white" />
              </svg>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white" />
            </div>
            {!leftCollapsed && (
              <div className="leading-none overflow-hidden">
                <span className="text-[19px] font-black text-gray-900 tracking-tight">Learn<span className="text-[#6366F1]">Lang</span></span>
                <span className="block text-[9px] font-bold text-gray-400 uppercase tracking-[0.14em] mt-0.5">Dashboard</span>
              </div>
            )}
          </Link>
        </div>

        {/* Profil Mini */}
        {session?.user && !leftCollapsed && (
          <div className="mx-4 mt-4 px-3 py-3 rounded-2xl bg-gradient-to-br from-[#EEF2FF] to-[#F5F3FF] border-2 border-[#E0E7FF] shrink-0">
            <div className="flex items-center gap-3">
              <UserAvatar
                src={session.user.avatar}
                name={session.user.name}
                className="w-9 h-9 shrink-0"
                size={30}
              />
              <div className="min-w-0 flex-1">
                <p className="font-black text-gray-800 text-sm truncate leading-tight">{session.user.name ?? "Pelajar"}</p>
                <p className="text-[10px] font-semibold text-gray-400 truncate">{session.user.email}</p>
              </div>
              <Link
                href="/notifications"
                className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:bg-white hover:text-[#6366F1] transition-all shadow-sm border border-transparent hover:border-gray-100"
                title="Notifikasi"
              >
                <IconBell size={18} />
              </Link>
            </div>
          </div>
        )}
        {session?.user && leftCollapsed && (
          <div className="flex flex-col items-center gap-3 mt-4 shrink-0 px-2">
            <UserAvatar
              src={session.user.avatar}
              name={session.user.name}
              className="w-9 h-9"
              size={30}
            />
            <Link
              href="/notifications"
              className="w-10 h-10 flex items-center justify-center rounded-2xl text-gray-400 hover:bg-indigo-50 hover:text-[#6366F1] transition-all border-2 border-transparent hover:border-indigo-100"
              title="Notifikasi"
            >
              <IconBell size={20} />
            </Link>
          </div>
        )}

        {/* Nav Links */}
        <div className={`flex-1 overflow-y-auto no-scrollbar flex flex-col gap-5 py-4 mt-2 ${leftCollapsed ? "px-2 items-center" : "px-3"}`}>
          
          {/* Menu Utama */}
          <div className={`flex flex-col gap-1 w-full ${leftCollapsed ? "items-center" : ""}`}>
            {!leftCollapsed && <span className="px-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-1">Menu Utama</span>}
            {MENU_UTAMA.map(item => renderNavItem(item, leftCollapsed))}
          </div>

          {/* Sosial & Kompetisi */}
          <div className={`flex flex-col gap-1 w-full ${leftCollapsed ? "items-center" : ""}`}>
            {!leftCollapsed && <span className="px-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-1">Sosial & Interaksi</span>}
            {SOSIAL_KOMPETISI.map(item => renderNavItem(item, leftCollapsed))}
          </div>

          {/* Akun */}
          <div className={`flex flex-col gap-1 w-full ${leftCollapsed ? "items-center" : ""}`}>
            {!leftCollapsed && <span className="px-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-1">Akun</span>}
            {AKUN.map(item => renderNavItem(item, leftCollapsed))}
          </div>

        </div>

      </aside>

      {/* ═══════════════════════════════════════════
          SIDEBAR KANAN — Fixed, collapsible 300px ↔ 72px
         ═══════════════════════════════════════════ */}
      <aside
        className="hidden xl:flex flex-col fixed right-0 top-0 h-screen bg-white border-l-2 border-gray-100 z-40 shadow-[-6px_0_32px_rgba(99,102,241,0.06)] transition-all duration-300"
        style={{ width: rightCollapsed ? 72 : 300 }}
      >
        {/* Toggle button */}
        <button
          onClick={() => setRightCollapsed(c => !c)}
          className="absolute -left-4 top-6 z-50 bg-white border-2 border-gray-200 rounded-full w-8 h-8 flex items-center justify-center shadow-sm hover:bg-gray-50 transition-colors"
          title={rightCollapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
        >
          <IconChevronRight collapsed={rightCollapsed} />
        </button>

        {/* Collapsed state — hanya ikon-ikon status */}
        {rightCollapsed ? (
          <div className="flex flex-col items-center gap-4 pt-20 px-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm border-2 border-b-4 border-orange-300" title="Streak">
              <StatusFlame size={20} />
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center shadow-sm border-2 border-b-4 border-sky-300" title="Energi">
              <StatusBattery size={20} />
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center border-2 border-b-4 border-amber-200" title="Liga">
              <IconLeague />
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center border-2 border-b-4 border-indigo-200" title="Teman">
              <IconFriendAdd />
            </div>
          </div>
        ) : (
          <>
            {/* Header kanan */}
            <div className="px-6 pt-7 pb-4 border-b-2 border-gray-50 shrink-0 flex items-center justify-between">
              <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.18em]">Pusat Info</h2>
              <span className="px-2.5 py-1 bg-[#EEF2FF] text-[#6366F1] font-black text-[9px] uppercase tracking-wider rounded-lg border-2 border-[#C7D2FE]">Pro</span>
            </div>

            <div className="flex flex-col gap-5 px-5 pt-5 overflow-y-auto no-scrollbar pb-10 flex-1">

              {/* Streak & Energi */}
              <div className="flex items-center justify-between p-4 bg-gradient-to-br from-[#F8F9FF] to-[#EEF2FF] rounded-2xl border-2 border-[#E0E7FF] shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-sm border-2 border-b-4 border-orange-300">
                    <StatusFlame size={20} />
                  </div>
                  <div>
                    <div className="text-xl font-black text-amber-500 leading-none">
                      {loading ? "..." : stats?.streak || 0}
                    </div>
                    <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Hari Streak</div>
                  </div>
                </div>
                <div className="w-px h-10 bg-gray-200" />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center shadow-sm border-2 border-b-4 border-sky-300">
                    <StatusBattery size={20} />
                  </div>
                  <div>
                    <div className="text-xl font-black text-[#1CB0F6] leading-none">
                      {loading ? "..." : `${stats?.energy?.current || 0}/${stats?.energy?.max || 5}`}
                    </div>
                    <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Energi</div>
                  </div>
                </div>
              </div>

              {/* Klasemen Mini / Liga */}
              <div className="bg-white border-2 border-b-[5px] border-gray-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-black text-gray-800 text-[13px] flex items-center gap-2">
                    <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-amber-50 border-2 border-amber-200">
                      <IconLeague />
                    </span>
                    Liga Perunggu
                  </h3>
                  <Link href="/leaderboard" className="text-[9px] font-black text-[#6366F1] uppercase tracking-wider cursor-pointer hover:underline">Detail</Link>
                </div>
                <div className="flex flex-col gap-2.5">
                  {loading ? (
                    <div className="text-center py-4 text-gray-400 text-xs">Memuat data...</div>
                  ) : leaderboard && leaderboard.length > 0 ? (
                    leaderboard.map((user, idx) => {
                      const isCurrentUser = session?.id === user.id;
                      return (
                        <div
                          key={user.id}
                          className={`flex items-center gap-3 ${
                            isCurrentUser ? "bg-indigo-50 p-2 -mx-2 rounded-xl border-2 border-indigo-100" : ""
                          }`}
                        >
                          <span className={`text-xs font-black ${
                            idx === 0 ? "text-amber-500" : idx === 1 ? "text-gray-400" : "text-gray-300"
                          } w-4 text-center`}>
                            {user.rank || idx + 1}
                          </span>
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs border ${
                            isCurrentUser
                              ? "bg-gradient-to-br from-indigo-500 to-purple-500 text-white border-indigo-600"
                              : "bg-gray-100 text-gray-600 border-gray-200"
                          }`}>
                            {user.name?.charAt(0).toUpperCase() || "?"}
                          </div>
                          <span className={`text-[12px] font-bold ${isCurrentUser ? "text-indigo-900 font-black" : "text-gray-700"} flex-1 truncate`}>
                            {isCurrentUser ? "Anda" : user.name}
                          </span>
                          <span className={`text-[11px] font-black ${isCurrentUser ? "text-indigo-600" : "text-gray-500"}`}>
                            {user.totalXP} XP
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-4 text-gray-400 text-xs">Tidak ada data</div>
                  )}
                </div>
              </div>

              {/* Cari Teman / Suggestion */}
              <div className="bg-white border-2 border-b-[5px] border-gray-200 rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-black text-gray-800 text-[13px] flex items-center gap-2">
                    <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-indigo-50 border-2 border-indigo-200">
                      <IconFriendAdd />
                    </span>
                    Tambah Teman
                  </h3>
                  <Link href="/friends" className="text-[9px] font-black text-[#6366F1] uppercase tracking-wider cursor-pointer hover:underline">Cari</Link>
                </div>
                {loading ? (
                  <div className="text-center py-4 text-gray-400 text-xs">Memuat...</div>
                ) : suggestions && suggestions.length > 0 ? (
                  suggestions.map((user) => (
                    <div key={user.id} className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center font-bold text-indigo-600 border-2 border-indigo-200 shrink-0">
                        {user.name?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-gray-800 text-[12px] truncate">{user.name}</p>
                        <p className="text-[10px] font-semibold text-gray-400 truncate">
                          {user.totalXP > 0 ? `${user.totalXP} XP` : "Pelajar baru"}
                        </p>
                      </div>
                      <button className="px-3 py-1.5 bg-[#EEF2FF] text-[#6366F1] border-2 border-[#C7D2FE] font-black text-[10px] rounded-lg hover:bg-[#E0E7FF] transition-colors shrink-0">
                        Ikuti
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-gray-400 text-xs">Tidak ada rekomendasi</div>
                )}
              </div>



            </div>
          </>
        )}
      </aside>

      {/* ═══════════════════════════════════════════
          MAIN CONTENT — margin ikut state collapse
         ═══════════════════════════════════════════ */}
      <div
        className="min-h-screen flex flex-col transition-all duration-300 md:ml-[var(--left-w)] xl:mr-[var(--right-w)]"
        style={{
          "--left-w": leftCollapsed ? "72px" : "240px",
          "--right-w": rightCollapsed ? "72px" : "300px",
        }}
      >

        {/* Mobile Top Bar */}
        <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white border-b-2 border-gray-100 shadow-sm">
          <Link href="/" className="flex items-center gap-2.5">
            <svg className="w-8 h-8" viewBox="0 0 100 100" fill="none">
              <rect x="15" y="18" width="70" height="56" rx="18" fill="#818CF8" />
              <rect x="24" y="32" width="52" height="24" rx="7" fill="#1E1B4B" />
              <circle cx="40" cy="44" r="5" fill="#10B981" /><circle cx="60" cy="44" r="5" fill="#10B981" />
              <circle cx="40" cy="44" r="2" fill="white" /><circle cx="60" cy="44" r="2" fill="white" />
            </svg>
            <span className="text-[18px] font-black text-gray-900 tracking-tight">Learn<span className="text-[#6366F1]">Lang</span></span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/notifications" className="p-2 text-gray-400 hover:text-[#6366F1] transition-colors">
              <IconBell size={22} />
            </Link>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 border-2 border-amber-200 rounded-xl">
              <StatusFlame size={16} />
              <span className="text-xs font-black text-amber-500">12</span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-sky-50 border-2 border-sky-200 rounded-xl">
              <StatusBattery size={16} />
              <span className="text-xs font-black text-sky-500">5</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </div>

      {/* ═══════════════════════════════════════════
          MOBILE BOTTOM NAV
         ═══════════════════════════════════════════ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-gray-100 shadow-[0_-4px_24px_rgba(99,102,241,0.10)] pb-safe">
        <div className="flex justify-between items-center px-2 py-1.5 overflow-x-auto no-scrollbar">
          {MOBILE_NAV.map(({ href, label, Icon, accent, bg }) => {
            const active = isActive(href);
            return (
              <Link key={href} href={href}
                className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-2xl transition-all duration-150 min-w-[52px]"
                style={active ? { color: accent } : { color: "#9CA3AF" }}
              >
                <div className={`relative p-1.5 rounded-xl transition-all ${active ? "scale-110" : ""}`}
                  style={active ? { background: bg } : {}}>
                  <Icon active={active} />
                  {active && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full border-2 border-white animate-pulse" style={{ background: accent }} />}
                </div>
                <span className={`text-[8px] font-black uppercase tracking-wider ${active ? "opacity-100" : "opacity-60"}`}>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

    </div>
  </DashboardLayoutContext.Provider>
  );
}
