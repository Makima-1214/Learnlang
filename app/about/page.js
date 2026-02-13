"use client";

import Navbar from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Target,
  Sparkles,
  Trophy,
  Zap,
  Brain,
  Globe,
  Users,
  BookOpen,
  CheckCircle2,
} from "lucide-react";

export default function AboutPage() {
  const features = [
    {
      icon: <Brain className="h-8 w-8" />,
      title: "AI-Powered Learning",
      description:
        "Menggunakan teknologi AI terkini (Ollama) untuk evaluasi terjemahan yang akurat dan feedback yang personal.",
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Dua Arah Translasi",
      description:
        "Belajar menerjemahkan dari English ke Indonesia dan sebaliknya, meningkatkan kemampuan dua bahasa secara bersamaan.",
    },
    {
      icon: <Trophy className="h-8 w-8" />,
      title: "Sistem Scoring",
      description:
        "Dapatkan skor dan feedback detail untuk setiap terjemahan, membantu Anda memahami kesalahan dan memperbaikinya.",
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "Tingkat Kesulitan",
      description:
        "Pilih level kesulitan (Mudah, Sedang, Sulit) yang sesuai dengan kemampuan Anda saat ini.",
    },
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: "Riwayat Belajar",
      description:
        "Lacak progres Anda dengan history lengkap semua latihan yang pernah dikerjakan.",
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Gratis & Tanpa Batas",
      description:
        "Akses penuh ke semua fitur tanpa biaya langganan atau batasan jumlah latihan.",
    },
  ];

  const stats = [
    { value: "100%", label: "Gratis" },
    { value: "AI", label: "Powered" },
    { value: "24/7", label: "Tersedia" },
    { value: "∞", label: "Latihan" },
  ];

  const howItWorks = [
    {
      step: "1",
      title: "Pilih Mode & Kesulitan",
      description:
        "Tentukan arah translasi dan level kesulitan sesuai kemampuan Anda.",
    },
    {
      step: "2",
      title: "Generate Kalimat",
      description:
        "Sistem akan menghasilkan kalimat random sesuai level yang dipilih.",
    },
    {
      step: "3",
      title: "Terjemahkan",
      description: "Ketik terjemahan Anda dengan kemampuan terbaik.",
    },
    {
      step: "4",
      title: "Evaluasi AI",
      description: "AI akan menilai terjemahan dan memberikan feedback detail.",
    },
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge className="mb-4 px-4 py-1.5">Tentang LernLang</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent">
              Platform Belajar Bahasa Inggris dengan AI
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              LernLang adalah aplikasi pembelajaran bahasa Inggris yang
              menggunakan kecerdasan buatan untuk membantu Anda meningkatkan
              kemampuan menerjemahkan dengan cara yang interaktif dan
              menyenangkan.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Kenapa Memilih LernLang?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Fitur-fitur unggulan yang membuat pembelajaran bahasa Inggris
              menjadi lebih efektif dan menyenangkan
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Cara Menggunakan LernLang
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Proses pembelajaran yang sederhana dan efektif dalam 4 langkah
              mudah
            </p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 gap-8"
          >
            {howItWorks.map((step, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="flex gap-4"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {step.step}
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-gradient-to-br from-primary to-green-600 text-white">
              <CardContent className="p-12 text-center">
                <Target className="h-16 w-16 mx-auto mb-6 opacity-90" />
                <h2 className="text-3xl font-bold mb-6">Misi Kami</h2>
                <p className="text-lg leading-relaxed opacity-90 max-w-2xl mx-auto">
                  Membuat pembelajaran bahasa Inggris lebih mudah diakses dan
                  efektif untuk semua orang melalui teknologi AI. Kami percaya
                  bahwa setiap orang berhak mendapatkan pendidikan berkualitas
                  tanpa hambatan biaya atau lokasi.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-gray-400">
            LernLang © 2026 - Belajar Bahasa Inggris dengan AI
          </p>
        </div>
      </footer>
    </div>
  );
}
