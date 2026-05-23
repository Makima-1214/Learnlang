"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import LoadingScreen from "@/components/LoadingScreen";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { toast } from "sonner";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

// ==================================================
// CUSTOM SVG ICONS — Gamified, handcrafted & unique
// ==================================================

const SparkleIcon = () => (
  <svg className="w-4 h-4 text-yellow-300 animate-spin" style={{ animationDuration: '6s' }} viewBox="0 0 16 16" fill="none">
    <path d="M8 0L9.5 5.5L15 7L9.5 8.5L8 14L6.5 8.5L1 7L6.5 5.5L8 0Z" fill="currentColor" />
  </svg>
);

const DiscussBubbleIcon = () => (
  <svg className="w-16 h-16 drop-shadow-md" viewBox="0 0 80 80" fill="none">
    {/* Left speech bubble */}
    <path d="M15 45c0-10 10-15 22-15s22 5 22 15-10 15-22 15c-3 0-6-.5-9-1.5L17 61l2.5-9.5C16.5 49.5 15 47.5 15 45z" fill="#93C5FD" stroke="#1E3A8A" strokeWidth="3.5" strokeLinejoin="round" />
    {/* Right speech bubble */}
    <path d="M35 32c0-8 8-12 18-12s18 4 18 12-8 12-18 12c-2.5 0-5-.5-7.5-1.2L20 45l2-7.5C21 35.5 35 34.5 35 32z" fill="#E9D5FF" stroke="#581C87" strokeWidth="3.5" strokeLinejoin="round" />
    {/* Chat details */}
    <rect x="27" y="42" width="12" height="3" rx="1.5" fill="#1E3A8A" />
    <rect x="27" y="48" width="8" height="3" rx="1.5" fill="#1E3A8A" />
  </svg>
);

const PlusIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const StarBadgeIcon = () => (
  <svg className="w-4 h-4 text-amber-500 fill-amber-400" viewBox="0 0 16 16" fill="none">
    <path d="M8 12.27L12.94 15.29L11.64 9.68L16 5.86L10.24 5.38L8 0L5.76 5.38L0 5.86L4.36 9.68L3.06 15.29L8 12.27Z" />
  </svg>
);

