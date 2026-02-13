"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import LoadingScreen from "@/components/LoadingScreen";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, CheckCircle, PlayCircle, Trophy } from "lucide-react";
import { toast } from "sonner";

export default function QuizListPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchQuizzes();
    }
  }, [status, router]);

  const fetchQuizzes = async () => {
    try {
      const response = await fetch("/api/quizzes");
      if (response.ok) {
        const data = await response.json();
        setQuizzes(data);
      } else {
        toast.error("Gagal memuat quiz");
      }
    } catch (error) {
      console.error("Failed to fetch quizzes:", error);
      toast.error("Gagal memuat quiz");
    } finally {
      setLoading(false);
    }
  };

  if (loading || status === "loading") return <LoadingScreen />;

  if (status === "unauthenticated") return null;

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-blue-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <BookOpen className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Quiz Bahasa Inggris
          </h1>
          <p className="text-lg text-gray-600">
            Uji kemampuan vocabulary Anda dengan quiz interaktif
          </p>
        </div>

        {/* Quiz List */}
        {quizzes.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="py-16 text-center">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Belum ada quiz tersedia
              </h3>
              <p className="text-gray-600">
                Quiz baru akan segera ditambahkan. Silakan cek kembali nanti!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((quiz) => {
              const hasCompleted = quiz.results && quiz.results.length > 0;
              const lastResult = hasCompleted ? quiz.results[0] : null;
              const percentage = lastResult
                ? Math.round(
                    (lastResult.score / lastResult.totalQuestions) * 100,
                  )
                : 0;

              return (
                <Card
                  key={quiz.id}
                  className="border-0 shadow-md hover:shadow-xl transition-all duration-300 group"
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">
                          {quiz.title}
                        </CardTitle>
                        {hasCompleted && (
                          <Badge className="bg-green-100 text-green-700 border-0">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Selesai
                          </Badge>
                        )}
                      </div>
                    </div>
                    {quiz.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {quiz.description}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      {/* Stats */}
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1.5">
                          <BookOpen className="w-4 h-4" />
                          <span>{quiz._count.questions} soal</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Trophy className="w-4 h-4" />
                          <span>{quiz._count.results} peserta</span>
                        </div>
                      </div>

                      {/* Last Result */}
                      {hasCompleted && (
                        <div className="p-3 bg-linear-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">
                              Skor terakhir:
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-green-600">
                                {percentage}%
                              </span>
                              <span className="text-sm text-gray-500">
                                ({lastResult.score}/{lastResult.totalQuestions})
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Action Button */}
                      <Button
                        onClick={() => router.push(`/quiz/${quiz.id}`)}
                        className="w-full gap-2"
                        variant={hasCompleted ? "outline" : "default"}
                      >
                        <PlayCircle className="w-4 h-4" />
                        {hasCompleted ? "Kerjakan Lagi" : "Mulai Quiz"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
