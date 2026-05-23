"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import LoadingScreen from "@/components/LoadingScreen";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import BlogReactions from "@/components/BlogReactions";
import BlogComments from "@/components/BlogComments";

export default function BlogDetailPage() {
  const params = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (params.slug) {
      fetchBlog();
    }
  }, [params.slug]);

  const fetchBlog = async () => {
    try {
      const response = await fetch(`/api/blogs/${params.slug}`);
      if (response.ok) {
        const data = await response.json();
        setBlog(data);
      } else {
        setNotFound(true);
      }
    } catch (error) {
      console.error("Failed to fetch blog:", error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#f0f9f4]">
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Artikel Tidak Ditemukan
          </h1>
          <p className="text-gray-500 mb-8">
            Artikel yang Anda cari tidak tersedia atau telah dihapus.
          </p>
          <Link href="/blogs">
            <Button className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Kembali ke Blog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f0f9f4]">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link href="/blogs">
          <Button
            variant="ghost"
            className="gap-2 mb-6 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Blog
          </Button>
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Cover Image */}
          {blog.coverImage && (
            <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden mb-8 shadow-lg">
              <Image
                src={blog.coverImage}
                alt={blog.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
              Blog
            </Badge>
            <span className="flex items-center gap-1 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              {new Date(blog.createdAt).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
            <span className="flex items-center gap-1 text-sm text-gray-500">
              <User className="h-4 w-4" />
              {blog.author?.name || "Admin"}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
            {blog.title}
          </h1>

          {/* Excerpt */}
          {blog.excerpt && (
            <p className="text-lg text-gray-600 mb-8 border-l-4 border-primary pl-4 italic">
              {blog.excerpt}
            </p>
          )}

          {/* Content */}
          <div
            className="prose prose-green prose-lg max-w-none
            prose-headings:text-gray-900 prose-headings:font-bold
            prose-p:text-gray-700 prose-p:leading-relaxed
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-strong:text-gray-900
            prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono
            prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:rounded-xl prose-pre:shadow-lg
            prose-blockquote:border-l-primary prose-blockquote:bg-green-50 prose-blockquote:rounded-r-lg prose-blockquote:py-1
            prose-img:rounded-xl prose-img:shadow-md
            prose-li:text-gray-700
            prose-table:border-collapse
            prose-th:bg-green-50 prose-th:border prose-th:border-gray-200 prose-th:px-4 prose-th:py-2
            prose-td:border prose-td:border-gray-200 prose-td:px-4 prose-td:py-2
          "
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, rehypeSanitize]}
            >
              {blog.content}
            </ReactMarkdown>
          </div>

          {/* Reactions Section */}
          <div className="mt-12">
            <BlogReactions slug={params.slug} />
          </div>

          {/* Comments Section */}
          <div className="mt-8">
            <BlogComments slug={params.slug} />
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 mt-12 pt-8">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Ditulis oleh</p>
                <p className="font-medium text-gray-900">
                  {blog.author?.name || "Admin"}
                </p>
              </div>
              <Link href="/blogs">
                <Button variant="outline" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Lihat Artikel Lainnya
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </article>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">
            © {new Date().getFullYear()} LernLang. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
