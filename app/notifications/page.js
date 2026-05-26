"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import * as LucideIcons from "lucide-react";

// ── Icons ─────────────────────────────────────────────────────────────────────

const BellIcon = ({ size = 8 }) => (
  <svg className={`w-${size} h-${size}`} viewBox="0 0 24 24" fill="none">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const UnreadIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="18" cy="5" r="4" fill="#FCD34D" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const AllBellIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ReadIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CheckAllIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
    <path d="M2 12l5 5L17 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M9 12l5 5L22 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronRight = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
    <polyline points="9 18 15 12 9 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Dynamic icon renderer from API data
const NotificationIcon = ({ iconName }) => {
  const Icon = LucideIcons[iconName] || LucideIcons.Bell;
  return <Icon className="w-5 h-5" />;
};

// ── Type config for styling ───────────────────────────────────────────────────

const getTypeConfig = (type) => {
  const configs = {
    achievement: { bg: "bg-amber-100",   text: "text-amber-600",   activeBorder: "border-amber-300",   label: "Pencapaian" },
    friend:      { bg: "bg-indigo-100",  text: "text-indigo-600",  activeBorder: "border-indigo-300",  label: "Teman"      },
    quiz:        { bg: "bg-emerald-100", text: "text-emerald-600", activeBorder: "border-emerald-300", label: "Quiz"       },
    blog:        { bg: "bg-purple-100",  text: "text-purple-600",  activeBorder: "border-purple-300",  label: "Artikel"    },
    system:      { bg: "bg-sky-100",     text: "text-sky-600",     activeBorder: "border-sky-300",     label: "Sistem"     },
  };
  return configs[type] || { bg: "bg-gray-100", text: "text-gray-600", activeBorder: "border-gray-300", label: "Info" };
};

// ── Page ──────────────────────────────────────────────────────────────────────

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setNotifications(data.data.notifications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markAllRead = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    });
    load();
  };

  const markRead = async (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    await fetch(`/api/notifications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isRead: true }),
    }).catch(() => {});
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const readCount   = notifications.filter((n) =>  n.isRead).length;
  const totalCount  = notifications.length;

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.isRead;
    if (filter === "read")   return  n.isRead;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50 font-[family-name:var(--font-nunito)]">
      <style dangerouslySetInnerHTML={{ __html: `
        .notif-card { transition: all 0.2s ease; }
        .notif-card:hover { transform: translateY(-3px); }
      `}} />

      <main className="max-w-5xl mx-auto px-6 py-10">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-10"
        >
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Notifikasi</h1>
            <p className="text-gray-500 font-bold mt-1">
              {loading
                ? "Memuat notifikasi..."
                : unreadCount > 0
                  ? `${unreadCount} notifikasi belum dibaca`
                  : "Semua notifikasi sudah dibaca ✓"}
            </p>
          </div>

          {unreadCount > 0 && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={markAllRead}
              disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white border-4 border-b-8 border-gray-200 text-sm font-black text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors disabled:opacity-50"
            >
              <CheckAllIcon />
              Tandai semua dibaca
            </motion.button>
          )}
        </motion.div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          {[
            {
              icon: <AllBellIcon />,
              label: "Total Notifikasi",
              value: totalCount,
              color: "from-indigo-500 to-indigo-600",
              border: "border-indigo-700",
            },
            {
              icon: <UnreadIcon />,
              label: "Belum Dibaca",
              value: unreadCount,
              color: "from-amber-500 to-amber-600",
              border: "border-amber-700",
            },
            {
              icon: <ReadIcon />,
              label: "Sudah Dibaca",
              value: readCount,
              color: "from-emerald-500 to-emerald-600",
              border: "border-emerald-700",
            },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`bg-white rounded-3xl border-4 border-b-8 ${stat.border} p-6 shadow-sm hover:-translate-y-1 transition-transform duration-200`}
            >
              <div className={`bg-gradient-to-br ${stat.color} p-3 rounded-2xl w-fit mb-4 shadow-md`}>
                {stat.icon}
              </div>
              <div className="text-4xl font-black text-gray-900 mb-1">
                {loading ? "..." : stat.value}
              </div>
              <div className="text-sm font-bold text-gray-500">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* ── Filter Tabs ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex flex-wrap gap-2 mb-6"
        >
          {[
            { key: "all",    label: "Semua",        count: totalCount,  activeClass: "bg-indigo-500 text-white border-indigo-700"   },
            { key: "unread", label: "Belum Dibaca",  count: unreadCount, activeClass: "bg-amber-500 text-white border-amber-700"    },
            { key: "read",   label: "Sudah Dibaca",  count: readCount,   activeClass: "bg-emerald-500 text-white border-emerald-700" },
          ].map(({ key, label, count, activeClass }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-sm border-b-4 transition-all ${
                filter === key
                  ? `${activeClass} shadow-sm`
                  : "bg-white text-gray-500 border-gray-200 hover:bg-gray-100"
              }`}
            >
              {label}
              <span className={`px-2 py-0.5 rounded-xl text-[10px] font-black ${
                filter === key ? "bg-white/25 text-white" : "bg-gray-100 text-gray-500"
              }`}>
                {count}
              </span>
            </button>
          ))}
        </motion.div>

        {/* ── Notification List ── */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-3xl border-4 border-b-8 border-gray-200 p-16 text-center"
              >
                <div className="text-xl font-black text-indigo-500 animate-pulse">Memuat Notifikasi...</div>
              </motion.div>
            ) : filtered.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white rounded-3xl border-4 border-b-8 border-gray-200 p-16 text-center"
              >
                <div className="text-5xl mb-4">🔔</div>
                <div className="font-black text-gray-400 text-lg">Tidak ada notifikasi</div>
                <div className="font-bold text-gray-300 text-sm mt-1">Semua sudah beres!</div>
              </motion.div>
            ) : (
              filtered.map((notif, i) => {
                const cfg = getTypeConfig(notif.type);
                return (
                  <motion.div
                    key={notif.id}
                    layout
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => {
                      markRead(notif.id);
                      if (notif.link) router.push(notif.link);
                    }}
                    className={`notif-card relative flex items-start gap-4 bg-white rounded-3xl border-4 border-b-8 p-5 cursor-pointer shadow-sm ${
                      notif.isRead
                        ? "border-gray-200 opacity-60"
                        : cfg.activeBorder
                    }`}
                  >
                    {/* Unread pulse dot */}
                    {!notif.isRead && (
                      <span className="absolute top-5 right-5 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-60" />
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500" />
                      </span>
                    )}

                    {/* Icon badge */}
                    <div className={`${cfg.bg} ${cfg.text} p-3 rounded-2xl flex-shrink-0 shadow-sm`}>
                      <NotificationIcon iconName={notif.icon || "Bell"} />
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1 pr-6">
                      <span className={`inline-block text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg mb-1.5 ${cfg.bg} ${cfg.text}`}>
                        {cfg.label}
                      </span>
                      <div className={`font-black text-base leading-snug mb-1 ${notif.isRead ? "text-gray-400" : "text-gray-900"}`}>
                        {notif.title}
                      </div>
                      {notif.description && (
                        <div className="text-sm font-bold text-gray-400 leading-relaxed">
                          {notif.description}
                        </div>
                      )}
                      <div className="text-[11px] font-black text-gray-300 mt-2.5">
                        {new Date(notif.createdAt).toLocaleString("id-ID", {
                          day: "numeric", month: "short", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })}
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className={`flex-shrink-0 self-center ${notif.isRead ? "text-gray-200" : "text-gray-400"}`}>
                      <ChevronRight />
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>

      </main>
    </div>
  );
}
