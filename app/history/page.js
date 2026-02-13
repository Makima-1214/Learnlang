"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
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
import Navbar from "@/components/Navbar";

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchHistory();
    }
  }, [status, router]);

  const fetchHistory = async () => {
    try {
      const response = await fetch("/api/history");
      const data = await response.json();
      if (response.ok) {
        setHistory(data.histories || []);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case "BENAR":
        return "default";
      case "SALAH":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "BENAR":
        return "BENAR";
      case "HAMPIR_BENAR":
        return "HAMPIR BENAR";
      case "SALAH":
        return "SALAH";
      default:
        return status;
    }
  };

  const getModeLabel = (mode) => (mode === "EN_ID" ? "EN → ID" : "ID → EN");

  const getDifficultyLabel = (difficulty) => {
    const map = { EASY: "Mudah", MEDIUM: "Sedang", HARD: "Sulit" };
    return map[difficulty] || difficulty;
  };

  const filteredHistory = history.filter((item) => {
    if (filter === "all") return true;
    if (filter === "benar") return item.status === "BENAR";
    if (filter === "hampir") return item.status === "HAMPIR_BENAR";
    if (filter === "salah") return item.status === "SALAH";
    return true;
  });

  const sortedHistory = [...filteredHistory].sort((a, b) => {
    if (sortBy === "date") return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === "score") return b.score - a.score;
    return 0;
  });

  const stats = {
    total: history.length,
    benar: history.filter((h) => h.status === "BENAR").length,
    hampir: history.filter((h) => h.status === "HAMPIR_BENAR").length,
    salah: history.filter((h) => h.status === "SALAH").length,
    averageScore:
      history.length > 0
        ? Math.round(
            history.reduce((sum, h) => sum + h.score, 0) / history.length,
          )
        : 0,
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-foreground text-xl">Loading...</div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen">
      <Navbar user={session.user} />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Riwayat Belajar</h1>
        </div>

        {history.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>Belum Ada Riwayat</CardTitle>
              <CardDescription>
                Mulai belajar untuk melihat riwayat latihan Anda di sini.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild>
                <Link href="/learn">Mulai Belajar</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="text-xs">
                    Total Latihan
                  </CardDescription>
                  <CardTitle className="text-3xl">{stats.total}</CardTitle>
                </CardHeader>
              </Card>
              <Card className="border-primary">
                <CardHeader className="pb-3">
                  <CardDescription className="text-xs">Benar</CardDescription>
                  <CardTitle className="text-3xl text-primary">
                    {stats.benar}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card className="border-orange-500">
                <CardHeader className="pb-3">
                  <CardDescription className="text-xs">
                    Hampir Benar
                  </CardDescription>
                  <CardTitle className="text-3xl text-orange-500">
                    {stats.hampir}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card className="border-destructive">
                <CardHeader className="pb-3">
                  <CardDescription className="text-xs">Salah</CardDescription>
                  <CardTitle className="text-3xl text-destructive">
                    {stats.salah}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="text-xs">
                    Rata-rata Skor
                  </CardDescription>
                  <CardTitle className="text-3xl">
                    {stats.averageScore}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>

            {/* Filters */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-lg">Filter & Urutkan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-3">Filter Status:</p>
                    <div className="flex gap-2 flex-wrap">
                      {[
                        { value: "all", label: "Semua" },
                        { value: "benar", label: "Benar" },
                        { value: "hampir", label: "Hampir" },
                        { value: "salah", label: "Salah" },
                      ].map((option) => (
                        <Button
                          key={option.value}
                          onClick={() => setFilter(option.value)}
                          variant={
                            filter === option.value ? "default" : "outline"
                          }
                          size="sm"
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-3">Urutkan:</p>
                    <div className="flex gap-2">
                      {[
                        { value: "date", label: "Tanggal" },
                        { value: "score", label: "Skor" },
                      ].map((option) => (
                        <Button
                          key={option.value}
                          onClick={() => setSortBy(option.value)}
                          variant={
                            sortBy === option.value ? "default" : "outline"
                          }
                          size="sm"
                        >
                          {option.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* History Table */}
            <Card>
              <CardHeader>
                <CardTitle>Riwayat Latihan ({sortedHistory.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {sortedHistory.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Tidak ada hasil dengan filter ini.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tanggal</TableHead>
                          <TableHead>Mode</TableHead>
                          <TableHead>Level</TableHead>
                          <TableHead>Kalimat</TableHead>
                          <TableHead className="text-center">Skor</TableHead>
                          <TableHead className="text-center">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedHistory.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="text-sm">
                              {new Date(item.createdAt).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {getModeLabel(item.mode)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {getDifficultyLabel(item.difficulty)}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-xs">
                              <div className="truncate text-sm">
                                {item.sourceSentence}
                              </div>
                            </TableCell>
                            <TableCell className="text-center font-bold">
                              {item.score}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant={getStatusVariant(item.status)}>
                                {getStatusLabel(item.status)}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
