"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-foreground text-xl">Loading...</div>
      </div>
    );
  }

  if (!session || session.user.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-card border-b">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Button asChild variant="outline" size="sm">
                <Link href="/learn">← Dashboard</Link>
              </Button>
              <h1 className="text-3xl font-bold">Admin Panel</h1>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {session.user.name} (Admin)
              </span>
              <Button
                onClick={() => signOut({ callbackUrl: "/" })}
                variant="destructive"
                size="sm"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Statistik Platform</h2>

        {stats && (
          <>
            {/* Overall Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="text-xs">Total Users</CardDescription>
                  <CardTitle className="text-4xl text-primary">{stats.totalUsers}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="text-xs">Total Latihan</CardDescription>
                  <CardTitle className="text-4xl text-primary">{stats.totalExercises}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="text-xs">Rata-rata Skor</CardDescription>
                  <CardTitle className="text-4xl text-primary">{stats.averageScore}</CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="text-xs">Total Admins</CardDescription>
                  <CardTitle className="text-4xl text-primary">{stats.totalAdmins}</CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* Mode Distribution */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Distribusi Mode</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-6 text-center">
                  <div>
                    <p className="text-lg font-semibold mb-2">EN → ID</p>
                    <p className="text-4xl font-bold text-primary">
                      {stats.modeDistribution.EN_ID}
                    </p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold mb-2">ID → EN</p>
                    <p className="text-4xl font-bold text-primary">
                      {stats.modeDistribution.ID_EN}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Difficulty Distribution */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Distribusi Kesulitan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-lg font-semibold mb-2">Mudah</p>
                    <p className="text-4xl font-bold text-primary">
                      {stats.difficultyDistribution.EASY}
                    </p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold mb-2">Sedang</p>
                    <p className="text-4xl font-bold text-primary">
                      {stats.difficultyDistribution.MEDIUM}
                    </p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold mb-2">Sulit</p>
                    <p className="text-4xl font-bold text-primary">
                      {stats.difficultyDistribution.HARD}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Distribusi Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-lg font-semibold mb-2">Benar</p>
                    <p className="text-4xl font-bold text-primary">
                      {stats.statusDistribution.BENAR}
                    </p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold mb-2">Hampir Benar</p>
                    <p className="text-4xl font-bold text-orange-500">
                      {stats.statusDistribution.HAMPIR_BENAR}
                    </p>
                  </div>
                  <div>
                    <p className="text-lg font-semibold mb-2">Salah</p>
                    <p className="text-4xl font-bold text-destructive">
                      {stats.statusDistribution.SALAH}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
