"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import LoadingScreen from "@/components/LoadingScreen";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  Calendar,
  Trophy,
  Target,
  CheckCircle,
  Star,
  BookOpen,
  ArrowLeft,
  TrendingUp,
  Zap,
  Award,
  Share2,
  Copy,
  Check,
  MessageSquare,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { toast } from "sonner";

export default function PublicProfilePage() {
  const params = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [params.username]);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`/api/users/${params.username}`);
      if (response.ok) {
        const data = await response.json();
        setUser(data);
      } else if (response.status === 404) {
        setNotFound(true);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const copyProfileUrl = async () => {
    const url = `${window.location.origin}/user/${user?.username}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link profil berhasil disalin!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Gagal menyalin link profil");
    }
  };

  const shareProfile = async () => {
    const url = `${window.location.origin}/user/${user?.username}`;
    const shareData = {
      title: `${user?.name} - LernLang`,
      text: `Lihat progress belajar bahasa Inggris ${user?.name} di LernLang!`,
      url: url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        if (err.name !== "AbortError") {
          copyProfileUrl();
        }
      }
    } else {
      copyProfileUrl();
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "BENAR":
        return (
          <Badge className="bg-green-100 text-green-700 border-0">Benar</Badge>
        );
      case "HAMPIR_BENAR":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 border-0">
            Hampir Benar
          </Badge>
        );
      case "SALAH":
        return (
          <Badge className="bg-red-100 text-red-700 border-0">Salah</Badge>
        );
      default:
        return null;
    }
  };

  const getDifficultyBadge = (difficulty) => {
    switch (difficulty) {
      case "EASY":
        return (
          <Badge variant="outline" className="text-green-600 border-green-300">
            Mudah
          </Badge>
        );
      case "MEDIUM":
        return (
          <Badge
            variant="outline"
            className="text-yellow-600 border-yellow-300"
          >
            Sedang
          </Badge>
        );
      case "HARD":
        return (
          <Badge variant="outline" className="text-red-600 border-red-300">
            Sulit
          </Badge>
        );
      default:
        return null;
    }
  };

  if (loading) return <LoadingScreen />;

  if (notFound) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-4">😔</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Pengguna Tidak Ditemukan
          </h1>
          <p className="text-gray-600 mb-6">
            Username &quot;{params.username}&quot; tidak ditemukan atau belum
            terdaftar.
          </p>
          <Link href="/">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Beranda
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const accuracy =
    user?.stats?.totalExercises > 0
      ? Math.round((user.stats.correctCount / user.stats.totalExercises) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-green-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {/* Profile Header Card */}
          <Card className="overflow-hidden border-0 shadow-lg">
            {/* Cover Banner */}
            <div className="relative h-32 sm:h-40 bg-linear-to-r from-primary via-green-500 to-emerald-600">
              <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
            </div>

            {/* Profile Info */}
            <CardContent className="relative pt-0 pb-6 px-4 sm:px-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-6">
                {/* Avatar */}
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="-mt-16 sm:-mt-20"
                >
                  <Avatar className="w-32 h-32 sm:w-40 sm:h-40 border-4 border-white shadow-xl ring-4 ring-primary/10">
                    <AvatarImage src={user?.avatar} alt={user?.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-4xl sm:text-5xl font-bold">
                      {getInitials(user?.name)}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>

                {/* Info & Actions */}
                <div className="flex-1 text-center sm:text-left space-y-2 sm:mb-4">
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                      {user?.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                      <p className="text-base sm:text-lg text-gray-500 font-medium">
                        @{user?.username}
                      </p>
                      {user?.viewerRelationship?.isFriend && (
                        <Badge className="bg-green-100 text-green-700 border-0">
                          🤝 Teman
                        </Badge>
                      )}
                      {!user?.viewerRelationship?.isFriend &&
                        user?.viewerRelationship?.isFollowing && (
                          <Badge variant="outline">Mengikuti</Badge>
                        )}
                    </div>
                  </div>

                  {user?.bio && (
                    <p className="text-gray-700 text-sm sm:text-base max-w-2xl">
                      {user.bio}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-3 justify-center sm:justify-start text-sm text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Bergabung{" "}
                        {user?.createdAt &&
                          formatDistanceToNow(new Date(user.createdAt), {
                            addSuffix: true,
                            locale: idLocale,
                          })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={copyProfileUrl}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        {copied ? (
                          <>
                            <Check className="w-4 h-4" />
                            Tersalin
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4" />
                            Salin Link
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={shareProfile}
                        size="sm"
                        className="gap-2"
                      >
                        <Share2 className="w-4 h-4" />
                        Bagikan
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start pt-2">
                    <Badge variant="secondary">
                      {user?.followersCount || 0} Pengikut
                    </Badge>
                    <Badge variant="secondary">
                      {user?.followingCount || 0} Mengikuti
                    </Badge>
                    <Badge variant="secondary">
                      {user?.friendshipCount || 0} Teman
                    </Badge>
                  </div>

                  {user?.viewerRelationship?.isFriend && (
                    <div className="pt-2 flex justify-center sm:justify-start">
                      <Link href={`/chats?userId=${user.id}`}>
                        <Button className="gap-2">
                          <MessageSquare className="w-4 h-4" />
                          Chat Teman
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Overview */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-3">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-3xl font-bold text-blue-600 mb-1">
                    {user?.stats?.totalExercises || 0}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">
                    Total Latihan
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-3">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-3xl font-bold text-green-600 mb-1">
                    {user?.stats?.correctCount || 0}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">
                    Jawaban Benar
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-purple-100 mb-3">
                    <Trophy className="w-6 h-6 text-purple-600" />
                  </div>
                  <p className="text-3xl font-bold text-purple-600 mb-1">
                    {user?.stats?.averageScore || 0}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">
                    Skor Rata-rata
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 mb-3">
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                  </div>
                  <p className="text-3xl font-bold text-orange-600 mb-1">
                    {accuracy}%
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">
                    Akurasi
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Difficulty Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Tingkat Kesulitan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  {
                    key: "EASY",
                    label: "Mudah",
                    color: "bg-green-500",
                    bgColor: "bg-green-100",
                  },
                  {
                    key: "MEDIUM",
                    label: "Sedang",
                    color: "bg-yellow-500",
                    bgColor: "bg-yellow-100",
                  },
                  {
                    key: "HARD",
                    label: "Sulit",
                    color: "bg-red-500",
                    bgColor: "bg-red-100",
                  },
                ].map((diff) => {
                  const count =
                    user?.stats?.difficultyBreakdown?.[diff.key] || 0;
                  const total = user?.stats?.totalExercises || 1;
                  const percent = Math.round((count / total) * 100);
                  return (
                    <div key={diff.key}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">{diff.label}</span>
                        <span className="text-gray-500">
                          {count} ({percent}%)
                        </span>
                      </div>
                      <div className={`h-2 rounded-full ${diff.bgColor}`}>
                        <div
                          className={`h-full rounded-full ${diff.color} transition-all duration-500`}
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Mode Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Mode Latihan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    key: "EN_ID",
                    label: "Inggris → Indonesia",
                    icon: "🇬🇧 → 🇮🇩",
                  },
                  {
                    key: "ID_EN",
                    label: "Indonesia → Inggris",
                    icon: "🇮🇩 → 🇬🇧",
                  },
                ].map((mode) => {
                  const count = user?.stats?.modeBreakdown?.[mode.key] || 0;
                  return (
                    <div
                      key={mode.key}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{mode.icon}</span>
                        <span className="font-medium text-sm">
                          {mode.label}
                        </span>
                      </div>
                      <Badge variant="secondary" className="font-bold">
                        {count}
                      </Badge>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  Pencapaian
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    {
                      icon: "🎯",
                      title: "Pemula",
                      desc: "1 latihan",
                      unlocked: (user?.stats?.totalExercises || 0) >= 1,
                    },
                    {
                      icon: "📚",
                      title: "Rajin",
                      desc: "10 latihan",
                      unlocked: (user?.stats?.totalExercises || 0) >= 10,
                    },
                    {
                      icon: "🏆",
                      title: "Juara",
                      desc: "50 latihan",
                      unlocked: (user?.stats?.totalExercises || 0) >= 50,
                    },
                    {
                      icon: "💯",
                      title: "Sempurna",
                      desc: "Skor rata-rata 90+",
                      unlocked: (user?.stats?.averageScore || 0) >= 90,
                    },
                    {
                      icon: "⭐",
                      title: "Bintang",
                      desc: "5 jawaban benar",
                      unlocked: (user?.stats?.correctCount || 0) >= 5,
                    },
                    {
                      icon: "🔥",
                      title: "Legenda",
                      desc: "100 latihan",
                      unlocked: (user?.stats?.totalExercises || 0) >= 100,
                    },
                  ].map((achievement) => (
                    <div
                      key={achievement.title}
                      className={`p-3 rounded-lg border text-center transition-all ${
                        achievement.unlocked
                          ? "bg-white border-primary/30 shadow-sm"
                          : "bg-gray-100 border-gray-200 opacity-50"
                      }`}
                    >
                      <span className="text-2xl">{achievement.icon}</span>
                      <p className="font-medium text-sm mt-1">
                        {achievement.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {achievement.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Aktivitas Terbaru
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!user?.recentActivity || user.recentActivity.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Belum ada aktivitas
                  </p>
                ) : (
                  <div className="space-y-3">
                    {user.recentActivity.map((activity, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-sm">
                            {getStatusBadge(activity.status)}
                          </div>
                          <div>
                            <p className="text-sm font-medium">
                              {activity.mode === "EN_ID"
                                ? "EN → ID"
                                : "ID → EN"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {format(
                                new Date(activity.createdAt),
                                "dd MMM yyyy",
                                { locale: idLocale },
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getDifficultyBadge(activity.difficulty)}
                          <span className="font-bold text-sm">
                            {activity.score}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">
            © {new Date().getFullYear()} LernLang. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
