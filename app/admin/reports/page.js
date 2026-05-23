"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import LoadingScreen from "@/components/LoadingScreen";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
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
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { Users, BookOpen, Award, ArrowLeft } from "lucide-react";
import Link from "next/link";

const COLORS = [
  "hsl(142, 55%, 45%)",
  "hsl(160, 55%, 45%)",
  "hsl(170, 55%, 45%)",
  "hsl(130, 55%, 55%)",
  "hsl(150, 55%, 55%)",
];

const STATUS_COLORS = {
  BENAR: "hsl(142, 70%, 45%)",
  HAMPIR_BENAR: "hsl(45, 90%, 50%)",
  SALAH: "hsl(0, 70%, 55%)",
};

export default function ReportsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (session?.user?.role !== "ADMIN" && status === "authenticated")
      router.push("/learn");
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

  if (status === "loading" || loading) return <LoadingScreen fullPage />;
  if (!session || session.user.role !== "ADMIN") return null;

  return (
    <div className="min-h-screen bg-linear-to-b from-green-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/admin"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Laporan & Statistik</h1>
            <p className="text-gray-600">
              Analisis lengkap aktivitas pengguna dan pembelajaran
            </p>
          </div>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Pengguna
              </CardTitle>
              <Users className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {data?.overall?.totalUsers || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Latihan
              </CardTitle>
              <BookOpen className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {data?.overall?.totalExercises || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Rata-rata Skor
              </CardTitle>
              <Award className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {data?.overall?.avgScore || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="activity" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="activity">Aktivitas</TabsTrigger>
            <TabsTrigger value="performance">Performa</TabsTrigger>
            <TabsTrigger value="users">Pengguna</TabsTrigger>
            <TabsTrigger value="distribution">Distribusi</TabsTrigger>
          </TabsList>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Daily Activity Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Aktivitas Harian</CardTitle>
                  <CardDescription>
                    Jumlah latihan per hari (30 hari terakhir)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      count: { label: "Latihan", color: "hsl(142, 55%, 45%)" },
                    }}
                    className="h-75 w-full"
                  >
                    <AreaChart data={data?.dailyActivity || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(v) =>
                          new Date(v).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                          })
                        }
                        fontSize={12}
                      />
                      <YAxis fontSize={12} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="count"
                        stroke="hsl(142, 55%, 45%)"
                        fill="hsl(142, 55%, 45%)"
                        fillOpacity={0.2}
                      />
                    </AreaChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* User Registrations */}
              <Card>
                <CardHeader>
                  <CardTitle>Registrasi Pengguna</CardTitle>
                  <CardDescription>
                    Pendaftaran pengguna baru (30 hari terakhir)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      count: {
                        label: "Registrasi",
                        color: "hsl(160, 55%, 45%)",
                      },
                    }}
                    className="h-75 w-full"
                  >
                    <LineChart data={data?.registrations || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(v) =>
                          new Date(v).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                          })
                        }
                        fontSize={12}
                      />
                      <YAxis fontSize={12} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Line
                        type="monotone"
                        dataKey="count"
                        stroke="hsl(160, 55%, 45%)"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Score Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Distribusi Skor</CardTitle>
                  <CardDescription>
                    Sebaran skor pengguna berdasarkan rentang nilai
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      count: { label: "Jumlah", color: "hsl(142, 55%, 45%)" },
                    }}
                    className="h-75 w-full"
                  >
                    <BarChart data={data?.scoreDistribution || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" fontSize={12} />
                      <YAxis fontSize={12} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                        {(data?.scoreDistribution || []).map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Avg Score by Difficulty */}
              <Card>
                <CardHeader>
                  <CardTitle>Rata-rata Skor per Tingkat</CardTitle>
                  <CardDescription>
                    Perbandingan skor berdasarkan tingkat kesulitan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      avgScore: {
                        label: "Rata-rata Skor",
                        color: "hsl(142, 55%, 45%)",
                      },
                    }}
                    className="h-75 w-full"
                  >
                    <BarChart data={data?.avgScoreByDifficulty || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="difficulty" fontSize={12} />
                      <YAxis fontSize={12} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="avgScore" radius={[4, 4, 0, 0]}>
                        {(data?.avgScoreByDifficulty || []).map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Top 10 Pengguna Teraktif</CardTitle>
                <CardDescription>
                  Pengguna dengan jumlah latihan terbanyak
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    count: {
                      label: "Total Latihan",
                      color: "hsl(142, 55%, 45%)",
                    },
                  }}
                  className="h-100 w-full"
                >
                  <BarChart
                    data={data?.topUsers || []}
                    layout="vertical"
                    margin={{ left: 80 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" fontSize={12} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      fontSize={12}
                      width={70}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar
                      dataKey="count"
                      fill="hsl(142, 55%, 45%)"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Distribution Tab */}
          <TabsContent value="distribution" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* By Mode */}
              <Card>
                <CardHeader>
                  <CardTitle>Berdasarkan Mode</CardTitle>
                  <CardDescription>EN→ID vs ID→EN</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      count: { label: "Jumlah" },
                    }}
                    className="h-62.5 w-full"
                  >
                    <PieChart>
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Pie
                        data={data?.exercisesByMode || []}
                        dataKey="count"
                        nameKey="mode"
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        label={({ mode }) =>
                          mode === "EN_ID" ? "EN→ID" : "ID→EN"
                        }
                      >
                        {(data?.exercisesByMode || []).map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* By Difficulty */}
              <Card>
                <CardHeader>
                  <CardTitle>Berdasarkan Kesulitan</CardTitle>
                  <CardDescription>Easy, Medium, Hard</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      count: { label: "Jumlah" },
                    }}
                    className="h-62.5 w-full"
                  >
                    <PieChart>
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Pie
                        data={data?.exercisesByDifficulty || []}
                        dataKey="count"
                        nameKey="difficulty"
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        label={({ difficulty }) => difficulty}
                      >
                        {(data?.exercisesByDifficulty || []).map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* By Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Berdasarkan Status</CardTitle>
                  <CardDescription>Benar, Hampir Benar, Salah</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      count: { label: "Jumlah" },
                    }}
                    className="h-62.5 w-full"
                  >
                    <PieChart>
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Pie
                        data={data?.exercisesByStatus || []}
                        dataKey="count"
                        nameKey="status"
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        label={({ status }) =>
                          status === "HAMPIR_BENAR" ? "Hampir" : status
                        }
                      >
                        {(data?.exercisesByStatus || []).map((entry) => (
                          <Cell
                            key={entry.status}
                            fill={STATUS_COLORS[entry.status] || COLORS[0]}
                          />
                        ))}
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
