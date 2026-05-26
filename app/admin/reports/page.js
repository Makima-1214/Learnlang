"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  AreaChart,
  ResponsiveContainer,
} from "recharts";

// ── Custom Icons ──────────────────────────────────────────────────────────────

const UsersIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
    <circle cx="9" cy="7" r="3.5" fill="white" />
    <path d="M2 20c0-3.5 3-6 7-6s7 2.5 7 6" stroke="white" strokeWidth="2.2" strokeLinecap="round" fill="none" />
    <circle cx="18" cy="8" r="2.5" fill="white" opacity="0.6" />
    <path d="M22 20c0-2.5-1.5-4.5-4-4.5" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />
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

const AwardIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="9" r="6" fill="white" opacity="0.3" stroke="white" strokeWidth="2" />
    <path d="M8.21 13.89L7 23l5-3 5 3-1.21-9.12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="9" r="3" fill="white" opacity="0.7" />
  </svg>
);

const ActivityIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PerformanceIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
    <path d="M3 17L9 11L13 15L21 7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M21 7v5M21 7h-5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const PeopleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
    <circle cx="9" cy="7" r="3.5" fill="currentColor" />
    <path d="M2 20c0-3.5 3-6 7-6s7 2.5 7 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none" />
    <circle cx="18" cy="8" r="2.5" fill="currentColor" opacity="0.5" />
    <path d="M22 20c0-2.5-1.5-4.5-4-4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.5" />
  </svg>
);

const PieIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M22 12A10 10 0 0 0 12 2v10z" fill="currentColor" opacity="0.4" stroke="currentColor" strokeWidth="2" />
  </svg>
);

// ── Color Palettes ────────────────────────────────────────────────────────────

const CHART_COLORS = [
  "#6366F1", "#10B981", "#F59E0B", "#3B82F6", "#EC4899",
];

const STATUS_COLORS = {
  BENAR: "#10B981",
  HAMPIR_BENAR: "#F59E0B",
  SALAH: "#EF4444",
};

