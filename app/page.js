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
import { Badge } from "@/components/ui/badge";
import LandingNavbar from "@/components/LandingNavbar";
import { motion } from "framer-motion";
import {
  GraduationCap,
  Brain,
  TrendingUp,
  Shield,
  Sparkles,
  BookOpen,
  Target,
  CheckCircle2,
  ArrowRight,
  Globe2,
  Zap,
} from "lucide-react";

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      // Optionally redirect to /learn if user is already logged in
    }
  }, [status, router]);

  const features = [
    {
      icon: <Globe2 className="h-8 w-8" />,
      title: "2 Mode Belajar",
      description:
        "English → Indonesian dan Indonesian → English. Pilih mode sesuai kebutuhan Anda.",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      icon: <Brain className="h-8 w-8" />,
      title: "Evaluasi AI",
      description:
        "Dapatkan penilaian instant dengan skor 0-100 dan feedback detail dari AI.",
      gradient: "from-purple-500 to-pink-500",
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Tracking Progress",
      description:
        "Pantau perkembangan belajar Anda dengan statistik dan riwayat lengkap.",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "3 Tingkat Kesulitan",
      description:
        "Mulai dari level mudah hingga sulit, sesuaikan dengan kemampuan Anda.",
      gradient: "from-orange-500 to-red-500",
    },
    {
      icon: <Sparkles className="h-8 w-8" />,
      title: "Feedback Konstruktif",
      description:
        "Dapatkan penjelasan detail tentang kesalahan dan cara memperbaikinya.",
      gradient: "from-yellow-500 to-orange-500",
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Data Aman",
      description:
        "Semua progress Anda tersimpan aman di database dan dapat diakses kapan saja.",
      gradient: "from-indigo-500 to-blue-500",
    },
  ];

  const benefits = [
    "✨ Gratis tanpa biaya tersembunyi",
    "🚀 Langsung mulai tanpa setup rumit",
    "📱 Akses dari mana saja, kapan saja",
    "🎯 Personal learning path",
  ];

  const stats = [
    { value: "100%", label: "Gratis", icon: <Sparkles className="h-5 w-5" /> },
    { value: "AI", label: "Powered", icon: <Brain className="h-5 w-5" /> },
    { value: "24/7", label: "Available", icon: <Zap className="h-5 w-5" /> },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-foreground text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-green-50">
      <LandingNavbar />

      {/* Hero Section */}
      <main className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 pt-20 pb-16 sm:pt-24 sm:pb-20">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge className="mb-4 px-4 py-1.5 text-sm">
                <Sparkles className="h-3 w-3 mr-1 inline" />
                Powered by AI Technology
              </Badge>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6">
                <span className="bg-gradient-to-r from-primary via-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Belajar Bahasa Inggris
                </span>
                <br />
                <span className="text-gray-900">dengan AI</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                Tingkatkan kemampuan bahasa Inggris Anda dengan latihan
                terjemahan interaktif yang dinilai oleh AI. Gratis, mudah, dan
                efektif!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button asChild size="lg" className="text-lg px-8 group">
                  <Link href="/register">
                    Mulai Belajar Gratis
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="text-lg px-8"
                >
                  <Link href="/about">Pelajari Lebih Lanjut</Link>
                </Button>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-wrap justify-center gap-8 mb-16"
            >
              {stats.map((stat, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="bg-primary/10 p-2 rounded-lg text-primary">
                    {stat.icon}
                  </div>
                  <div className="text-left">
                    <div className="text-2xl font-bold text-primary">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-500/5 rounded-full blur-3xl -z-10"></div>
      </main>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Fitur Unggulan</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Semua yang Anda butuhkan untuk meningkatkan kemampuan bahasa
              Inggris
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="h-full hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20 group">
                  <CardHeader>
                    <div
                      className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}
                    >
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-primary to-green-600 text-white">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold mb-4">
              Kenapa Memilih LernLang?
            </h2>
            <p className="text-xl opacity-90 max-w-2xl mx-auto">
              Platform pembelajaran bahasa Inggris yang dirancang untuk
              kesuksesan Anda
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-6"
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/20 transition-colors"
              >
                <CheckCircle2 className="h-8 w-8 flex-shrink-0" />
                <span className="text-lg font-medium">{benefit}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Cara Mudah Memulai</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Hanya 3 langkah untuk mulai belajar bahasa Inggris
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                step: "1",
                title: "Daftar Gratis",
                description:
                  "Buat akun dalam hitungan detik tanpa biaya apapun",
                icon: <GraduationCap className="h-8 w-8" />,
              },
              {
                step: "2",
                title: "Pilih Mode",
                description: "Tentukan mode dan tingkat kesulitan yang sesuai",
                icon: <Target className="h-8 w-8" />,
              },
              {
                step: "3",
                title: "Mulai Belajar",
                description: "Latihan dan dapatkan feedback instant dari AI",
                icon: <BookOpen className="h-8 w-8" />,
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="text-center relative"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary text-white rounded-full text-2xl font-bold mb-6">
                  {item.step}
                </div>
                {index < 2 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-primary/20"></div>
                )}
                <div className="mb-4 text-primary">{item.icon}</div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-4xl font-bold mb-6">
              Siap Meningkatkan Bahasa Inggris Anda?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Bergabunglah sekarang dan mulai perjalanan belajar Anda hari ini!
            </p>
            <Button asChild size="lg" className="text-lg px-8 group">
              <Link href="/register">
                Daftar Sekarang - Gratis!
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-primary rounded-lg p-2">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">LernLang</span>
              </div>
              <p className="text-gray-400 mb-4">
                Platform belajar bahasa Inggris dengan teknologi AI terdepan.
                Gratis, mudah, dan efektif.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4">Navigasi</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="/" className="hover:text-white transition-colors">
                    Beranda
                  </Link>
                </li>
                <li>
                  <Link
                    href="/about"
                    className="hover:text-white transition-colors"
                  >
                    Tentang
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="hover:text-white transition-colors"
                  >
                    Kontak
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">Akun</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    href="/login"
                    className="hover:text-white transition-colors"
                  >
                    Masuk
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register"
                    className="hover:text-white transition-colors"
                  >
                    Daftar
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>LernLang © 2026 - Belajar Bahasa Inggris dengan AI</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
