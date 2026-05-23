"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import LoadingScreen from "@/components/LoadingScreen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Save, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function CreateQuizPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    published: false,
    questions: [
      {
        question: "",
        options: [
          { option: "", isCorrect: false },
          { option: "", isCorrect: false },
        ],
      },
    ],
  });

  if (status === "loading") return <LoadingScreen />;

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  if (session?.user?.role !== "ADMIN") {
    router.push("/");
    return null;
  }

  const handleAddQuestion = () => {
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        {
          question: "",
          options: [
            { option: "", isCorrect: false },
            { option: "", isCorrect: false },
          ],
        },
      ],
    });
  };

  const handleRemoveQuestion = (index) => {
    const newQuestions = formData.questions.filter((_, i) => i !== index);
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleQuestionChange = (index, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[index].question = value;
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleAddOption = (questionIndex) => {
    const newQuestions = [...formData.questions];
    newQuestions[questionIndex].options.push({ option: "", isCorrect: false });
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleRemoveOption = (questionIndex, optionIndex) => {
    const newQuestions = [...formData.questions];
    newQuestions[questionIndex].options = newQuestions[
      questionIndex
    ].options.filter((_, i) => i !== optionIndex);
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleOptionChange = (questionIndex, optionIndex, value) => {
    const newQuestions = [...formData.questions];
    newQuestions[questionIndex].options[optionIndex].option = value;
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleCorrectChange = (questionIndex, optionIndex) => {
    const newQuestions = [...formData.questions];
    // Set all to false first (only one correct answer)
    newQuestions[questionIndex].options.forEach((opt) => {
      opt.isCorrect = false;
    });
    // Set selected to true
    newQuestions[questionIndex].options[optionIndex].isCorrect = true;
    setFormData({ ...formData, questions: newQuestions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error("Judul quiz harus diisi");
      return;
    }

    if (formData.questions.length === 0) {
      toast.error("Minimal harus ada 1 pertanyaan");
      return;
    }

    for (let i = 0; i < formData.questions.length; i++) {
      const q = formData.questions[i];
      if (!q.question.trim()) {
        toast.error(`Pertanyaan ${i + 1} harus diisi`);
        return;
      }
      if (q.options.length < 2) {
        toast.error(`Pertanyaan ${i + 1} harus memiliki minimal 2 opsi`);
        return;
      }
      if (!q.options.some((opt) => opt.isCorrect)) {
        toast.error(`Pertanyaan ${i + 1} harus memiliki 1 jawaban benar`);
        return;
      }
      if (q.options.some((opt) => !opt.option.trim())) {
        toast.error(`Semua opsi di pertanyaan ${i + 1} harus diisi`);
        return;
      }
    }

    setLoading(true);
    try {
      const response = await fetch("/api/admin/quizzes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Quiz berhasil dibuat");
        router.push("/admin/quizzes");
      } else {
        const error = await response.json();
        toast.error(error.error || "Gagal membuat quiz");
      }
    } catch (error) {
      console.error("Failed to create quiz:", error);
      toast.error("Gagal membuat quiz");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/admin/quizzes")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Buat Quiz Baru</h1>
          <p className="mt-2 text-gray-600">
            Buat quiz dengan pertanyaan pilihan ganda
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Quiz</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Judul Quiz *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Contoh: Quiz Vocabulary Dasar"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Deskripsi singkat tentang quiz ini..."
                  rows={3}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="published">Publikasikan Quiz</Label>
                  <p className="text-sm text-gray-500">
                    Quiz yang dipublikasikan dapat dilihat oleh pengguna
                  </p>
                </div>
                <Switch
                  id="published"
                  checked={formData.published}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, published: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Pertanyaan ({formData.questions.length})
              </h2>
              <Button
                type="button"
                variant="outline"
                onClick={handleAddQuestion}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Tambah Pertanyaan
              </Button>
            </div>

            {formData.questions.map((question, qIndex) => (
              <Card key={qIndex}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      Pertanyaan {qIndex + 1}
                    </CardTitle>
                    {formData.questions.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveQuestion(qIndex)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Kata/Kalimat *</Label>
                    <Input
                      value={question.question}
                      onChange={(e) =>
                        handleQuestionChange(qIndex, e.target.value)
                      }
                      placeholder="Contoh: apple"
                      required
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Opsi Jawaban *</Label>
                      {question.options.length < 3 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleAddOption(qIndex)}
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Tambah Opsi
                        </Button>
                      )}
                    </div>
                    <div className="space-y-2">
                      {question.options.map((option, oIndex) => (
                        <div key={oIndex} className="flex items-center gap-2">
                          <Input
                            value={option.option}
                            onChange={(e) =>
                              handleOptionChange(qIndex, oIndex, e.target.value)
                            }
                            placeholder={`Opsi ${oIndex + 1}`}
                            required
                          />
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name={`correct-${qIndex}`}
                              checked={option.isCorrect}
                              onChange={() =>
                                handleCorrectChange(qIndex, oIndex)
                              }
                              className="w-4 h-4"
                            />
                            <Label className="text-sm whitespace-nowrap">
                              Benar
                            </Label>
                          </div>
                          {question.options.length > 2 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveOption(qIndex, oIndex)}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/quizzes")}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading} className="gap-2">
              <Save className="w-4 h-4" />
              {loading ? "Menyimpan..." : "Simpan Quiz"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
