"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/learn");
        router.refresh();
      }
    } catch (err) {
      setError("Terjadi kesalahan saat login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f9f4] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#1e3a2e] mb-2">LernLang</h1>
          <p className="text-[#1e3a2e] opacity-75">Masuk ke akun Anda</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-xl shadow-sm border-2 border-[#d1e8dd] p-8">
          <h2 className="text-2xl font-bold text-[#1e3a2e] mb-6">Login</h2>

          {error && (
            <div className="bg-[#fee2e2] border-2 border-[#ef4444] rounded-lg p-4 mb-6">
              <p className="text-[#991b1b] font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#6fbf8f] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#4a9d6a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Memproses..." : "Login"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-[#1e3a2e]">
              Belum punya akun?{" "}
              <Link
                href="/register"
                className="text-[#6fbf8f] font-semibold hover:text-[#4a9d6a]"
              >
                Daftar di sini
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
