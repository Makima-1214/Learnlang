"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
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
import { Trash2, Shield, User as UserIcon, Loader2, Edit2 } from "lucide-react";
import { toast } from "sonner";

export default function UsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
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
    <div className="min-h-screen">
      <Navbar user={session.user} />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">User Management</h1>
          <p className="text-muted-foreground">
            Kelola semua pengguna dan role mereka di platform LernLang
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription className="text-xs">Total Users</CardDescription>
              <CardTitle className="text-3xl">{users.length}</CardTitle>
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

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Semua Pengguna ({users.length})</CardTitle>
            <CardDescription>
              Daftar lengkap semua pengguna terdaftar di platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Tidak ada pengguna ditemukan.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-center">Role</TableHead>
                      <TableHead className="text-center">
                        Total Latihan
                      </TableHead>
                      <TableHead className="text-center">Terdaftar</TableHead>
                      <TableHead className="text-center">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.name}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {user.email}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={
                              user.role === "ADMIN" ? "default" : "secondary"
                            }
                            className="cursor-pointer"
                            onClick={() =>
                              setRoleDialog({
                                open: true,
                                user,
                                newRole: user.role,
                              })
                            }
                          >
                            {user.role === "ADMIN" ? (
                              <Shield className="mr-1 h-3 w-3" />
                            ) : (
                              <UserIcon className="mr-1 h-3 w-3" />
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
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                setEditDialog({
                                  open: true,
                                  user,
                                  name: user.name,
                                  email: user.email,
                                })
                              }
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() =>
                                setDeleteDialog({ open: true, user })
                              }
                              disabled={user.id === session.user.id}
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
