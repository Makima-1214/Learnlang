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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, Trash2, Edit2, Eye, EyeOff, Plus, ImageIcon, Upload, X } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Custom Icon
const BlogMagicIcon = () => (
  <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    <path d="M12 6v6M9 9h6" stroke="#10B981" />
  </svg>
);

export default function AdminBlogsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Dialog states
  const [editorOpen, setEditorOpen] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    blog: null,
  });
  const [previewMode, setPreviewMode] = useState(false);

  // Form state
  const [form, setForm] = useState({
    title: "",
    content: "",
    excerpt: "",
    coverImage: "",
    published: false,
    slug: null, // null = creating new, string = editing existing
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      if (session.user.role !== "ADMIN") {
        router.push("/learn");
      } else {
        fetchBlogs();
      }
    }
  }, [status, session, router]);

  const fetchBlogs = async () => {
    try {
      const response = await fetch("/api/blogs?all=true");
      const data = await response.json();
      if (response.ok) {
        setBlogs(data);
      }
    } catch (error) {
      toast.error("Gagal memuat blog");
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setForm({
      title: "",
      content: "",
      excerpt: "",
      coverImage: "",
      published: false,
      slug: null,
    });
    setPreviewMode(false);
    setEditorOpen(true);
  };

  const openEditDialog = (blog) => {
    setForm({
      title: blog.title,
      content: blog.content,
      excerpt: blog.excerpt || "",
      coverImage: blog.coverImage || "",
      published: blog.published,
      slug: blog.slug,
    });
    setPreviewMode(false);
    setEditorOpen(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setActionLoading(true);
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        setForm((prev) => ({ ...prev, coverImage: data.url }));
        toast.success("Gambar berhasil diupload");
      } else {
        toast.error(data.error || "Gagal upload gambar");
      }
    } catch (error) {
      toast.error("Gagal upload gambar");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Judul dan konten harus diisi");
      return;
    }

    setActionLoading(true);
    try {
      const isEditing = form.slug !== null;
      const url = isEditing ? `/api/blogs/${form.slug}` : "/api/blogs";
      const method = isEditing ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          content: form.content,
          excerpt: form.excerpt,
          coverImage: form.coverImage,
          published: form.published,
        }),
      });

      if (response.ok) {
        toast.success(
          isEditing ? "Blog berhasil diperbarui" : "Blog berhasil dibuat",
        );
        setEditorOpen(false);
        fetchBlogs();
      } else {
        const data = await response.json();
        toast.error(data.error || "Gagal menyimpan blog");
      }
    } catch (error) {
      toast.error("Gagal menyimpan blog");
    } finally {
      setActionLoading(false);
    }
  };

  const handleTogglePublish = async (blog) => {
    try {
      const response = await fetch(`/api/blogs/${blog.slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ published: !blog.published }),
      });
      if (response.ok) {
        toast.success(blog.published ? "Blog di-draft" : "Blog dipublikasikan");
        fetchBlogs();
      }
    } catch (error) {
      toast.error("Gagal mengubah status");
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.blog) return;
    setActionLoading(true);
    try {
      const response = await fetch(`/api/blogs/${deleteDialog.blog.slug}`, {
        method: "DELETE",
      });
      if (response.ok) {
        toast.success("Blog berhasil dihapus");
        setDeleteDialog({ open: false, blog: null });
        fetchBlogs();
      }
    } catch (error) {
      toast.error("Gagal menghapus blog");
    } finally {
      setActionLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return null;
  }

  if (!session || session.user.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-white font-[family-name:var(--font-nunito)]">
      <style dangerouslySetInnerHTML={{ __html: `
        .duo-card { border-bottom-width: 6px; border-radius: 1.5rem; transition: all 0.2s; }
        .duo-btn-primary { border-bottom-width: 4px; border-radius: 1rem; transition: all 0.1s; }
        .duo-btn-primary:active { transform: translateY(2px); border-bottom-width: 0; margin-bottom: 4px; }
      `}} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10 bg-emerald-500 p-8 rounded-[2rem] border-4 border-b-8 border-emerald-700 text-white shadow-xl">
          <div className="flex items-center gap-4">
            <div className="bg-white p-3 rounded-2xl shadow-inner text-emerald-500">
              <BlogMagicIcon />
            </div>
            <div>
              <h1 className="text-3xl font-black">Management Blog</h1>
              <p className="font-bold opacity-90 text-sm">
                Tulis artikel keren untuk menginspirasi pelajar
              </p>
            </div>
          </div>
          <Button 
            onClick={openCreateDialog} 
            className="duo-btn-primary bg-white text-emerald-600 font-black hover:bg-emerald-50 border-emerald-200 px-8 py-6 text-lg"
          >
            <Plus className="h-4 w-4" />
            Buat Blog Baru
          </Button>
        </div>

        {/* Blog Table */}
        <Card className="duo-card border-4 border-gray-100 shadow-none overflow-hidden">
          <CardHeader>
            <CardTitle className="font-black text-xl">Daftar Blog</CardTitle>
            <CardDescription className="font-bold">{blogs.length} blog ditemukan dalam database</CardDescription>
          </CardHeader>
          <CardContent>
            {blogs.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <ImageIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Belum ada blog</p>
                <p className="text-sm">
                  Klik &ldquo;Buat Blog Baru&rdquo; untuk memulai
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-b-2">
                      <TableHead className="w-20 font-black text-gray-400">Cover</TableHead>
                      <TableHead className="font-black text-gray-400">Judul</TableHead>
                      <TableHead className="font-black text-gray-400">Status</TableHead>
                      <TableHead className="font-black text-gray-400">Penulis</TableHead>
                      <TableHead className="font-black text-gray-400">Tanggal</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {blogs.map((blog) => (
                      <TableRow key={blog.id}>
                        <TableCell>
                          {blog.coverImage ? (
                            <div className="relative w-16 h-10 rounded-lg overflow-hidden border-2 border-gray-100">
                              <Image
                                src={blog.coverImage}
                                alt={blog.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-10 rounded-lg bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center">
                              <ImageIcon className="h-4 w-4 text-gray-400" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-black text-gray-800 line-clamp-1">
                              {blog.title}
                            </p>
                            <p className="text-xs text-gray-500 line-clamp-1">
                              /{blog.slug}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`font-black rounded-lg border-2 ${
                              blog.published
                                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                : "bg-gray-50 text-gray-400 border-gray-100"
                            }`}
                          >
                            {blog.published ? "Published" : "Draft"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm font-bold">{blog.author?.name || "Unknown"}</p>
                        </TableCell>
                        <TableCell className="text-xs font-bold text-gray-400">
                            {new Date(blog.createdAt).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              className="bg-white border-2 border-b-4 border-gray-200 text-gray-500 hover:bg-gray-50 h-9 w-9 p-0"
                              title={
                                blog.published
                                  ? "Jadikan Draft"
                                  : "Publikasikan"
                              }
                            >
                              {blog.published ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              className="bg-white border-2 border-b-4 border-gray-200 text-indigo-500 hover:bg-indigo-50 h-9 w-9 p-0"
                              onClick={() => openEditDialog(blog)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              className="bg-white border-2 border-b-4 border-red-100 text-red-500 hover:bg-red-50 h-9 w-9 p-0 text-destructive hover:text-destructive"
                              onClick={() =>
                                setDeleteDialog({ open: true, blog })
                              }
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

      {/* Blog Editor Dialog */}
      <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {form.slug ? "Edit Blog" : "Buat Blog Baru"}
            </DialogTitle>
            <DialogDescription>
              Gunakan format Markdown untuk menulis konten blog.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Judul</Label>
              <Input
                id="title"
                placeholder="Masukkan judul blog..."
                value={form.title}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, title: e.target.value }))
                }
              />
            </div>

            {/* Excerpt */}
            <div className="space-y-2">
              <Label htmlFor="excerpt">Ringkasan</Label>
              <Textarea
                id="excerpt"
                placeholder="Ringkasan singkat blog (opsional)..."
                rows={2}
                value={form.excerpt}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, excerpt: e.target.value }))
                }
              />
            </div>

            {/* Cover Image */}
            <div className="space-y-2">
              <Label>Cover Image</Label>
              <div className="flex items-center gap-4">
                {form.coverImage ? (
                  <div className="relative w-32 h-20 rounded-lg overflow-hidden border">
                    <Image
                      src={form.coverImage}
                      alt="Cover"
                      fill
                      className="object-cover"
                    />
                    <button
                      onClick={() =>
                        setForm((prev) => ({ ...prev, coverImage: "" }))
                      }
                      className="absolute top-1 right-1 bg-black/50 rounded-full p-0.5 hover:bg-black/70"
                    >
                      <X className="h-3 w-3 text-white" />
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-gray-400" />
                  </div>
                )}
                <div>
                  <Label
                    htmlFor="coverUpload"
                    className="cursor-pointer inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-300 text-sm hover:bg-gray-50 transition-colors"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Gambar
                  </Label>
                  <input
                    id="coverUpload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    JPG, PNG, GIF, WebP. Maks 5MB.
                  </p>
                </div>
              </div>
            </div>

            {/* Content with Preview Toggle */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Konten (Markdown)</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewMode(!previewMode)}
                >
                  {previewMode ? "Editor" : "Preview"}
                </Button>
              </div>
              {previewMode ? (
                <div className="min-h-75 max-h-100 overflow-y-auto border rounded-lg p-4 bg-white prose prose-green prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {form.content || "*Belum ada konten*"}
                  </ReactMarkdown>
                </div>
              ) : (
                <Textarea
                  placeholder="Tulis konten blog menggunakan format Markdown..."
                  rows={14}
                  className="font-mono text-sm"
                  value={form.content}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, content: e.target.value }))
                  }
                />
              )}
            </div>

            {/* Published Toggle */}
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      published: e.target.checked,
                    }))
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-0.5 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
              <span className="text-sm font-medium">
                {form.published ? "Published" : "Draft"}
              </span>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditorOpen(false)}
              disabled={actionLoading}
            >
              Batal
            </Button>
            <Button onClick={handleSave} disabled={actionLoading}>
              {actionLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {form.slug ? "Simpan Perubahan" : "Buat Blog"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog((prev) => ({ ...prev, open }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Blog</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus blog{" "}
              <strong>&ldquo;{deleteDialog.blog?.title}&rdquo;</strong>?
              Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={actionLoading}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {actionLoading && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