const MessageCountIcon = () => (
  <svg className="w-4 h-4 text-[#0288D1]" viewBox="0 0 16 16" fill="none">
    <path d="M14 10.5c0 .83-.67 1.5-1.5 1.5H4L1.5 14.5V3.5c0-.83.67-1.5 1.5-1.5h9.5c.83 0 1.5.67 1.5 1.5v7z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

const EmptyDiscussIcon = () => (
  <svg className="w-24 h-24 mx-auto mb-6 drop-shadow-md" viewBox="0 0 100 100" fill="none">
    <circle cx="50" cy="50" r="40" fill="#F0F7FF" stroke="#93C5FD" strokeWidth="3" />
    <path d="M35 48c0-5 6-8 15-8s15 3 15 8-6 8-15 8c-2 0-4-.5-6-1.2L30 58l1.8-5.8C30.6 51 35 49.5 35 48z" fill="#DBEAFE" stroke="#1E40AF" strokeWidth="2.5" />
    {/* Floating question mark */}
    <circle cx="70" cy="30" r="10" fill="#3B82F6" />
    <text x="70" y="35" textAnchor="middle" fill="white" fontSize="13" fontWeight="bold">?</text>
  </svg>
);

// ==================================================

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
    <DashboardLayout>
      <style dangerouslySetInnerHTML={{
        __html: `
        .cloud-bg {
          position: absolute;
          background: white;
          border-radius: 999px;
          opacity: 0.7;
          border: 3px solid #E2E8F0;
        }
        .duo-btn {
          border-bottom-width: 4px;
          transition: all 0.1s ease;
        }
        .duo-btn:hover {
          transform: translateY(-2px);
          border-bottom-width: 6px;
        }
        .duo-btn:active {
          transform: translateY(4px);
          border-bottom-width: 0px;
        }
      `}} />

      <div className="min-h-[calc(100vh-4rem)] bg-white relative w-full font-[family-name:var(--font-nunito)]">

        {/* Cloud Decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="cloud-bg w-48 h-16 top-12 -left-12 shadow-sm animate-[bounce_4s_infinite]" />
          <div className="cloud-bg w-64 h-20 top-32 -right-16 shadow-sm animate-[bounce_5s_infinite]" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 flex flex-col gap-10 relative z-10">

          {/* ── Hero Banner — Gamified ── */}
          <motion.section
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="overflow-hidden rounded-3xl bg-gradient-to-r from-[#0284C7] to-[#0EA5E9] p-8 sm:p-12 text-white shadow-xl border-4 border-b-8 border-[#0369A1] relative"
          >
            <div className="flex flex-col gap-5 relative z-10">
              <div className="inline-flex items-center gap-2 rounded-xl bg-white/20 backdrop-blur-sm px-4 py-2 text-sm font-black text-white border-2 border-white/30 shadow-sm w-fit uppercase tracking-wider">
                💬 Forum Diskusi
              </div>

              <div className="max-w-2xl flex items-center justify-between gap-6">
                <div>
                  <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4 drop-shadow-md leading-tight">
                    Mari Berdiskusi!
                  </h1>
                  <p className="text-lg sm:text-xl text-white/90 font-bold leading-relaxed max-w-xl">
                    Bertanya, berbagi materi, atau sekadar berlatih mengetik kalimat bahasa Inggris dengan komunitas.
                  </p>
                </div>
                <div className="hidden sm:block">
                  <DiscussBubbleIcon />
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mt-2">
                {[
                  ["Aktif", "24/7 Komunitas"],
                  ["Topik", "Grammar & Vocab"],
                  ["AI", "Detektor Kalimat"],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-2xl border-4 border-[#0369A1] bg-white text-[#0369A1] px-5 py-3 shadow-[0_4px_0_#0369A1] transform hover:-translate-y-1 active:translate-y-1 active:shadow-none transition-all cursor-default">
                    <div className="text-xl font-black leading-none mb-1">{value}</div>
                    <div className="text-[10px] font-bold opacity-80 uppercase tracking-widest">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>

          {/* ── List Rooms ── */}
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <h3 className="text-2xl font-black text-gray-950">Daftar Room Diskusi</h3>

              <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                <DialogTrigger asChild>
                  <button className="px-5 py-3.5 bg-[#0284C7] hover:bg-[#0EA5E9] text-white border-b-4 border-[#0369A1] rounded-2xl font-black text-sm duo-btn flex items-center justify-center gap-2 shadow-sm">
                    <PlusIcon />
                    Buat Room Baru
                  </button>
                </DialogTrigger>
                <DialogContent className="rounded-3xl border-4 border-gray-200 p-6">
                  <DialogHeader>
                    <DialogTitle className="text-2xl font-black text-gray-950">Buat Room Diskusi Baru</DialogTitle>
                    <DialogDescription className="font-bold text-gray-500">
                      Buat ruang baru untuk berdiskusi tentang subjek pembelajaran tertentu.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div>
                      <label className="text-sm font-black text-gray-800 mb-2 block">
                        Nama Room <span className="text-red-500">*</span>
                      </label>
                      <Input
                        placeholder="Contoh: Diskusi Grammar Dasar"
                        value={newRoom.name}
                        onChange={(e) =>
                          setNewRoom({ ...newRoom, name: e.target.value })
                        }
                        className="rounded-xl border-2 border-gray-200 px-4 py-3 font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-black text-gray-800 mb-2 block">
                        Deskripsi (opsional)
                      </label>
                      <Textarea
                        placeholder="Jelaskan apa yang ingin kamu bahas di sini..."
                        value={newRoom.description}
                        onChange={(e) =>
                          setNewRoom({ ...newRoom, description: e.target.value })
                        }
                        className="rounded-xl border-2 border-gray-200 px-4 py-3 font-bold"
                        rows={3}
                      />
                    </div>
                  </div>
                  <DialogFooter className="gap-2 sm:gap-0">
                    <button
                      onClick={() => setCreateDialogOpen(false)}
                      className="px-5 py-3 rounded-2xl font-black text-sm border-2 border-gray-200 hover:bg-gray-50 text-gray-700"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleCreateRoom}
                      disabled={creating}
                      className="px-5 py-3 bg-[#0284C7] hover:bg-[#0EA5E9] text-white rounded-2xl font-black text-sm"
                    >
                      {creating ? "Membuat..." : "Buat Room"}
                    </button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {rooms.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-16 px-6 bg-white rounded-3xl border-4 border-b-8 border-gray-200 shadow-sm"
              >
                <EmptyDiscussIcon />
                <h2 className="text-2xl font-black text-gray-900 mb-2">
                  Belum ada room diskusi
                </h2>
                <p className="text-sm font-bold text-gray-500 max-w-sm mx-auto mb-6">
                  Jadilah petualang pertama yang mendirikan room diskusi di sini!
                </p>
                <button
                  onClick={() => setCreateDialogOpen(true)}
                  className="px-5 py-3 bg-[#0284C7] hover:bg-[#0EA5E9] text-white border-b-4 border-[#0369A1] rounded-2xl font-black text-sm duo-btn inline-flex items-center gap-2 shadow-sm"
                >
                  <PlusIcon />
                  Buat Room Pertama
                </button>
              </motion.div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {rooms.map((room, index) => (
                  <motion.div
                    key={room.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => router.push(`/diskusi/${room.id}`)}
                    className="cursor-pointer group flex flex-col"
                  >
                    <div
                      className="h-full border-4 border-b-[8px] border-gray-200 hover:border-[#0284C7]/70 rounded-3xl transition-all duration-200 active:translate-y-2 active:border-b-4 bg-white shadow-sm hover:shadow-xl duo-btn flex flex-col relative"
                      style={{ borderBottomColor: '#E5E7EB' }}
                    >
                      {room.isDefault && (
                        <div className="absolute top-4 right-4">
                          <span className="inline-flex items-center gap-1 rounded-xl bg-amber-100 px-2.5 py-1 text-[10px] font-black uppercase text-amber-700 border border-amber-300">
                            <StarBadgeIcon />
                            Bawaan
                          </span>
                        </div>
                      )}

                      <div className="p-6 flex flex-col flex-1 gap-3">
                        <div className="flex-1 mt-1 pr-12">
                          <h2 className="text-xl font-black text-gray-900 mb-2 group-hover:text-[#0284C7] transition-colors line-clamp-1">
                            {room.name}
                          </h2>
                          {room.description && (
                            <p className="text-xs font-bold text-gray-500 leading-relaxed line-clamp-2">
                              {room.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-2">
                          <div className="flex items-center gap-1.5 text-xs font-black text-sky-600 uppercase">
                            <MessageCountIcon />
                            <span>{room._count.messages} Pesan</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <Avatar className="w-6 h-6 border border-gray-200">
                              <AvatarImage
                                src={room.createdBy.avatar}
                                alt={room.createdBy.name}
                              />
                              <AvatarFallback className="text-[10px] font-black bg-sky-100 text-sky-600">
                                {getInitials(room.createdBy.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-[11px] font-black text-gray-600 truncate max-w-[80px]">
                              {room.createdBy.name.split(" ")[0]}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-1 pt-1">
                          <span className="text-[10px] font-bold text-gray-400">
                            {formatDistanceToNow(new Date(room.createdAt), {
                              addSuffix: true,
                              locale: id,
                            })}
                          </span>
                          {canDeleteRoom(room) && (
                            <button
                              type="button"
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedRoom(room);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <TrashIcon />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-3xl border-4 border-gray-200 p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black text-gray-950">Hapus Room?</AlertDialogTitle>
            <AlertDialogDescription className="font-bold text-gray-500">
              Apakah Anda yakin ingin menghapus room "{selectedRoom?.name}"?
              Semua pesan di dalam room ini akan ikut terhapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-3 justify-end mt-4">
            <AlertDialogCancel className="rounded-2xl border-2 border-gray-200 font-bold px-5 py-3">Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRoom}
              className="bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold px-5 py-3 border-b-4 border-red-700"
            >
              Hapus Room
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
