"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import LoadingScreen from "@/components/LoadingScreen";
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
import {
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
  Upload,
  ImageIcon,
  X,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
    return <LoadingScreen />;
  }

  if (!session || session.user.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f0f9f4]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Management Blog
              </h1>
              <p className="text-gray-500 text-sm">
                Kelola artikel dan konten blog
              </p>
            </div>
          </div>
          <Button onClick={openCreateDialog} className="gap-2">
            <Plus className="h-4 w-4" />
            Buat Blog Baru
          </Button>
        </div>

        {/* Blog Table */}
        <Card>
          <CardHeader>
            <CardTitle>Daftar Blog</CardTitle>
            <CardDescription>{blogs.length} blog ditemukan</CardDescription>
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
                    <TableRow>
                      <TableHead className="w-[80px]">Cover</TableHead>
                      <TableHead>Judul</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Penulis</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {blogs.map((blog) => (
                      <TableRow key={blog.id}>
                        <TableCell>
                          {blog.coverImage ? (
                            <div className="relative w-16 h-10 rounded overflow-hidden">
                              <Image
                                src={blog.coverImage}
                                alt={blog.title}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-10 rounded bg-gray-100 flex items-center justify-center">
                              <ImageIcon className="h-4 w-4 text-gray-400" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-sm line-clamp-1">
                              {blog.title}
                            </p>
                            <p className="text-xs text-gray-500 line-clamp-1">
                              /{blog.slug}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={blog.published ? "default" : "secondary"}
                            className={
                              blog.published
                                ? "bg-green-100 text-green-700 hover:bg-green-100"
                                : ""
                            }
                          >
                            {blog.published ? "Published" : "Draft"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">
                            {blog.author?.name || "Unknown"}
                          </p>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm text-gray-500">
                            {new Date(blog.createdAt).toLocaleDateString(
                              "id-ID",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              },
                            )}
                          </p>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleTogglePublish(blog)}
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
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(blog)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() =>
                                setDeleteDialog({ open: true, blog })
                              }
                              className="text-destructive hover:text-destructive"
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
                <div className="min-h-[300px] max-h-[400px] overflow-y-auto border rounded-lg p-4 bg-white prose prose-green prose-sm max-w-none">
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
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
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
