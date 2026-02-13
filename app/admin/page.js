"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  Shield,
  BookOpen,
  TrendingUp,
  Loader2,
  Clock,
  Award,
} from "lucide-react";

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
      if (response.ok) {
        setDashboardData(data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session || session.user.role !== "ADMIN") {
    return null;
  }

  const stats = dashboardData?.stats || {};
  const recentLearners = dashboardData?.recentLearners || [];
  const exercisesByMode = dashboardData?.exercisesByMode || [];

  return (
    <div className="min-h-screen">
      <Navbar user={session.user} />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard Admin</h1>
          <p className="text-muted-foreground">
            Ringkasan data dan aktivitas platform LernLang
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs font-medium">
                  Total Users
                </CardDescription>
                <Users className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stats.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Pengguna terdaftar
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs font-medium">
                  Admins
                </CardDescription>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary">
                {stats.totalAdmins || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Administrator aktif
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs font-medium">
                  Total Latihan
                </CardDescription>
                <BookOpen className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {stats.totalExercises || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Latihan diselesaikan
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-xs font-medium">
                  Active Users
                </CardDescription>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {stats.activeUsers || 0}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Aktif 7 hari terakhir
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Exercise Mode Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Distribusi Mode Latihan</CardTitle>
              <CardDescription>Berdasarkan tipe translasi</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {exercisesByMode.map((mode) => (
                  <div
                    key={mode.mode}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          mode.mode === "EN_ID" ? "default" : "secondary"
                        }
                      >
                        {mode.mode === "EN_ID" ? "EN → ID" : "ID → EN"}
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold">{mode._count}</div>
                  </div>
                ))}
                {exercisesByMode.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    Belum ada data latihan
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription>Akses cepat ke fitur admin</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Link
                  href="/admin/users"
                  className="flex items-center gap-3 p-4 rounded-lg border hover:bg-accent transition-colors"
                >
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Kelola Users</p>
                    <p className="text-xs text-muted-foreground">
                      User management
                    </p>
                  </div>
                </Link>
                <Link
                  href="/history"
                  className="flex items-center gap-3 p-4 rounded-lg border hover:bg-accent transition-colors"
                >
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">History</p>
                    <p className="text-xs text-muted-foreground">
                      Riwayat latihan
                    </p>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Active Learners */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Pengguna Aktif Belajar
                </CardTitle>
                <CardDescription>
                  Top 10 pengguna yang aktif melakukan latihan (7 hari terakhir)
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {recentLearners.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Belum ada pengguna yang melakukan latihan dalam 7 hari terakhir.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ranking</TableHead>
                      <TableHead>Nama</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-center">Role</TableHead>
                      <TableHead className="text-center">
                        Total Latihan
                      </TableHead>
                      <TableHead className="text-center">
                        Terakhir Aktif
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentLearners.map((learner, index) => (
                      <TableRow key={learner.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {index === 0 && (
                              <span className="text-2xl">🥇</span>
                            )}
                            {index === 1 && (
                              <span className="text-2xl">🥈</span>
                            )}
                            {index === 2 && (
                              <span className="text-2xl">🥉</span>
                            )}
                            {index > 2 && (
                              <span className="font-bold text-muted-foreground">
                                #{index + 1}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {learner.name}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {learner.email}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={
                              learner.role === "ADMIN" ? "default" : "secondary"
                            }
                          >
                            {learner.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="font-bold text-primary">
                            {learner._count.histories}
                          </span>
                        </TableCell>
                        <TableCell className="text-center text-sm">
                          {learner.histories[0]
                            ? new Date(
                                learner.histories[0].createdAt,
                              ).toLocaleDateString("id-ID", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
