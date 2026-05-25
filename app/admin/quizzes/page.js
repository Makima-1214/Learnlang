"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Trash2, Edit2, Plus, Play, Clock, BarChart3, Layers } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

// ── Custom Bespoke SVG Icons ──────────────────────────────────────────────────

const QuizMagicIcon = () => (
  <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21c-5-1.5-10-1.5-10-1.5V5.5c0 0 5 0 10 1.5 5-1.5 10-1.5 10-1.5v14c0 0-5 0-10 1.5Z" />
    <path d="M12 7v14" />
    <path d="M15 4l.5.5M18 3l.5.5M19 6l.5.5" stroke="#A855F7" />
    <circle cx="12" cy="12" r="2" fill="#A855F7" fillOpacity="0.2" />
  </svg>
);

const PathNodeIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.2" />
    <path d="M12 3v6M12 15v6M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
    <path d="m19 9-2 2M5 15l2-2M19 15l-2-2M5 9l2 2" opacity="0.5" />
  </svg>
);

const BrainEnergyIcon = () => (
  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96-.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3A2.5 2.5 0 0 1 9.5 2Z" fill="currentColor" opacity="0.1" />
    <path d="M13 10h7l-9 13v-9H4l9-13v9z" fill="#F59E0B" fillOpacity="0.2" />
  </svg>
);

