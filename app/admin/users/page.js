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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Trash2, Shield, User as UserIcon } from "lucide-react";
import { toast } from "sonner";

// Custom Playful Icons
const CyberShieldIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <circle cx="12" cy="11" r="3" fill="currentColor" fillOpacity="0.2" />
  </svg>
);

const UserAvatarIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M19 8v6M16 11h6" strokeDasharray="2 2" />
  </svg>
);

const TrashVaporIcon = () => (
  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

export default function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [deleteDialog, setDeleteDialog] = useState({ open: false, user: null });
  const [roleDialog, setRoleDialog] = useState({
    open: false,
    user: null,
    newRole: null,
  });
  const [editDialog, setEditDialog] = useState({
    open: false,
    user: null,
    name: "",
    email: "",
  });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      if (session.user.role !== "ADMIN") {
        router.push("/learn");
      } else {
        fetchUsers();
      }
    }
  }, [status, session, router]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      const data = await response.json();
      if (response.ok) {
        setUsers(data.users);
      } else {
        toast.error(data.error || "Gagal memuat data pengguna");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Gagal memuat data pengguna");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteDialog.user) return;

    setActionLoading(true);
    try {
      const response = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: deleteDialog.user.id }),
      });

      if (response.ok) {
        setUsers(users.filter((u) => u.id !== deleteDialog.user.id));
        setDeleteDialog({ open: false, user: null });
        toast.success(`Pengguna ${deleteDialog.user.name} berhasil dihapus`);
      } else {
        const data = await response.json();
        toast.error(data.error || "Gagal menghapus pengguna");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Gagal menghapus pengguna");
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangeRole = async () => {
    if (!roleDialog.user || !roleDialog.newRole) return;

    setActionLoading(true);
    try {
      const response = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: roleDialog.user.id,
          role: roleDialog.newRole,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(
          users.map((u) =>
            u.id === data.user.id ? { ...u, role: data.user.role } : u,
          ),
        );
        setRoleDialog({ open: false, user: null, newRole: null });
        toast.success(
          `Role pengguna ${roleDialog.user.name} berhasil diubah menjadi ${roleDialog.newRole}`,
        );
      } else {
        const data = await response.json();
        toast.error(data.error || "Gagal mengubah role");
      }
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Gagal mengubah role");
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditUser = async () => {
    if (!editDialog.user || !editDialog.name || !editDialog.email) {
      toast.error("Nama dan email harus diisi");
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: editDialog.user.id,
          name: editDialog.name,
          email: editDialog.email,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(
          users.map((u) =>
            u.id === data.user.id
              ? { ...u, name: data.user.name, email: data.user.email }
              : u,
          ),
        );
        setEditDialog({ open: false, user: null, name: "", email: "" });
        toast.success(`Data pengguna berhasil diperbarui`);
      } else {
        const data = await response.json();
        toast.error(data.error || "Gagal mengubah data pengguna");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Gagal mengubah data pengguna");
    } finally {
      setActionLoading(false);
    }
  };

  // Filter and sort users
  const filteredUsers = users.filter((user) => {
    // Search filter
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    // Role filter
    const matchesRole = roleFilter === "all" || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortBy === "date") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === "exercises") {
      return b._count.histories - a._count.histories;
    }
    return 0;
  });

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
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
      
      <main className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        {/* Header Section */}
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">User Management</h1>
          <p className="font-bold text-gray-500 text-sm mt-1">
            Kelola semua pengguna dan role mereka di platform LernLang
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="duo-card border-4 border-indigo-100 shadow-none bg-indigo-50/30">
            <CardHeader className="pb-3">
              <CardDescription className="text-indigo-500 font-black uppercase text-[10px] tracking-wider">Total Users</CardDescription>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500 rounded-lg text-white">
                  <UserAvatarIcon />
                </div>
                <CardTitle className="text-4xl font-black text-indigo-700">{users.length}</CardTitle>
              </div>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Admins</CardDescription>
              <CardTitle className="text-3xl text-primary">
                {users.filter((u) => u.role === "ADMIN").length}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">
                Regular Users
              </CardDescription>
              <CardTitle className="text-3xl">
                {users.filter((u) => u.role === "USER").length}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="duo-card border-4 border-gray-100 shadow-none">
          <CardHeader>
            <CardTitle className="text-lg font-black text-gray-800 flex items-center gap-2">🔍 Cari & Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search */}
              <div className="md:col-span-1">
                <Label htmlFor="search" className="text-sm mb-2 block">
                  Cari Pengguna
                </Label>
                <Input
                  id="search"
                  placeholder="Cari nama atau email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border-2 focus:ring-indigo-500"
                />
              </div>

              {/* Role Filter */}
              <div>
                <Label className="text-sm mb-2 block">Filter Role</Label>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { value: "all", label: "Semua", icon: null },
                    { value: "ADMIN", label: "Admin", icon: CyberShieldIcon },
                    { value: "USER", label: "User", icon: UserAvatarIcon },
                  ].map((option) => {
                    const Icon = option.icon;
                    return (
                      <Button
                        key={option.value}
                        onClick={() => setRoleFilter(option.value)}
                        className={`duo-btn-primary font-black ${roleFilter === option.value ? "bg-indigo-500 border-indigo-700 hover:bg-indigo-600" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"}`}
                        size="sm"
                      >
                        {Icon && <span className="mr-2"><Icon /></span>}
                        {option.label}
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* Sort */}
              <div>
                <Label className="text-sm mb-2 block">Urutkan</Label>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { value: "date", label: "Tanggal" },
                    { value: "name", label: "Nama" },
                    { value: "exercises", label: "Latihan" },
                  ].map((option) => (
                    <Button
                      key={option.value}
                      className={`duo-btn-primary font-black ${sortBy === option.value ? "bg-indigo-500 border-indigo-700 hover:bg-indigo-600" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"}`}
                      size="sm"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Results count */}
            {searchTerm || roleFilter !== "all" ? (
              <div className="mt-4 text-sm text-muted-foreground">
                Menampilkan {sortedUsers.length} dari {users.length} pengguna
                {searchTerm && ` untuk "${searchTerm}"`}
                {roleFilter !== "all" && ` dengan role ${roleFilter}`}
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="duo-card border-4 border-gray-100 shadow-none overflow-hidden">
          <CardHeader>
            <CardTitle className="font-black">Semua Pengguna ({sortedUsers.length})</CardTitle>
            <CardDescription className="font-bold">
              Daftar lengkap semua pengguna terdaftar di platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sortedUsers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                {searchTerm || roleFilter !== "all"
                  ? "Tidak ada pengguna yang sesuai dengan filter."
                  : "Tidak ada pengguna ditemukan."}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-b-2">
                      <TableHead className="font-black text-gray-400">Nama</TableHead>
                      <TableHead className="font-black text-gray-400">Email</TableHead>
                      <TableHead className="text-center font-black text-gray-400">Role</TableHead>
                      <TableHead className="text-center font-black text-gray-400">
                        Total Latihan
                      </TableHead>
                      <TableHead className="text-center font-black text-gray-400">Terdaftar</TableHead>
                      <TableHead className="text-center font-black text-gray-400">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.name}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {user.email}
                        </TableCell>
                        <TableCell className="text-center space-x-1">
                          <Badge
                            variant="outline"
                            className={`cursor-pointer px-3 py-1 rounded-lg border-2 font-black ${user.role === "ADMIN" ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-blue-50 text-blue-600 border-blue-200"}`}
                            onClick={() =>
                              setRoleDialog({
                                open: true,
                                user,
                                newRole: user.role,
                              })
                            }
                          >
                            {user.role === "ADMIN" ? ( 
                              <span className="mr-1 inline-block scale-75"><CyberShieldIcon /></span>
                            ) : (
                              <span className="mr-1 inline-block scale-75"><UserAvatarIcon /></span>
                            )}
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {user._count.histories}
                        </TableCell>
                        <TableCell className="text-center text-sm">
                          {new Date(user.createdAt).toLocaleDateString(
                            "id-ID",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              className="bg-white border-2 border-b-4 border-gray-200 text-gray-600 hover:bg-gray-50 h-8 w-8 p-0"
                              onClick={() =>
                                setEditDialog({
                                  open: true,
                                  user,
                                  name: user.name,
                                  email: user.email,
                                })
                              }
                            >
                              <span className="text-xs">✏️</span>
                            </Button>
                            <Button
                              size="sm"
                              className="bg-white border-2 border-b-4 border-red-100 text-red-500 hover:bg-red-50 h-8 w-8 p-0"
                              onClick={() =>
                                setDeleteDialog({ open: true, user })
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
      </main>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, user: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Pengguna</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus pengguna{" "}
              <strong>{deleteDialog.user?.name}</strong>?
              <br />
              <span className="text-destructive">
                Semua data latihan pengguna ini akan ikut terhapus dan tidak
                dapat dikembalikan!
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, user: null })}
              disabled={actionLoading}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteUser}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menghapus...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Role Dialog */}
      <Dialog
        open={roleDialog.open}
        onOpenChange={(open) =>
          setRoleDialog({ open, user: null, newRole: null })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ubah Role Pengguna</DialogTitle>
            <DialogDescription>
              Ubah role untuk pengguna <strong>{roleDialog.user?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select
              value={roleDialog.newRole || roleDialog.user?.role}
              onValueChange={(value) =>
                setRoleDialog({ ...roleDialog, newRole: value })
              }
              disabled={actionLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USER">
                  <div className="flex items-center">
                    <UserIcon className="mr-2 h-4 w-4" />
                    User
                  </div>
                </SelectItem>
                <SelectItem value="ADMIN">
                  <div className="flex items-center">
                    <Shield className="mr-2 h-4 w-4" />
                    Admin
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setRoleDialog({ open: false, user: null, newRole: null })
              }
              disabled={actionLoading}
            >
              Batal
            </Button>
            <Button
              onClick={handleChangeRole}
              disabled={
                actionLoading || roleDialog.newRole === roleDialog.user?.role
              }
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mengubah...
                </>
              ) : (
                "Simpan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog
        open={editDialog.open}
        onOpenChange={(open) =>
          setEditDialog({ open, user: null, name: "", email: "" })
        }
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Data Pengguna</DialogTitle>
            <DialogDescription>
              Ubah nama dan email untuk pengguna{" "}
              <strong>{editDialog.user?.name}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nama</Label>
              <Input
                id="edit-name"
                value={editDialog.name}
                onChange={(e) =>
                  setEditDialog({ ...editDialog, name: e.target.value })
                }
                placeholder="Masukkan nama"
                disabled={actionLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editDialog.email}
                onChange={(e) =>
                  setEditDialog({ ...editDialog, email: e.target.value })
                }
                placeholder="Masukkan email"
                disabled={actionLoading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setEditDialog({ open: false, user: null, name: "", email: "" })
              }
              disabled={actionLoading}
            >
              Batal
            </Button>
            <Button
              onClick={handleEditUser}
              disabled={actionLoading || !editDialog.name || !editDialog.email}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan Perubahan"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
