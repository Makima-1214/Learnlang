"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import DashboardLayout from "@/components/DashboardLayout";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { id as idLocale } from "date-fns/locale";

// ============================================================
//  CUSTOM BESPOKE SVG ICONS — no generic icon libraries
// ============================================================

const CameraIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-white" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const SaveIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
);

const UserIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-[#6366F1]" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-[#6366F1]" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const AtIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-[#6366F1]" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="4" />
    <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" />
  </svg>
);

const FileIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-[#6366F1]" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

const CalendarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5 text-[#78909C]" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const TrophyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-amber-500" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5A1.5 1.5 0 0 1 3 7.5V6a1.5 1.5 0 0 1 1.5-1.5h3" />
    <path d="M18 9h1.5A1.5 1.5 0 0 0 21 7.5V6a1.5 1.5 0 0 0-1.5-1.5h-3" />
    <path d="M8 3h8v8a4 4 0 0 1-8 0V3z" fill="rgba(245,158,11,0.1)" />
    <path d="M12 15v4M9 19h6" />
  </svg>
);

const TargetIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-[#6366F1]" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-emerald-500" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const ShareIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-[#6366F1]" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const CopyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 mr-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

// ============================================================

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
        await updateSession({ name: data.name, username: data.username, avatar: data.avatar });
        toast.success("Profil berhasil diperbarui");
      } else {
        toast.error(data.error || "Gagal memperbarui profil");
      }
    } catch {
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
      const uploadResponse = await fetch("/api/profile/avatar", { method: "POST", body: formData });
      if (!uploadResponse.ok) {
        const data = await uploadResponse.json();
        toast.error(data.error || "Gagal mengupload foto");
        return;
      }
      const { url } = await uploadResponse.json();
      const updateResponse = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatar: url }),
      });
      if (updateResponse.ok) {
        setProfile((prev) => ({ ...prev, avatar: url }));
        await updateSession({ avatar: url });
        toast.success("Foto profil berhasil diperbarui");
      } else {
        toast.error("Gagal memperbarui foto profil");
      }
    } catch {
      toast.error("Gagal mengupload foto");
    } finally {
      setUploading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
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

  if (loading) return null;
  if (!session) return null;

  return (
    <DashboardLayout>
      <style dangerouslySetInnerHTML={{
        __html: `
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
        .profile-card {
          border-bottom-width: 6px;
          transition: box-shadow 0.2s ease, transform 0.2s ease;
        }
        .profile-card:hover {
          transform: translateY(-2px);
        }
        `
      }} />

      <main
        className="max-w-4xl mx-auto px-4 sm:px-6 py-8 font-[family-name:var(--font-nunito)]"
        style={{ overflowY: "auto", maxHeight: "calc(100vh - 4rem)" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* ── Header ── */}
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-[#EEF2FF] border-2 border-[#A5B4FC] text-[#3730A3] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-3">
              <UserIcon />
              Akun Saya
            </div>
            <h1 className="text-4xl font-black text-gray-950 leading-tight">Profil Saya</h1>
            <p className="text-[#78909C] font-bold mt-1">Kelola informasi profil dan lihat pencapaianmu</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── LEFT COLUMN ── */}
            <div className="lg:col-span-1 space-y-5">

              {/* Avatar Card */}
              <div className="profile-card bg-white border-4 border-gray-200 rounded-3xl p-6 flex flex-col items-center shadow-sm">
                <div className="relative group mb-4">
                  <div className="w-28 h-28 rounded-full border-4 border-[#6366F1] shadow-md overflow-hidden bg-gradient-to-br from-[#6366F1] to-[#818CF8] flex items-center justify-center">
                    {profile?.avatar ? (
                      <Image src={profile.avatar} alt={profile.name || "avatar"} width={112} height={112} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-3xl font-black text-white">{getInitials(profile?.name)}</span>
                    )}
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <CameraIcon />
                  </button>
                  <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/gif,image/webp" onChange={handleAvatarUpload} className="hidden" />
                </div>

                {uploading && <p className="text-sm text-[#6366F1] font-bold animate-pulse mb-2">Mengupload...</p>}

                <h2 className="text-xl font-black text-gray-950">{profile?.name}</h2>
                {profile?.username && (
                  <p className="text-[#78909C] font-bold text-sm">@{profile.username}</p>
                )}

                <span className={`mt-2 px-3 py-1 rounded-full text-xs font-black border-2 ${
                  profile?.role === "ADMIN"
                    ? "bg-[#EEF2FF] text-[#3730A3] border-[#A5B4FC]"
                    : "bg-[#F0FDF4] text-emerald-700 border-emerald-300"
                }`}>
                  {profile?.role === "ADMIN" ? "Administrator" : "Pengguna"}
                </span>

                <div className="flex flex-wrap gap-2 justify-center mt-4">
                  {[
                    { val: profile?.followersCount || 0, label: "Pengikut" },
                    { val: profile?.followingCount || 0, label: "Mengikuti" },
                    { val: profile?.friendshipCount || 0, label: "Teman" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border-3 border-b-4 border-gray-200 bg-white px-3 py-2 text-center shadow-sm">
                      <div className="text-lg font-black text-[#6366F1]">{item.val}</div>
                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{item.label}</div>
                    </div>
                  ))}
                </div>

                {profile?.createdAt && (
                  <p className="text-xs text-[#78909C] font-bold mt-3 flex items-center gap-1.5">
                    <CalendarIcon />
                    Bergabung {formatDistanceToNow(new Date(profile.createdAt), { addSuffix: true, locale: idLocale })}
                  </p>
                )}
              </div>

              {/* Share Profile Card */}
              <div className="profile-card bg-white border-4 border-gray-200 rounded-3xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <ShareIcon />
                  <h3 className="font-black text-gray-950">Bagikan Profil</h3>
                </div>
                {profileUrl ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-3 bg-[#F8F9FF] border-2 border-[#E0E7FF] rounded-2xl">
                      <p className="text-xs text-gray-700 font-bold truncate flex-1">{profileUrl}</p>
                      <button onClick={copyProfileUrl} className="p-1.5 rounded-xl bg-[#EEF2FF] hover:bg-[#E0E7FF] transition-colors">
                        <CopyIcon />
                      </button>
                    </div>
                    <button
                      onClick={() => window.open(`/user/${profile.username}`, "_blank")}
                      className="w-full py-2.5 rounded-2xl border-4 border-b-6 border-gray-200 bg-white text-[#6366F1] font-black text-sm duo-btn flex items-center justify-center"
                    >
                      <ExternalLinkIcon />
                      Lihat Profil Publik
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-[#78909C] font-bold">Atur username terlebih dahulu untuk mendapatkan link profil.</p>
                )}
              </div>

              {/* Stats Card */}
              <div className="profile-card bg-white border-4 border-gray-200 rounded-3xl p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <TrophyIcon />
                  <h3 className="font-black text-gray-950">Statistik Belajar</h3>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="rounded-2xl border-3 border-b-4 border-[#E0E7FF] bg-[#EEF2FF] p-3 text-center">
                    <TargetIcon />
                    <p className="text-2xl font-black text-[#6366F1] mt-1">{profile?.stats?.totalExercises || 0}</p>
                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wider mt-0.5">Total Latihan</p>
                  </div>
                  <div className="rounded-2xl border-3 border-b-4 border-emerald-200 bg-[#F0FDF4] p-3 text-center">
                    <CheckCircleIcon />
                    <p className="text-2xl font-black text-emerald-600 mt-1">{profile?.stats?.correctCount || 0}</p>
                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wider mt-0.5">Jawaban Benar</p>
                  </div>
                  <div className="col-span-2 rounded-2xl border-3 border-b-4 border-amber-200 bg-amber-50 p-3 text-center">
                    <TrophyIcon />
                    <p className="text-2xl font-black text-amber-600 mt-1">{profile?.stats?.averageScore || 0}</p>
                    <p className="text-[10px] font-bold text-gray-600 uppercase tracking-wider mt-0.5">Skor Rata-rata</p>
                  </div>
                </div>

                <div className="border-t-2 border-gray-100 pt-4 space-y-3">
                  <p className="text-xs font-black text-gray-500 uppercase tracking-wider">Metode Belajar</p>
                  {[
                    { key: "vocabulary", label: "Vocabulary", emoji: "📚", color: "text-[#6366F1]" },
                    { key: "listening", label: "Listening", emoji: "🎧", color: "text-purple-600" },
                    { key: "grammar", label: "Grammar", emoji: "✏️", color: "text-emerald-600" },
                  ].map((method) => (
                    <div key={method.key} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{method.emoji}</span>
                        <span className="text-sm font-bold text-gray-700">{method.label}</span>
                      </div>
                      <span className={`font-black text-sm ${method.color}`}>
                        {profile?.stats?.methodBreakdown?.[method.key] || 0}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── RIGHT COLUMN — Edit Form ── */}
            <div className="lg:col-span-2">
              <div className="profile-card bg-white border-4 border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">
                <div className="mb-6">
                  <h2 className="text-2xl font-black text-gray-950">Edit Profil</h2>
                  <p className="text-[#78909C] font-bold text-sm mt-1">Perbarui informasi profil Anda</p>
                </div>

                <div className="space-y-5">
                  {/* Name */}
                  <div className="space-y-2">
                    <label className="text-sm font-black text-gray-700 flex items-center gap-2">
                      <UserIcon />
                      Nama Lengkap
                    </label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Masukkan nama lengkap"
                      className="w-full px-4 py-3 rounded-2xl border-3 border-b-4 border-gray-200 bg-white text-gray-900 font-bold placeholder:text-gray-400 focus:outline-none focus:border-[#6366F1] transition-colors text-sm"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-sm font-black text-gray-700 flex items-center gap-2">
                      <MailIcon />
                      Email
                    </label>
                    <input
                      value={profile?.email || ""}
                      disabled
                      className="w-full px-4 py-3 rounded-2xl border-3 border-b-4 border-gray-100 bg-gray-50 text-gray-400 font-bold text-sm cursor-not-allowed"
                    />
                    <p className="text-xs text-[#78909C] font-bold">Email tidak dapat diubah</p>
                  </div>

                  {/* Username */}
                  <div className="space-y-2">
                    <label className="text-sm font-black text-gray-700 flex items-center gap-2">
                      <AtIcon />
                      Username
                    </label>
                    <div className="flex items-center rounded-2xl border-3 border-b-4 border-gray-200 bg-white overflow-hidden focus-within:border-[#6366F1] transition-colors">
                      <span className="px-3 py-3 text-[#6366F1] font-black text-sm border-r-2 border-gray-200 bg-[#F8F9FF]">@</span>
                      <input
                        value={username}
                        onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                        placeholder="contoh: john_doe"
                        maxLength={30}
                        className="flex-1 px-3 py-3 text-gray-900 font-bold placeholder:text-gray-400 focus:outline-none text-sm bg-transparent"
                      />
                    </div>
                    <p className="text-xs text-[#78909C] font-bold">Huruf kecil, angka, underscore, dan dash (3–30 karakter).</p>
                  </div>

                  {/* Bio */}
                  <div className="space-y-2">
                    <label className="text-sm font-black text-gray-700 flex items-center gap-2">
                      <FileIcon />
                      Bio
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Ceritakan sedikit tentang diri Anda..."
                      rows={4}
                      maxLength={500}
                      className="w-full px-4 py-3 rounded-2xl border-3 border-b-4 border-gray-200 bg-white text-gray-900 font-bold placeholder:text-gray-400 focus:outline-none focus:border-[#6366F1] transition-colors text-sm resize-none"
                    />
                    <p className="text-xs text-[#78909C] font-bold">{bio.length}/500 karakter</p>
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="w-full py-4 bg-[#6366F1] hover:bg-[#818CF8] disabled:opacity-60 text-white border-b-6 border-[#4338CA] rounded-2xl font-black text-base duo-btn flex items-center justify-center gap-2 shadow-md mt-2"
                  >
                    <SaveIcon />
                    {saving ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
                </div>
              </div>
            </div>

          </div>
        </motion.div>
      </main>
    </DashboardLayout>
  );
}