export default function AdminQuizzesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, quiz: null });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      if (session.user.role !== "ADMIN") {
        router.push("/learn");
      } else {
        fetchQuizzes();
      }
    }
  }, [status, session, router]);

  const fetchQuizzes = async () => {
    try {
      const response = await fetch("/api/admin/quizzes");
      const data = await response.json();
      if (response.ok) {
        setQuizzes(data);
      }
    } catch (error) {
      toast.error("Gagal memuat kuis");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.quiz) return;
    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/quizzes/${deleteDialog.quiz.id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast.success("Kuis berhasil dihapus");
        setDeleteDialog({ open: false, quiz: null });
        fetchQuizzes();
      } else {
        toast.error("Gagal menghapus kuis");
      }
    } catch (error) {
      toast.error("Terjadi kesalahan");
    } finally {
      setActionLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="h-10 w-10 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-[family-name:var(--font-nunito)]">
      <style dangerouslySetInnerHTML={{ __html: `
        .duo-card { border-bottom-width: 6px; border-radius: 1.5rem; transition: all 0.2s; }
        .duo-btn-primary { border-bottom-width: 4px; border-radius: 1rem; transition: all 0.1s; }
        .duo-btn-primary:active { transform: translateY(2px); border-bottom-width: 0; margin-bottom: 4px; }
      `}} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10 bg-violet-500 p-8 rounded-[2.5rem] border-4 border-b-8 border-violet-700 text-white shadow-xl relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="flex items-center gap-5 relative z-10">
            <div className="bg-white p-3 rounded-2xl shadow-inner text-violet-600">
              <QuizMagicIcon />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">Level & Kuis</h1>
              <p className="font-bold opacity-90 text-sm">
                Atur alur belajar dan tantangan untuk para pelajar
              </p>
            </div>
          </div>
          <Link href="/admin/quizzes/create" className="relative z-10">
            <Button className="duo-btn-primary bg-white text-violet-600 font-black hover:bg-violet-50 border-violet-200 px-8 py-6 text-lg">
              <Plus className="mr-2 h-5 w-5" />
              Buat Kuis Baru
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { label: "Total Kuis", value: quizzes.length, icon: <Layers className="text-violet-500" />, bg: "bg-violet-50", border: "border-violet-100" },
            { label: "Kuis Aktif", value: quizzes.filter(q => q.published).length, icon: <Play className="text-emerald-500" />, bg: "bg-emerald-50", border: "border-emerald-100" },
            { label: "Total Pertanyaan", value: quizzes.reduce((acc, q) => acc + (q._count?.questions || 0), 0), icon: <BarChart3 className="text-amber-500" />, bg: "bg-amber-50", border: "border-amber-100" },
          ].map((stat, i) => (
            <Card key={i} className={`duo-card border-4 ${stat.border} shadow-none ${stat.bg}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="font-black uppercase text-[10px] tracking-widest text-gray-500">{stat.label}</CardDescription>
                  {stat.icon}
                </div>
                <CardTitle className="text-4xl font-black text-gray-800">{stat.value}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Quizzes Table */}
        <Card className="duo-card border-4 border-gray-100 shadow-none overflow-hidden">
          <CardHeader className="border-b-4 border-gray-50 bg-gray-50/30">
            <CardTitle className="text-xl font-black flex items-center gap-2">
              <PathNodeIcon />
              Learning Path Structure
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {quizzes.length === 0 ? (
              <div className="text-center py-20">
                <BrainEnergyIcon />
                <p className="mt-4 text-gray-400 font-bold">Belum ada kuis yang dibuat.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-b-2">
                      <TableHead className="w-24 text-center font-black text-gray-400">Level</TableHead>
                      <TableHead className="font-black text-gray-400">Kuis & Deskripsi</TableHead>
                      <TableHead className="text-center font-black text-gray-400">Soal</TableHead>
                      <TableHead className="text-center font-black text-gray-400">Durasi</TableHead>
                      <TableHead className="text-center font-black text-gray-400">Status</TableHead>
                      <TableHead className="text-right font-black text-gray-400 pr-8">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {quizzes.sort((a,b) => a.order - b.order).map((quiz) => (
                      <TableRow key={quiz.id} className="group hover:bg-violet-50/30 transition-colors">
                        <TableCell className="text-center">
                          <div 
                            className="inline-flex items-center justify-center w-10 h-10 rounded-xl border-2 border-b-4 font-black text-white shadow-sm"
                            style={{ backgroundColor: quiz.color || '#8B5CF6', borderColor: 'rgba(0,0,0,0.1)' }}
                          >
                            {quiz.order + 1}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <span className="text-2xl grayscale group-hover:grayscale-0 transition-all">{quiz.icon || "📚"}</span>
                            <div>
                              <p className="font-black text-gray-800 leading-none mb-1">{quiz.title}</p>
                              <p className="text-xs text-gray-400 font-bold line-clamp-1">{quiz.description}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="font-black border-2 rounded-lg">
                            {quiz._count?.questions || 0} Pertanyaan
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1 text-xs font-bold text-gray-500">
                            <Clock className="w-3 h-3" />
                            {quiz.timeLimit ? `${quiz.timeLimit}m` : "∞"}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge 
                            className={`font-black rounded-lg border-2 ${
                              quiz.published 
                                ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                                : "bg-gray-50 text-gray-400 border-gray-100"
                            }`}
                          >
                            {quiz.published ? "Published" : "Draft"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-8">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/admin/quizzes/${quiz.id}/edit`}>
                              <Button 
                                size="sm" 
                                className="bg-white border-2 border-b-4 border-gray-200 text-violet-600 hover:bg-violet-50 hover:border-violet-200 h-9 w-9 p-0"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button 
                              size="sm" 
                              className="bg-white border-2 border-b-4 border-red-100 text-red-500 hover:bg-red-50 h-9 w-9 p-0"
                              onClick={() => setDeleteDialog({ open: true, quiz })}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog 
        open={deleteDialog.open} 
        onOpenChange={(open) => setDeleteDialog(prev => ({ ...prev, open }))}
      >
        <AlertDialogContent className="rounded-[2rem] border-4 border-b-8">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black">Hapus Kuis?</AlertDialogTitle>
            <AlertDialogDescription className="font-bold text-gray-500">
              Apakah kamu yakin ingin menghapus kuis <span className="text-red-500">&quot;{deleteDialog.quiz?.title}&quot;</span>? 
              Semua data hasil kuis user juga akan ikut terhapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="duo-btn-primary rounded-xl font-black border-2 border-b-4">Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={actionLoading}
              className="duo-btn-primary rounded-xl font-black bg-red-500 hover:bg-red-600 border-red-700 border-2 border-b-4"
            >
              {actionLoading ? <Loader2 className="animate-spin" /> : "Ya, Hapus Sekarang"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}