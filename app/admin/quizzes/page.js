"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import LoadingScreen from "@/components/LoadingScreen";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Eye, EyeOff, BookOpen, Users } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AdminQuizzesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role !== "ADMIN") {
      router.push("/");
    } else if (status === "authenticated") {
      fetchQuizzes();
    }
  }, [status, session, router]);

  const fetchQuizzes = async () => {
    try {
      const response = await fetch("/api/admin/quizzes");
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

  const handleDelete = async (id) => {
    setSelectedQuizId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedQuizId) return;

    try {
      const response = await fetch(`/api/admin/quizzes/${selectedQuizId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Quiz berhasil dihapus");
        setDeleteDialogOpen(false);
        setSelectedQuizId(null);
        fetchQuizzes();
      } else {
        toast.error("Gagal menghapus quiz");
      }
    } catch (error) {
      console.error("Failed to delete quiz:", error);
      toast.error("Gagal menghapus quiz");
    }
  };

  const handleTogglePublish = async (quiz) => {
    try {
      const response = await fetch(`/api/admin/quizzes/${quiz.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: quiz.title,
          description: quiz.description,
          published: !quiz.published,
          questions: quiz.questions || [],
        }),
      });

      if (response.ok) {
        toast.success(
          quiz.published ? "Quiz disembunyikan" : "Quiz dipublikasikan",
        );
        fetchQuizzes();
      } else {
        toast.error("Gagal mengubah status publikasi");
      }
    } catch (error) {
      console.error("Failed to toggle publish:", error);
      toast.error("Gagal mengubah status publikasi");
    }
  };

  if (loading || status === "loading") return <LoadingScreen />;

  if (session?.user?.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Manajemen Quiz
              </h1>
              <p className="mt-2 text-gray-600">
                Kelola quiz untuk pengguna LernLang
              </p>
            </div>
            <Button
              onClick={() => router.push("/admin/quizzes/create")}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Buat Quiz Baru
            </Button>
          </div>
        </div>

        {/* Quiz List */}
        {quizzes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Belum ada quiz
              </h3>
              <p className="text-gray-600 mb-6">
                Mulai dengan membuat quiz pertama Anda
              </p>
              <Button
                onClick={() => router.push("/admin/quizzes/create")}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Buat Quiz Baru
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {quizzes.map((quiz) => (
              <Card key={quiz.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <CardTitle className="text-xl">{quiz.title}</CardTitle>
                        {quiz.published ? (
                          <Badge className="bg-green-100 text-green-700 border-0">
                            <Eye className="w-3 h-3 mr-1" />
                            Dipublikasikan
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-gray-600">
                            <EyeOff className="w-3 h-3 mr-1" />
                            Draft
                          </Badge>
                        )}
                      </div>
                      {quiz.description && (
                        <p className="text-sm text-gray-600 mt-2">
                          {quiz.description}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        <span>{quiz._count.questions} pertanyaan</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{quiz._count.results} peserta</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTogglePublish(quiz)}
                      >
                        {quiz.published ? (
                          <>
                            <EyeOff className="w-4 h-4 mr-2" />
                            Sembunyikan
                          </>
                        ) : (
                          <>
                            <Eye className="w-4 h-4 mr-2" />
                            Publikasikan
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          router.push(`/admin/quizzes/edit/${quiz.id}`)
                        }
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(quiz.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Hapus
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Quiz?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus quiz ini? Tindakan ini tidak
              dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
