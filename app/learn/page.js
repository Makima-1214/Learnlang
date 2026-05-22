"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  BookOpenText,
  Headphones,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

const methods = [
  {
    key: "vocabulary",
    title: "Vocabulary",
    description: "Latihan kata dasar, arti kata, dan pilihan ganda A1.",
    icon: BookOpenText,
    color: "from-emerald-500 to-teal-600",
    badge: "Rekomendasi",
  },
  {
    key: "listening",
    title: "Listening",
    description:
      "Dengar audio, lengkapi kalimat, lalu pilih jawaban yang tepat.",
    icon: Headphones,
    color: "from-sky-500 to-blue-700",
    badge: "Audio",
  },
  {
    key: "grammar",
    title: "Grammar",
    description: "Temukan kata yang salah di dalam kalimat lalu perbaiki.",
    icon: CheckCircle2,
    color: "from-amber-500 to-orange-600",
    badge: "Structure",
  },
];

export default function LearnPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const handleStartMethod = async (methodKey) => {
    try {
      // Create a new learning session
      const response = await fetch("/api/learn/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          method: methodKey,
          level: "A1",
          limit: 5,
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload?.success) {
        console.error("Failed to create session:", payload?.message);
        return;
      }

      // Store session info in sessionStorage
      const sessionId = payload.data?.session?.id;
      if (sessionId) {
        sessionStorage.setItem("learningSessionId", sessionId);
        sessionStorage.setItem("learningMethod", methodKey);
        // Now navigate to the method page
        router.push(`/learn/${methodKey}`);
      }
    } catch (error) {
      console.error("Error starting learning session:", error);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-lg text-slate-600">Loading...</div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f8fbff_0%,_#fdf7ff_45%,_#ffffff_100%)]">
      <Navbar user={session.user} />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-900 via-indigo-900 to-emerald-900 p-8 text-white shadow-[0_24px_80px_rgba(15,23,42,0.28)] sm:p-10">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] backdrop-blur">
                <Sparkles className="h-4 w-4" />
                Learning Paths
              </div>
              <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
                Pilih metode belajar yang kamu mau
              </h1>
              <p className="max-w-xl text-sm text-white/85 sm:text-base">
                Setiap metode punya format latihan berbeda dan akan menampilkan
                5 soal yang diambil langsung dari database.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:w-[360px] lg:grid-cols-1">
              {[
                ["A1", "Level dasar"],
                ["5", "Soal per metode"],
                ["DB", "Semua dari database"],
              ].map(([value, label]) => (
                <div
                  key={label}
                  className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur"
                >
                  <div className="text-2xl font-black">{value}</div>
                  <div className="text-xs text-white/70">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {methods.map((method) => {
            const Icon = method.icon;
            return (
              <button
                key={method.key}
                type="button"
                onClick={() => handleStartMethod(method.key)}
                className="group text-left"
              >
                <Card className="h-full overflow-hidden border-0 shadow-[0_16px_45px_rgba(15,23,42,0.08)] transition-all duration-200 group-hover:-translate-y-1 group-hover:shadow-[0_20px_60px_rgba(15,23,42,0.14)]">
                  <div className={`h-2 bg-gradient-to-r ${method.color}`} />
                  <CardContent className="space-y-4 p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div
                        className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-r ${method.color} text-white shadow-lg`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <Badge
                        variant="secondary"
                        className="rounded-full px-3 py-1 text-xs"
                      >
                        {method.badge}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <h2 className="text-2xl font-black text-slate-900">
                        {method.title}
                      </h2>
                      <p className="text-sm leading-6 text-slate-600">
                        {method.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                      Mulai latihan
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              </button>
            );
          })}
        </section>
      </main>
    </div>
  );
}
