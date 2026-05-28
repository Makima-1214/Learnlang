"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function AdminXPPage() {
  const { data: session, status } = useSession();
  const [selectedUser, setSelectedUser] = useState(null);
  const [userQuery, setUserQuery] = useState("");
  const [userOptions, setUserOptions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [delta, setDelta] = useState(0);
  const [setTo, setSetTo] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const isAdmin =
    session?.user &&
    (session.user.role === "ADMIN" || session.user.role === "admin");

  useEffect(() => {
    if (status !== "authenticated" || !isAdmin) return;

    const query = userQuery.trim();
    if (query.length < 2) {
      setUserOptions([]);
      setSearching(false);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      try {
        setSearching(true);
        const response = await fetch(
          `/api/admin/users?q=${encodeURIComponent(query)}&take=20`,
          { signal: controller.signal },
        );
        const data = await response.json();
        setUserOptions(data?.users || []);
      } catch {
        setUserOptions([]);
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [userQuery, status, isAdmin]);

  if (status !== "loading" && !isAdmin) {
    return (
      <div className="p-6">
        Akses ditolak — hanya admin yang dapat mengelola XP pengguna.
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    if (!selectedUser?.id) {
      setResult({ success: false, error: "Pilih pengguna terlebih dahulu" });
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const payload = { userId: selectedUser.id };
      if (setTo !== "") payload.setTo = Number(setTo);
      else payload.delta = Number(delta);

      const res = await fetch("/api/admin/user-xp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Error");
      setResult({ success: true, data });
    } catch (err) {
      setResult({ success: false, error: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-black mb-4">Admin — Kelola XP Pengguna</h1>
      <form onSubmit={submit} className="space-y-4">
        <div className="relative">
          <label className="block text-sm font-bold mb-1">Pilih Pengguna</label>
          <input
            value={
              selectedUser
                ? `${selectedUser.name} (@${selectedUser.username || "tanpa-username"})`
                : userQuery
            }
            onChange={(e) => {
              setSelectedUser(null);
              setUserQuery(e.target.value);
              setDropdownOpen(true);
            }}
            onFocus={() => setDropdownOpen(true)}
            onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
            placeholder="Cari nama atau username minimal 2 huruf"
            className="w-full p-2 border rounded"
          />

          {dropdownOpen && (
            <div className="absolute z-20 mt-2 w-full rounded border bg-white shadow-lg overflow-hidden">
              <div className="max-h-64 overflow-auto">
                {searching ? (
                  <div className="px-3 py-2 text-sm text-gray-500">
                    Mencari pengguna...
                  </div>
                ) : userQuery.trim().length < 2 ? (
                  <div className="px-3 py-2 text-sm text-gray-500">
                    Ketik minimal 2 huruf untuk mencari pengguna.
                  </div>
                ) : userOptions.length > 0 ? (
                  userOptions.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        setSelectedUser(user);
                        setUserQuery(
                          `${user.name} (@${user.username || "tanpa-username"})`,
                        );
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 border-b last:border-b-0"
                    >
                      <div className="font-semibold text-sm flex items-center justify-between gap-2">
                        <span>{user.name}</span>
                        <span className="text-[10px] text-gray-400 font-medium">
                          {user.xp || 0} XP
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        @{user.username || "tanpa-username"} · {user.email}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-gray-500">
                    Tidak ada pengguna yang cocok.
                  </div>
                )}
              </div>
            </div>
          )}

          {selectedUser && (
            <div className="mt-2 text-xs text-gray-500">
              Terpilih:{" "}
              <span className="font-semibold">{selectedUser.name}</span> (
              {selectedUser.id})
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-bold mb-1">
            Tambah/Kurangi XP (delta)
          </label>
          <input
            type="number"
            value={delta}
            onChange={(e) => setDelta(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <p className="text-xs text-gray-500 mt-1">
            Gunakan angka negatif untuk mengurangi XP.
          </p>
        </div>

        <div>
          <label className="block text-sm font-bold mb-1">
            Atur XP langsung (opsional)
          </label>
          <input
            type="number"
            value={setTo}
            onChange={(e) => setSetTo(e.target.value)}
            placeholder="Kosongkan jika tidak mengatur langsung"
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="flex gap-3">
          <button
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded font-bold"
          >
            {loading ? "Mengirim..." : "Kirim"}
          </button>
          <button
            type="button"
            onClick={() => {
              setSelectedUser(null);
              setUserQuery("");
              setUserOptions([]);
              setDelta(0);
              setSetTo("");
              setResult(null);
            }}
            className="px-4 py-2 border rounded"
          >
            Reset
          </button>
        </div>
      </form>

      {result && (
        <div className="mt-6 p-4 rounded border">
          {result.success ? (
            <div>
              <div className="font-black">Berhasil</div>
              <div className="text-sm">User ID: {result.data.user.id}</div>
              <div className="text-sm">XP sekarang: {result.data.user.xp}</div>
            </div>
          ) : (
            <div className="text-red-600">Error: {result.error}</div>
          )}
        </div>
      )}
    </div>
  );
}
