"use client";

import { useSession, signOut } from "next-auth/react";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

export default function LearnPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [mode, setMode] = useState("EN_ID"); // EN_ID or ID_EN
  const [currentSentence, setCurrentSentence] = useState("");
  const [userTranslation, setUserTranslation] = useState("");
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [loading, setLoading] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [error, setError] = useState("");
  const [questionCount, setQuestionCount] = useState(0);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const generateSentence = async () => {
    setLoading(true);
    setError("");
    setEvaluation(null);
    setUserTranslation("");

    try {
      const response = await fetch("/api/generate-sentence", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ difficulty, mode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate sentence");
      }

      setCurrentSentence(data.sentence);
      setQuestionCount((prev) => prev + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const evaluateTranslation = async () => {
    if (!userTranslation.trim()) {
      setError("Silakan masukkan terjemahan terlebih dahulu");
      return;
    }

    setEvaluating(true);
    setError("");

    try {
      const response = await fetch("/api/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sourceSentence: currentSentence,
          userTranslation: userTranslation,
          mode: mode,
          difficulty: difficulty,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to evaluate");
      }

      setEvaluation(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setEvaluating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "BENAR":
        return "bg-[#6fbf8f] text-white";
      case "HAMPIR_BENAR":
        return "bg-[#f59e0b] text-white";
      case "SALAH":
        return "bg-[#ef4444] text-white";
      default:
        return "bg-gray-500 text-white";
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

  const getScoreColor = (score) => {
    if (score >= 90) return "text-[#4a9d6a]";
    if (score >= 60) return "text-[#f59e0b]";
    return "text-[#ef4444]";
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-foreground text-xl">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-card border-b">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-foreground">LernLang</h1>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                Halo, {session.user.name}!
              </span>
              <Button asChild variant="outline" size="sm">
                <Link href="/history">Riwayat</Link>
              </Button>
              {session.user.role === "ADMIN" && (
                <Button asChild size="sm">
                  <Link href="/admin">Admin</Link>
                </Button>
              )}
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

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Mode & Difficulty Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Mode Belajar</CardTitle>
            <CardDescription>Pilih mode dan tingkat kesulitan</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Mode Selection */}
            <div>
              <Label className="mb-3 block">Pilih Mode:</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => setMode("EN_ID")}
                  variant={mode === "EN_ID" ? "default" : "outline"}
                  className="h-auto py-4"
                >
                  <div>
                    <div className="font-bold text-base mb-1">
                      English → Indonesian
                    </div>
                    <div className="text-xs opacity-90 font-normal">
                      Terjemahkan dari bahasa Inggris
                    </div>
                  </div>
                </Button>
                <Button
                  onClick={() => setMode("ID_EN")}
                  variant={mode === "ID_EN" ? "default" : "outline"}
                  className="h-auto py-4"
                >
                  <div>
                    <div className="font-bold text-base mb-1">
                      Indonesian → English
                    </div>
                    <div className="text-xs opacity-90 font-normal">
                      Terjemahkan ke bahasa Inggris
                    </div>
                  </div>
                </Button>
              </div>
            </div>

            {/* Difficulty Selection */}
            <div>
              <Label className="mb-3 block">Tingkat Kesulitan:</Label>
              <div className="flex gap-3">
                {["EASY", "MEDIUM", "HARD"].map((level) => (
                  <Button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    variant={difficulty === level ? "default" : "outline"}
                  >
                    {level === "EASY"
                      ? "Mudah"
                      : level === "MEDIUM"
                        ? "Sedang"
                        : "Sulit"}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              onClick={generateSentence}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading
                ? "Menghasilkan..."
                : questionCount === 0
                  ? "Mulai Belajar"
                  : "Generate Kalimat Baru"}
            </Button>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Question Section */}
        {currentSentence && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>
                  {mode === "EN_ID"
                    ? "Kalimat Bahasa Inggris"
                    : "Kalimat Bahasa Indonesia"}
                </CardTitle>
                <div className="flex gap-2">
                  <Badge variant="secondary">
                    {mode === "EN_ID" ? "EN → ID" : "ID → EN"}
                  </Badge>
                  <Badge variant="outline">
                    {difficulty === "EASY"
                      ? "Mudah"
                      : difficulty === "MEDIUM"
                        ? "Sedang"
                        : "Sulit"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-muted rounded-lg p-4">
                <p className="text-xl font-medium">{currentSentence}</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="translation">
                  {mode === "EN_ID"
                    ? "Terjemahan Anda (Bahasa Indonesia):"
                    : "Your Translation (English):"}
                </Label>
                <Textarea
                  id="translation"
                  value={userTranslation}
                  onChange={(e) => setUserTranslation(e.target.value)}
                  placeholder={
                    mode === "EN_ID"
                      ? "Ketik terjemahan Anda di sini..."
                      : "Type your translation here..."
                  }
                  rows="4"
                  disabled={evaluating}
                />
              </div>

              <Button
                onClick={evaluateTranslation}
                disabled={evaluating || !userTranslation.trim()}
                className="w-full"
                size="lg"
              >
                {evaluating ? "Mengevaluasi..." : "Evaluasi Terjemahan"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Evaluation Result */}
        {evaluation && (
          <Card>
            <CardHeader>
              <CardTitle className="text-center text-2xl">
                Hasil Evaluasi
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Score and Status */}
              <div className="flex flex-col items-center gap-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    Skor Anda:
                  </p>
                  <p
                    className={`text-6xl font-bold ${getScoreColor(evaluation.score)}`}
                  >
                    {evaluation.score}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">dari 100</p>
                </div>
                <Badge
                  variant={
                    evaluation.status === "BENAR"
                      ? "default"
                      : evaluation.status === "SALAH"
                        ? "destructive"
                        : "secondary"
                  }
                  className="px-6 py-2 text-lg"
                >
                  {getStatusLabel(evaluation.status)}
                </Badge>
              </div>

              <Separator />

              {/* Translations Comparison */}
              <div className="space-y-4">
                <div>
                  <Label className="mb-2">Terjemahan Anda:</Label>
                  <div className="bg-muted rounded-lg p-4">
                    <p>{userTranslation}</p>
                  </div>
                </div>

                <div>
                  <Label className="mb-2">Terjemahan yang Benar:</Label>
                  <div className="bg-primary/10 rounded-lg p-4 border-2 border-primary/20">
                    <p className="font-medium">
                      {evaluation.correctTranslation}
                    </p>
                  </div>
                </div>

                {/* Feedback */}
                <div>
                  <Label className="mb-2">Feedback:</Label>
                  <div className="bg-muted rounded-lg p-4">
                    <p>{evaluation.feedback}</p>
                  </div>
                </div>
              </div>

              <Button onClick={generateSentence} className="w-full" size="lg">
                Latihan Soal Baru
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-card border-t mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>LernLang © 2026 - Belajar Bahasa Inggris dengan AI</p>
        </div>
      </footer>
    </div>
  );
}
