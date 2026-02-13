"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import LoadingScreen from "@/components/LoadingScreen";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  CheckCircle,
  XCircle,
  ArrowLeft,
  Trophy,
  RotateCcw,
  Home,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function TakeQuizPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [exitDialogOpen, setExitDialogOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchQuiz();
    }
  }, [status, router]);

  const fetchQuiz = async () => {
    try {
      const response = await fetch(`/api/quizzes/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setQuiz(data);
      } else {
        toast.error("Quiz tidak ditemukan");
        router.push("/quiz");
      }
    } catch (error) {
      console.error("Failed to fetch quiz:", error);
      toast.error("Gagal memuat quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (questionId, optionId) => {
    setAnswers({
      ...answers,
      [questionId]: optionId,
    });
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    // Check if all questions are answered
    const unanswered = quiz.questions.filter((q) => !answers[q.id]);

    if (unanswered.length > 0) {
      toast.error(
        `Masih ada ${unanswered.length} pertanyaan yang belum dijawab`,
      );
      return;
    }

    setSubmitDialogOpen(true);
  };

  const confirmSubmit = async () => {
    setSubmitDialogOpen(false);
    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/quizzes/${params.id}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answers }),
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
        toast.success("Quiz selesai!");
      } else {
        toast.error("Gagal mengirim jawaban");
      }
    } catch (error) {
      console.error("Failed to submit quiz:", error);
      toast.error("Gagal mengirim jawaban");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || status === "loading") return <LoadingScreen />;

  if (status === "unauthenticated" || !quiz) return null;

  // Show result
  if (result) {
    return (
      <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-green-50">
        <Navbar />
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-0 shadow-xl">
              <CardHeader className="text-center pb-6">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mx-auto mb-4">
                  <Trophy className="w-10 h-10 text-primary" />
                </div>
                <CardTitle className="text-3xl mb-2">Quiz Selesai!</CardTitle>
                <p className="text-gray-600">Berikut adalah hasil quiz Anda</p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Score */}
                <div className="text-center py-6 bg-linear-to-r from-primary/5 to-green-50 rounded-xl">
                  <div className="text-6xl font-bold text-primary mb-2">
                    {result.percentage}%
                  </div>
                  <p className="text-xl text-gray-700 font-semibold">
                    {result.score} dari {result.totalQuestions} benar
                  </p>
                </div>

                {/* Detailed Results */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg text-gray-900">
                    Pembahasan Jawaban
                  </h3>
                  {result.detailedResults.map((item, index) => (
                    <Card
                      key={index}
                      className={`border-2 ${
                        item.isCorrect
                          ? "border-green-200 bg-green-50"
                          : "border-red-200 bg-red-50"
                      }`}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                          {item.isCorrect ? (
                            <CheckCircle className="w-6 h-6 text-green-600 shrink-0 mt-1" />
                          ) : (
                            <XCircle className="w-6 h-6 text-red-600 shrink-0 mt-1" />
                          )}
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 mb-2">
                              {index + 1}. {item.question}
                            </p>
                            <div className="space-y-1 text-sm">
                              <p className="text-gray-700">
                                <span className="font-medium">
                                  Jawaban Anda:
                                </span>{" "}
                                <span
                                  className={
                                    item.isCorrect
                                      ? "text-green-700"
                                      : "text-red-700"
                                  }
                                >
                                  {item.userAnswer || "(tidak dijawab)"}
                                </span>
                              </p>
                              {!item.isCorrect && (
                                <p className="text-gray-700">
                                  <span className="font-medium">
                                    Jawaban Benar:
                                  </span>{" "}
                                  <span className="text-green-700">
                                    {item.correctAnswer}
                                  </span>
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-center gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => router.push("/quiz")}
                    className="gap-2"
                  >
                    <Home className="w-4 h-4" />
                    Kembali ke Quiz
                  </Button>
                  <Button
                    onClick={() => {
                      setResult(null);
                      setAnswers({});
                      setCurrentQuestion(0);
                    }}
                    className="gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Kerjakan Lagi
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </main>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-white to-blue-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setExitDialogOpen(true)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
            <Badge variant="outline" className="text-base px-4 py-2">
              {answeredCount}/{quiz.questions.length} terjawab
            </Badge>
          </div>
          {/* Progress Bar */}
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-0 shadow-xl mb-6">
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <Badge variant="outline" className="mb-2">
                  Pertanyaan {currentQuestion + 1} dari {quiz.questions.length}
                </Badge>
              </div>
              <CardTitle className="text-2xl">{question.question}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {question.options.map((option) => {
                  const isSelected = answers[question.id] === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => handleSelectAnswer(question.id, option.id)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        isSelected
                          ? "border-primary bg-primary/5 shadow-md"
                          : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            isSelected
                              ? "border-primary bg-primary"
                              : "border-gray-300"
                          }`}
                        >
                          {isSelected && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <span
                          className={`text-base ${
                            isSelected
                              ? "font-semibold text-gray-900"
                              : "text-gray-700"
                          }`}
                        >
                          {option.option}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            ← Sebelumnya
          </Button>

          {currentQuestion === quiz.questions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              {isSubmitting ? "Mengirim..." : "Selesai & Kirim"}
            </Button>
          ) : (
            <Button onClick={handleNext}>Selanjutnya →</Button>
          )}
        </div>
      </main>

      {/* Exit Dialog */}
      <AlertDialog open={exitDialogOpen} onOpenChange={setExitDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Keluar dari Quiz?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin keluar? Progress Anda akan hilang dan
              tidak akan tersimpan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Lanjutkan</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => router.push("/quiz")}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Keluar
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>

      {/* Submit Dialog */}
      <AlertDialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kirim Jawaban?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin mengirim jawaban? Anda tidak bisa mengubah
              jawaban setelah ini.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Kembali</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Mengirim..." : "Kirim Jawaban"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