// ── Custom Tooltip ────────────────────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border-2 border-gray-100 rounded-2xl px-4 py-3 shadow-xl font-[family-name:var(--font-nunito)]">
      {label && <p className="text-xs font-black text-gray-400 mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="text-sm font-black" style={{ color: p.color || p.fill || "#6366F1" }}>
          {p.name}: <span className="text-gray-900">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

// ── Tab Config ────────────────────────────────────────────────────────────────

const TABS = [
  { key: "activity",     label: "Aktivitas",   Icon: ActivityIcon,    color: "indigo"  },
  { key: "performance",  label: "Performa",    Icon: PerformanceIcon, color: "emerald" },
  { key: "users",        label: "Pengguna",    Icon: PeopleIcon,      color: "violet"  },
  { key: "distribution", label: "Distribusi",  Icon: PieIcon,         color: "amber"   },
];

const TAB_COLORS = {
  indigo:  { active: "bg-indigo-500 text-white border-indigo-700",  hover: "hover:bg-indigo-50 hover:text-indigo-600" },
  emerald: { active: "bg-emerald-500 text-white border-emerald-700",hover: "hover:bg-emerald-50 hover:text-emerald-600" },
  violet:  { active: "bg-violet-500 text-white border-violet-700",  hover: "hover:bg-violet-50 hover:text-violet-600" },
  amber:   { active: "bg-amber-500 text-white border-amber-700",    hover: "hover:bg-amber-50 hover:text-amber-600" },
};

// ── Chart Card Wrapper ────────────────────────────────────────────────────────

function ChartCard({ title, description, children, delay = 0, borderColor = "border-gray-200" }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`bg-white rounded-3xl border-4 border-b-8 ${borderColor} p-6 shadow-sm`}
    >
      <h3 className="text-lg font-black text-gray-900">{title}</h3>
      {description && <p className="text-sm font-bold text-gray-400 mb-5 mt-0.5">{description}</p>}
      {children}
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("activity");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (session?.user?.role !== "ADMIN" && status === "authenticated") router.push("/learn");
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user?.role === "ADMIN") {
      fetch("/api/admin/reports")
        .then((r) => r.json())
        .then(setData)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [session]);

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-xl font-black text-indigo-500 animate-pulse">Memuat Laporan...</div>
      </div>
    );
  }

  if (!session || session.user.role !== "ADMIN") return null;

  return (
    <div className="min-h-screen bg-gray-50 font-[family-name:var(--font-nunito)]">
      <main className="max-w-6xl mx-auto px-6 py-10">

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            Laporan & Statistik
          </h1>
          <p className="text-gray-500 font-bold mt-1">
            Analisis lengkap aktivitas pengguna dan pembelajaran
          </p>
        </motion.div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            {
              icon: <UsersIcon />,
              label: "Total Pengguna",
              value: data?.overall?.totalUsers ?? 0,
              color: "from-indigo-500 to-indigo-600",
              border: "border-indigo-700",
            },
            {
              icon: <BookIcon />,
              label: "Total Latihan",
              value: data?.overall?.totalExercises ?? 0,
              color: "from-emerald-500 to-emerald-600",
              border: "border-emerald-700",
            },
            {
              icon: <AwardIcon />,
              label: "Rata-rata Skor",
              value: data?.overall?.avgScore ?? 0,
              color: "from-amber-500 to-amber-600",
              border: "border-amber-700",
            },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`bg-white rounded-3xl border-4 border-b-8 ${stat.border} p-6 shadow-sm hover:-translate-y-1 transition-transform duration-200`}
            >
              <div className={`bg-gradient-to-br ${stat.color} p-3 rounded-2xl w-fit mb-4 shadow-md`}>
                {stat.icon}
              </div>
              <div className="text-4xl font-black text-gray-900 mb-1">
                {Number(stat.value).toLocaleString()}
              </div>
              <div className="text-sm font-bold text-gray-500">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* ── Tabs ── */}
        <div className="flex flex-wrap gap-2 mb-8">
          {TABS.map(({ key, label, Icon, color }) => {
            const active = activeTab === key;
            const c = TAB_COLORS[color];
            return (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`
                  flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-sm border-b-4 transition-all
                  ${active
                    ? `${c.active} shadow-sm`
                    : `text-gray-500 bg-white border-transparent ${c.hover} border-gray-200`
                  }
                `}
              >
                <Icon />
                {label}
              </button>
            );
          })}
        </div>

        {/* ── Tab: Aktivitas ── */}
        {activeTab === "activity" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard
              title="Aktivitas Harian"
              description="Jumlah latihan per hari (30 hari terakhir)"
              delay={0}
              borderColor="border-indigo-200"
            >
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={data?.dailyActivity || []}>
                  <defs>
                    <linearGradient id="gradIndigo" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(v) => new Date(v).toLocaleDateString("id-ID", { day: "2-digit", month: "short" })}
                    fontSize={11}
                    tick={{ fontWeight: 700, fill: "#94A3B8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis fontSize={11} tick={{ fontWeight: 700, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="count" name="Latihan" stroke="#6366F1" strokeWidth={2.5} fill="url(#gradIndigo)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Registrasi Pengguna"
              description="Pendaftaran pengguna baru (30 hari terakhir)"
              delay={0.1}
              borderColor="border-emerald-200"
            >
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={data?.registrations || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(v) => new Date(v).toLocaleDateString("id-ID", { day: "2-digit", month: "short" })}
                    fontSize={11}
                    tick={{ fontWeight: 700, fill: "#94A3B8" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis fontSize={11} tick={{ fontWeight: 700, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="count" name="Registrasi" stroke="#10B981" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        )}

        {/* ── Tab: Performa ── */}
        {activeTab === "performance" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ChartCard
              title="Distribusi Skor"
              description="Sebaran skor pengguna berdasarkan rentang nilai"
              delay={0}
              borderColor="border-emerald-200"
            >
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={data?.scoreDistribution || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="range" fontSize={11} tick={{ fontWeight: 700, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                  <YAxis fontSize={11} tick={{ fontWeight: 700, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Jumlah" radius={[6, 6, 0, 0]}>
                    {(data?.scoreDistribution || []).map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard
              title="Rata-rata Skor per Tingkat"
              description="Perbandingan skor berdasarkan tingkat kesulitan"
              delay={0.1}
              borderColor="border-violet-200"
            >
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={data?.avgScoreByDifficulty || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="difficulty" fontSize={11} tick={{ fontWeight: 700, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                  <YAxis fontSize={11} tick={{ fontWeight: 700, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="avgScore" name="Rata-rata Skor" radius={[6, 6, 0, 0]}>
                    {(data?.avgScoreByDifficulty || []).map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </div>
        )}

        {/* ── Tab: Pengguna ── */}
        {activeTab === "users" && (
          <ChartCard
            title="Top 10 Pengguna Teraktif"
            description="Pengguna dengan jumlah latihan terbanyak"
            delay={0}
            borderColor="border-violet-200"
          >
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={data?.topUsers || []} layout="vertical" margin={{ left: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                <XAxis type="number" fontSize={11} tick={{ fontWeight: 700, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" fontSize={11} width={90} tick={{ fontWeight: 700, fill: "#64748B" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Total Latihan" fill="#8B5CF6" radius={[0, 6, 6, 0]}>
                  {(data?.topUsers || []).map((_, i) => (
                    <Cell key={i} fill={i === 0 ? "#6366F1" : i === 1 ? "#8B5CF6" : i === 2 ? "#A78BFA" : "#C4B5FD"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {/* ── Tab: Distribusi ── */}
        {activeTab === "distribution" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Berdasarkan Mode",
                description: "EN→ID vs ID→EN",
                dataKey: "exercisesByMode",
                nameKey: "mode",
                labelFn: (v) => (v === "EN_ID" ? "EN→ID" : "ID→EN"),
                borderColor: "border-indigo-200",
              },
              {
                title: "Berdasarkan Kesulitan",
                description: "Easy, Medium, Hard",
                dataKey: "exercisesByDifficulty",
                nameKey: "difficulty",
                labelFn: (v) => v,
                borderColor: "border-emerald-200",
              },
              {
                title: "Berdasarkan Status",
                description: "Benar, Hampir Benar, Salah",
                dataKey: "exercisesByStatus",
                nameKey: "status",
                labelFn: (v) => (v === "HAMPIR_BENAR" ? "Hampir" : v),
                colorFn: (entry) => STATUS_COLORS[entry.status] || CHART_COLORS[0],
                borderColor: "border-amber-200",
              },
            ].map((chart, i) => (
              <ChartCard
                key={chart.dataKey}
                title={chart.title}
                description={chart.description}
                delay={i * 0.1}
                borderColor={chart.borderColor}
              >
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Tooltip content={<CustomTooltip />} />
                    <Pie
                      data={data?.[chart.dataKey] || []}
                      dataKey="count"
                      nameKey={chart.nameKey}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={80}
                      paddingAngle={3}
                      label={({ [chart.nameKey]: v }) => chart.labelFn(v)}
                      labelLine={false}
                    >
                      {(data?.[chart.dataKey] || []).map((entry, idx) => (
                        <Cell
                          key={idx}
                          fill={chart.colorFn ? chart.colorFn(entry) : CHART_COLORS[idx % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                {/* Legend */}
                <div className="flex flex-wrap gap-2 mt-3 justify-center">
                  {(data?.[chart.dataKey] || []).map((entry, idx) => (
                    <div key={idx} className="flex items-center gap-1.5">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: chart.colorFn ? chart.colorFn(entry) : CHART_COLORS[idx % CHART_COLORS.length] }}
                      />
                      <span className="text-xs font-black text-gray-600">
                        {chart.labelFn(entry[chart.nameKey])}
                        <span className="text-gray-400 font-bold ml-1">({entry.count})</span>
                      </span>
                    </div>
                  ))}
                </div>
              </ChartCard>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
