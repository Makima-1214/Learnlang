"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import LoadingScreen from "@/components/LoadingScreen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Plus, Users, Trash2, Star } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

export default function DiskusiPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [newRoom, setNewRoom] = useState({ name: "", description: "" });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchRooms();
    }
  }, [status, router]);

  const fetchRooms = async () => {
    try {
      const response = await fetch("/api/rooms");
      if (response.ok) {
        const data = await response.json();
        setRooms(data);
      }
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
      toast.error("Gagal memuat daftar room");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async () => {
    if (!newRoom.name.trim()) {
      toast.error("Nama room tidak boleh kosong");
      return;
    }

    setCreating(true);
    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRoom),
      });

      if (response.ok) {
        const room = await response.json();
        toast.success("Room berhasil dibuat");
        setRooms([
          room,
          ...rooms.filter((r) => !r.isDefault),
          ...rooms.filter((r) => r.isDefault),
        ]);
        setCreateDialogOpen(false);
        setNewRoom({ name: "", description: "" });
        // Navigate to the new room
        router.push(`/diskusi/${room.id}`);
      } else {
        const data = await response.json();
        toast.error(data.error || "Gagal membuat room");
      }
    } catch (error) {
      console.error("Failed to create room:", error);
      toast.error("Gagal membuat room");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteRoom = async () => {
    if (!selectedRoom) return;

    try {
      const response = await fetch(`/api/rooms/${selectedRoom.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Room berhasil dihapus");
        setRooms(rooms.filter((r) => r.id !== selectedRoom.id));
        setDeleteDialogOpen(false);
        setSelectedRoom(null);
      } else {
        const data = await response.json();
        toast.error(data.error || "Gagal menghapus room");
      }
    } catch (error) {
      console.error("Failed to delete room:", error);
      toast.error("Gagal menghapus room");
    }
  };

  const canDeleteRoom = (room) => {
    if (!session || room.isDefault) return false;
    return (
      room.createdById === session.user.id || session.user.role === "ADMIN"
    );
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

  if (loading || status === "loading") return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <MessageSquare className="w-8 h-8 text-primary" />
                Forum Diskusi
              </h1>
              <p className="mt-2 text-gray-600">
                Diskusikan berbagai topik belajar dengan pengguna lain secara
                real-time
              </p>
            </div>

            <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Buat Room Baru
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Buat Room Diskusi Baru</DialogTitle>
                  <DialogDescription>
                    Buat room untuk memulai diskusi topik tertentu
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Nama Room <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="Contoh: Belajar Grammar"
                      value={newRoom.name}
                      onChange={(e) =>
                        setNewRoom({ ...newRoom, name: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Deskripsi (opsional)
                    </label>
                    <Textarea
                      placeholder="Jelaskan topik diskusi room ini..."
                      value={newRoom.description}
                      onChange={(e) =>
                        setNewRoom({ ...newRoom, description: e.target.value })
                      }
                      rows={3}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setCreateDialogOpen(false)}
                  >
                    Batal
                  </Button>
                  <Button onClick={handleCreateRoom} disabled={creating}>
                    {creating ? "Membuat..." : "Buat Room"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {/* Room List */}
        {rooms.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Belum ada room diskusi
              </h3>
              <p className="text-gray-600 mb-6">
                Jadilah yang pertama membuat room diskusi!
              </p>
              <Button
                onClick={() => setCreateDialogOpen(true)}
                className="gap-2"
              >
                <Plus className="w-4 h-4" />
                Buat Room Pertama
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room, index) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className="hover:shadow-lg transition-all cursor-pointer group relative"
                  onClick={() => router.push(`/diskusi/${room.id}`)}
                >
                  {room.isDefault && (
                    <div className="absolute top-3 right-3">
                      <Badge className="bg-yellow-100 text-yellow-700 border-0 gap-1">
                        <Star className="w-3 h-3" />
                        Default
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2 pr-16">
                      <MessageSquare className="w-5 h-5 text-primary shrink-0" />
                      <span className="truncate">{room.name}</span>
                    </CardTitle>
                    {room.description && (
                      <CardDescription className="line-clamp-2">
                        {room.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{room._count.messages} pesan</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarImage
                            src={room.createdBy.avatar}
                            alt={room.createdBy.name}
                          />
                          <AvatarFallback className="text-xs bg-primary text-white">
                            {getInitials(room.createdBy.name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-gray-500 truncate max-w-25">
                          {room.createdBy.name}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-xs text-gray-400">
                        Dibuat{" "}
                        {formatDistanceToNow(new Date(room.createdAt), {
                          addSuffix: true,
                          locale: id,
                        })}
                      </span>
                      {canDeleteRoom(room) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRoom(room);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Room?</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus room "{selectedRoom?.name}"?
              Semua pesan di dalam room ini akan ikut terhapus.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRoom}
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
