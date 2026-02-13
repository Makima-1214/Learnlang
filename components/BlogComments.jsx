"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
import { toast } from "sonner";
import { Trash2, Send, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import Link from "next/link";

export default function BlogComments({ slug }) {
  const { data: session } = useSession();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    fetchComments();
  }, [slug]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/blogs/${slug}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments);
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();

    if (!session) {
      toast.error("Silakan login untuk berkomentar");
      return;
    }

    if (!newComment.trim()) {
      toast.error("Komentar tidak boleh kosong");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/blogs/${slug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });

      if (response.ok) {
        toast.success("Komentar berhasil ditambahkan");
        setNewComment("");
        fetchComments();
      } else {
        const data = await response.json();
        toast.error(data.error || "Gagal menambahkan komentar");
      }
    } catch (error) {
      console.error("Failed to submit comment:", error);
      toast.error("Gagal menambahkan komentar");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Komentar berhasil dihapus");
        fetchComments();
      } else {
        const data = await response.json();
        toast.error(data.error || "Gagal menghapus komentar");
      }
    } catch (error) {
      console.error("Failed to delete comment:", error);
      toast.error("Gagal menghapus komentar");
    } finally {
      setDeleteId(null);
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

  const canDeleteComment = (comment) => {
    if (!session) return false;
    return session.user.id === comment.userId || session.user.role === "ADMIN";
  };

  return (
    <div className="border-t border-gray-200 pt-6">
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle className="w-5 h-5" />
        <h3 className="text-lg font-semibold">
          Komentar ({comments?.length || 0})
        </h3>
      </div>

      {/* Comment Form */}
      {session ? (
        <form onSubmit={handleSubmitComment} className="mb-8">
          <Textarea
            placeholder="Tulis komentar Anda..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="mb-3"
            rows={3}
            disabled={submitting}
          />
          <Button type="submit" disabled={submitting || !newComment.trim()}>
            <Send className="w-4 h-4 mr-2" />
            {submitting ? "Mengirim..." : "Kirim Komentar"}
          </Button>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">
            <Link
              href="/login"
              className="text-primary hover:underline font-medium"
            >
              Login
            </Link>{" "}
            untuk menulis komentar
          </p>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Memuat komentar...</div>
      ) : !comments || comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Belum ada komentar. Jadilah yang pertama berkomentar!
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="flex gap-4 p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
            >
              {/* Avatar */}
              <div className="shrink-0">
                <Avatar className="w-10 h-10">
                  <AvatarImage
                    src={comment.user.avatar}
                    alt={comment.user.name}
                  />
                  <AvatarFallback className="bg-primary text-white font-semibold">
                    {getInitials(comment.user.name)}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Comment Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <p className="font-medium text-gray-900">
                      {comment.user.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(comment.createdAt), {
                        addSuffix: true,
                        locale: id,
                      })}
                    </p>
                  </div>

                  {/* Delete Button */}
                  {canDeleteComment(comment) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeleteId(comment.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                <p className="text-gray-700 whitespace-pre-wrap wrap-break-word">
                  {comment.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Komentar?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Komentar akan dihapus secara
              permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDeleteComment(deleteId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
