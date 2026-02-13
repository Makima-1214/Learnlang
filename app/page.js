"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/learn");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-foreground text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold">LernLang</h1>
          <div className="flex gap-3">
            <Button asChild variant="outline">
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Daftar</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-6">
            Belajar Bahasa Inggris dengan AI
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Tingkatkan kemampuan bahasa Inggris Anda dengan latihan terjemahan
            yang dinilai oleh AI menggunakan teknologi terkini.
          </p>
          <Button asChild size="lg" className="text-lg">
            <Link href="/register">Mulai Belajar Gratis</Link>
          </Button>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Card>
            <CardHeader>
              <div className="text-4xl mb-2">🎯</div>
              <CardTitle>2 Mode Belajar</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                English → Indonesian dan Indonesian → English. Pilih mode sesuai
                kebutuhan Anda.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="text-4xl mb-2">🤖</div>
              <CardTitle>Evaluasi AI</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Dapatkan penilaian instant dengan skor 0-100 dan feedback detail
                dari AI.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="text-4xl mb-2">📊</div>
              <CardTitle>Tracking Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Pantau perkembangan belajar Anda dengan statistik dan riwayat
                lengkap.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="text-4xl mb-2">🎓</div>
              <CardTitle>3 Tingkat Kesulitan</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Mulai dari level mudah hingga sulit, sesuaikan dengan kemampuan
                Anda.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="text-4xl mb-2">💡</div>
              <CardTitle>Feedback Konstruktif</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Dapatkan penjelasan detail tentang kesalahan dan cara
                memperbaikinya.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="text-4xl mb-2">🔒</div>
              <CardTitle>Data Aman</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Semua progress Anda tersimpan aman di database dan dapat diakses
                kapan saja.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="text-3xl">
              Siap Meningkatkan Bahasa Inggris Anda?
            </CardTitle>
            <CardDescription className="text-lg">
              Daftar sekarang dan mulai perjalanan belajar Anda!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild size="lg" className="text-lg">
              <Link href="/register">Daftar Sekarang</Link>
            </Button>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>LernLang © 2026 - Belajar Bahasa Inggris dengan AI</p>
        </div>
      </footer>
    </div>
  );
}
