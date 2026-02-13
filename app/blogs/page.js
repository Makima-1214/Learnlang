"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import LoadingScreen from "@/components/LoadingScreen";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function BlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const response = await fetch("/api/blogs");
      const data = await response.json();
      if (response.ok) {
        setBlogs(data);
      }
    } catch (error) {
      console.error("Failed to fetch blogs:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-[#f0f9f4]">
      <Navbar />

      {/* Hero Section */}
      <section className="bg-linear-to-br from-green-50 via-white to-emerald-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-4 bg-green-100 text-green-700 hover:bg-green-100 text-sm px-4 py-1">
              📝 Blog
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Artikel &{" "}
              <span className="bg-linear-to-r from-primary to-green-600 bg-clip-text text-transparent">
                Tips Belajar
              </span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Temukan artikel menarik seputar tips belajar bahasa Inggris,
              panduan, dan insight untuk meningkatkan kemampuan bahasamu.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {blogs.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Belum ada artikel
            </h2>
            <p className="text-gray-500">
              Artikel akan segera tersedia. Nantikan update terbaru!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogs.map((blog, index) => (
              <motion.div
                key={blog.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link href={`/blogs/${blog.slug}`}>
                  <Card className="group h-full overflow-hidden hover:shadow-lg transition-all duration-300 border-gray-200 hover:border-primary/30 cursor-pointer">
                    {/* Cover Image */}
                    {blog.coverImage ? (
                      <div className="relative w-full h-48 overflow-hidden">
                        <Image
                          src={blog.coverImage}
                          alt={blog.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    ) : (
                      <div className="w-full h-48 bg-linear-to-br from-green-100 to-emerald-200 flex items-center justify-center">
                        <span className="text-5xl">📝</span>
                      </div>
                    )}

                    <CardContent className="p-5">
                      {/* Meta */}
                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(blog.createdAt).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            },
                          )}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {blog.author?.name || "Admin"}
                        </span>
                      </div>

                      {/* Title */}
                      <h2 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {blog.title}
                      </h2>

                      {/* Excerpt */}
                      {blog.excerpt && (
                        <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                          {blog.excerpt}
                        </p>
                      )}

                      {/* Read More */}
                      <div className="flex items-center text-primary text-sm font-medium gap-1 group-hover:gap-2 transition-all">
                        Baca Selengkapnya
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">
            © {new Date().getFullYear()} LernLang. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
