"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import LoadingScreen from "@/components/LoadingScreen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Camera,
  Save,
  User,
  Mail,
  AtSign,
  FileText,
  Calendar,
  Trophy,
  Target,
  CheckCircle,
  Share2,
  Copy,
  ExternalLink,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");

  useEffect(() => {
    if (session) {
      fetchProfile();
    } else if (session === null) {
      router.push("/login");
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile");
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setName(data.name || "");
        setUsername(data.username || "");
        setBio(data.bio || "");
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      toast.error("Gagal memuat profil");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, bio }),
      });

      const data = await response.json();

      if (response.ok) {
        setProfile((prev) => ({ ...prev, ...data }));
        await updateSession({
          name: data.name,
          username: data.username,
          avatar: data.avatar,
        });
        toast.success("Profil berhasil diperbarui");
      } else {
        toast.error(data.error || "Gagal memperbarui profil");
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Gagal memperbarui profil");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        const data = await uploadResponse.json();
        toast.error(data.error || "Gagal mengupload foto");
        return;
      }

      const { url } = await uploadResponse.json();

      // Update profile with new avatar
      const updateResponse = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar: url }),
      });

      if (updateResponse.ok) {
        const updatedUser = await updateResponse.json();
        setProfile((prev) => ({ ...prev, avatar: url }));
        await updateSession({ avatar: url });
        toast.success("Foto profil berhasil diperbarui");
      } else {
        toast.error("Gagal memperbarui foto profil");
      }
    } catch (error) {
      console.error("Failed to upload avatar:", error);
      toast.error("Gagal mengupload foto");
    } finally {
      setUploading(false);
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

  const profileUrl =
    profile?.username && typeof window !== "undefined"
      ? `${window.location.origin}/user/${profile.username}`
      : null;

  const copyProfileUrl = () => {
    if (profileUrl) {
      navigator.clipboard.writeText(profileUrl);
      toast.success("Link profil berhasil disalin!");
    }
  };

  if (loading) return <LoadingScreen />;

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Profil Saya</h1>
            <p className="text-gray-600 mt-1">
              Kelola informasi profil dan lihat pencapaian Anda
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Avatar & Info Card */}
            <div className="lg:col-span-1 space-y-6">
              {/* Avatar Card */}
              <Card>
                <CardContent className="pt-6 flex flex-col items-center">
                  <div className="relative group">
                    <Avatar className="w-32 h-32 text-3xl">
                      <AvatarImage src={profile?.avatar} alt={profile?.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                        {getInitials(profile?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <Camera className="w-8 h-8 text-white" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </div>
                  {uploading && (
                    <p className="text-sm text-gray-500 mt-2">Mengupload...</p>
                  )}
                  <h2 className="text-xl font-bold mt-4">{profile?.name}</h2>
                  {profile?.username && (
                    <p className="text-gray-500">@{profile.username}</p>
                  )}
                  <Badge
                    className="mt-2"
                    variant={
                      profile?.role === "ADMIN" ? "default" : "secondary"
                    }
                  >
                    {profile?.role === "ADMIN" ? "Administrator" : "Pengguna"}
                  </Badge>
                  <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    Bergabung{" "}
                    {profile?.createdAt &&
                      formatDistanceToNow(new Date(profile.createdAt), {
                        addSuffix: true,
                        locale: idLocale,
                      })}
                  </p>
                </CardContent>
              </Card>

              {/* Share Profile Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Share2 className="w-4 h-4" />
                    Bagikan Profil
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {profileUrl ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-lg">
                        <p className="text-sm text-gray-700 truncate flex-1">
                          {profileUrl}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={copyProfileUrl}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() =>
                          window.open(`/user/${profile.username}`, "_blank")
                        }
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Lihat Profil Publik
                      </Button>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Atur username terlebih dahulu untuk mendapatkan link
                      profil yang bisa dibagikan.
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Stats Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    Statistik Belajar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <Target className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-blue-600">
                        {profile?.stats?.totalExercises || 0}
                      </p>
                      <p className="text-xs text-gray-600">Total Latihan</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-green-600 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-green-600">
                        {profile?.stats?.correctCount || 0}
                      </p>
                      <p className="text-xs text-gray-600">Jawaban Benar</p>
                    </div>
                    <div className="col-span-2 text-center p-3 bg-purple-50 rounded-lg">
                      <Trophy className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                      <p className="text-2xl font-bold text-purple-600">
                        {profile?.stats?.averageScore || 0}
                      </p>
                      <p className="text-xs text-gray-600">Skor Rata-rata</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right: Edit Form */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Edit Profil</CardTitle>
                  <CardDescription>
                    Perbarui informasi profil Anda
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Nama Lengkap
                    </label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Masukkan nama lengkap"
                    />
                  </div>

                  {/* Email (read-only) */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </label>
                    <Input
                      value={profile?.email || ""}
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500">
                      Email tidak dapat diubah
                    </p>
                  </div>

                  {/* Username */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <AtSign className="w-4 h-4" />
                      Username
                    </label>
                    <Input
                      value={username}
                      onChange={(e) =>
                        setUsername(
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9_-]/g, ""),
                        )
                      }
                      placeholder="contoh: john_doe"
                      maxLength={30}
                    />
                    <p className="text-xs text-gray-500">
                      Hanya huruf kecil, angka, underscore, dan dash (3-30
                      karakter). Username digunakan untuk URL profil publik.
                    </p>
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      Bio
                    </label>
                    <Textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Ceritakan sedikit tentang diri Anda..."
                      rows={4}
                      maxLength={500}
                    />
                    <p className="text-xs text-gray-500">
                      {bio.length}/500 karakter
                    </p>
                  </div>

                  {/* Save Button */}
                  <Button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="w-full"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "Menyimpan..." : "Simpan Perubahan"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">
            © {new Date().getFullYear()} LernLang. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
