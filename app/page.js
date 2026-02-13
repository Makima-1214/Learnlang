"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
import Navbar from "@/components/Navbar";
import LoadingScreen from "@/components/LoadingScreen";
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
      gradient: "from-green-400 to-emerald-400",
    },
    {
      icon: <Brain className="h-8 w-8" />,
      title: "Evaluasi AI",
      description:
        "Dapatkan penilaian instant dengan skor 0-100 dan feedback detail dari AI.",
      gradient: "from-teal-400 to-green-400",
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Tracking Progress",
      description:
        "Pantau perkembangan belajar Anda dengan statistik dan riwayat lengkap.",
      gradient: "from-emerald-400 to-green-500",
    },
    {
      icon: <Target className="h-8 w-8" />,
      title: "3 Tingkat Kesulitan",
      description:
        "Mulai dari level mudah hingga sulit, sesuaikan dengan kemampuan Anda.",
      gradient: "from-lime-400 to-green-400",
    },
    {
      icon: <Sparkles className="h-8 w-8" />,
      title: "Feedback Konstruktif",
      description:
        "Dapatkan penjelasan detail tentang kesalahan dan cara memperbaikinya.",
      gradient: "from-green-300 to-emerald-400",
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "Data Aman",
      description:
        "Semua progress Anda tersimpan aman di database dan dapat diakses kapan saja.",
      gradient: "from-teal-300 to-green-400",
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
    return <LoadingScreen fullPage={true} />;
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-green-50 via-white to-green-50">
      <Navbar />

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
                <span className="bg-linear-to-r from-primary via-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Sistem Pembelajaran
                </span>
                <br />
                <span className="text-gray-900">Bahasa Inggris dengan AI</span>
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
                      className={`w-16 h-16 bg-linear-to-br ${feature.gradient} rounded-xl flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}
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
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">
              Kenapa Memilih LernLang?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Platform pembelajaran bahasa Inggris yang dirancang untuk
              kesuksesan Anda
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src="/banner_learnlang.png"
                  alt="LernLang Platform"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Decorative element */}
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/10 rounded-full blur-2xl -z-10"></div>
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-2xl font-bold mb-4 text-primary">
                  Pembelajaran yang Efektif dan Menyenangkan
                </h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  LernLang dirancang khusus untuk membantu Anda menguasai bahasa
                  Inggris dengan cara yang interaktif dan personal. Menggunakan
                  teknologi AI terkini, kami memberikan feedback real-time yang
                  akurat dan membantu Anda belajar dari setiap kesalahan.
                </p>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Dengan sistem evaluasi yang canggih, Anda tidak hanya
                  mendapatkan skor, tetapi juga pemahaman mendalam tentang
                  struktur bahasa, grammar, dan konteks penggunaan kata yang
                  tepat. Setiap latihan dirancang untuk meningkatkan kemampuan
                  Anda secara bertahap.
                </p>
              </div>

              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 * index }}
                    className="flex items-center gap-3 bg-green-50 rounded-lg p-4"
                  >
                    <CheckCircle2 className="h-6 w-6 text-primary shrink-0" />
                    <span className="text-gray-700 font-medium">{benefit}</span>
                  </motion.div>
                ))}
              </div>

              <div className="pt-4">
                <Button asChild size="lg" className="text-lg px-8">
                  <Link href="/register">
                    Mulai Belajar Sekarang
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
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
                <div className="mb-4 text-primary flex justify-center">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-linear-to-br from-green-50 to-emerald-50">
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
                <div className="relative w-8 h-8">
                  <Image
                    src="/learnlang.png"
                    alt="LernLang Logo"
                    fill
                    className="object-contain"
                  />
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
