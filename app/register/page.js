"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Password tidak cocok");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password minimal 6 karakter");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registrasi gagal");
      }

      // Redirect to login
      router.push("/login?registered=true");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f9f4] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#1e3a2e] mb-2">LernLang</h1>
          <p className="text-[#1e3a2e] opacity-75">Buat akun baru</p>
        </div>

        {/* Register Card */}
        <div className="bg-white rounded-xl shadow-sm border-2 border-[#d1e8dd] p-8">
          <h2 className="text-2xl font-bold text-[#1e3a2e] mb-6">Registrasi</h2>

          {error && (
            <div className="bg-[#fee2e2] border-2 border-[#ef4444] rounded-lg p-4 mb-6">
              <p className="text-[#991b1b] font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[#1e3a2e] font-semibold mb-2">
                Nama Lengkap
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-[#d1e8dd] rounded-lg focus:outline-none focus:border-[#6fbf8f] text-[#1e3a2e]"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-[#1e3a2e] font-semibold mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-[#d1e8dd] rounded-lg focus:outline-none focus:border-[#6fbf8f] text-[#1e3a2e]"
                placeholder="email@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-[#1e3a2e] font-semibold mb-2">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-[#d1e8dd] rounded-lg focus:outline-none focus:border-[#6fbf8f] text-[#1e3a2e]"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="block text-[#1e3a2e] font-semibold mb-2">
                Konfirmasi Password
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-[#d1e8dd] rounded-lg focus:outline-none focus:border-[#6fbf8f] text-[#1e3a2e]"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#6fbf8f] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#4a9d6a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Memproses..." : "Daftar"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[#1e3a2e]">
              Sudah punya akun?{" "}
              <Link
                href="/login"
                className="text-[#6fbf8f] font-semibold hover:text-[#4a9d6a]"
              >
                Login di sini
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-[#1e3a2e] hover:text-[#6fbf8f] font-medium"
          >
            ← Kembali ke halaman utama
          </Link>
        </div>
      </div>
    </div>
  );
}
