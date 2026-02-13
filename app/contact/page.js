"use client";

import LandingNavbar from "@/components/LandingNavbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import {
  Mail,
  Github,
  Linkedin,
  Globe,
  MessageSquare,
  Send,
  MapPin,
  Code2,
} from "lucide-react";

export default function ContactPage() {
  const developer = {
    name: "Fauzaro",
    role: "Full Stack Developer",
    bio: "Passionate developer yang berfokus pada pengembangan aplikasi web modern dengan Next.js, React, dan AI integration. Senang menciptakan solusi yang membuat pembelajaran lebih accessible untuk semua orang.",
    location: "Indonesia",
    skills: [
      "Next.js",
      "React",
      "Node.js",
      "Prisma",
      "MySQL",
      "AI/ML",
      "Tailwind CSS",
    ],
  };

  const socialLinks = [
    {
      icon: <Github className="h-5 w-5" />,
      label: "GitHub",
      href: "https://github.com/fauzaro01",
      color: "hover:bg-gray-800",
    },
    {
      icon: <Linkedin className="h-5 w-5" />,
      label: "LinkedIn",
      href: "https://www.linkedin.com/in/fauzaro01/",
      color: "hover:bg-blue-600",
    },
    {
      icon: <Mail className="h-5 w-5" />,
      label: "Email",
      href: "mailto:muhamadfauzan4750@gmail.com",
      color: "hover:bg-red-500",
    },
    {
      icon: <Globe className="h-5 w-5" />,
      label: "Website",
      href: "https://fauzaro.web.id",
      color: "hover:bg-green-600",
    },
  ];

  const contactReasons = [
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "Pertanyaan Umum",
      description: "Punya pertanyaan tentang cara menggunakan LernLang?",
    },
    {
      icon: <Code2 className="h-6 w-6" />,
      title: "Kolaborasi",
      description: "Tertarik untuk berkontribusi atau berkolaborasi?",
    },
    {
      icon: <Send className="h-6 w-6" />,
      title: "Feedback",
      description: "Sampaikan saran atau masukan untuk pengembangan aplikasi.",
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
            <Badge className="mb-4 px-4 py-1.5">Hubungi Kami</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-green-600 bg-clip-text text-transparent">
              Mari Terhubung!
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Punya pertanyaan, saran, atau ingin berkolaborasi? Jangan ragu
              untuk menghubungi kami. Kami senang mendengar dari Anda!
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Reasons */}
      <section className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6"
          >
            {contactReasons.map((reason, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="h-full text-center hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-4">
                      {reason.icon}
                    </div>
                    <h3 className="font-bold mb-2">{reason.title}</h3>
                    <p className="text-sm text-gray-600">
                      {reason.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Developer Profile */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary to-green-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                      {developer.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-2xl mb-1">
                        {developer.name}
                      </CardTitle>
                      <p className="text-primary font-medium">
                        {developer.role}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                        <MapPin className="h-4 w-4" />
                        {developer.location}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Tentang Developer</h3>
                    <p className="text-gray-600 leading-relaxed">
                      {developer.bio}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Tech Stack</h3>
                    <div className="flex flex-wrap gap-2">
                      {developer.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Connect With Me</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {socialLinks.map((link, index) => (
                        <a
                          key={index}
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg border hover:text-white transition-all ${link.color}`}
                        >
                          {link.icon}
                          <span className="text-sm font-medium">
                            {link.label}
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Kirim Pesan</CardTitle>
                  <p className="text-gray-600">
                    Isi form di bawah untuk mengirim pesan langsung
                  </p>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nama</Label>
                      <Input
                        id="name"
                        placeholder="Masukkan nama Anda"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="nama@example.com"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subjek</Label>
                      <Input
                        id="subject"
                        placeholder="Topik pesan Anda"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Pesan</Label>
                      <Textarea
                        id="message"
                        placeholder="Tulis pesan Anda di sini..."
                        rows={6}
                        required
                      />
                    </div>

                    <Button type="submit" className="w-full" size="lg">
                      <Send className="mr-2 h-5 w-5" />
                      Kirim Pesan
                    </Button>

                    <p className="text-xs text-center text-gray-500">
                      Pesan Anda akan dikirim ke email developer dan biasanya
                      dibalas dalam 1-2 hari kerja.
                    </p>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-primary to-green-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Siap Mulai Belajar?
            </h2>
            <p className="text-lg mb-8 opacity-90 max-w-2xl mx-auto">
              Bergabunglah dengan LernLang sekarang dan tingkatkan kemampuan
              bahasa Inggris Anda dengan cara yang menyenangkan dan efektif!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                className="text-primary font-semibold"
                asChild
              >
                <a href="/register">Daftar Gratis</a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary"
                asChild
              >
                <a href="/about">Pelajari Lebih Lanjut</a>
              </Button>
            </div>
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
