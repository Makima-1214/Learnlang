"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import Image from "next/image";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import BlogReactions from "@/components/BlogReactions";
import BlogComments from "@/components/BlogComments";

// ==================================================
// CUSTOM SVG ICONS
// ==================================================
const ArrowLeftIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 16 16" fill="none">
    <rect x="1.5" y="3" width="13" height="11" rx="2.5" stroke="currentColor" strokeWidth="1.5" />
    <path d="M1.5 7h13" stroke="currentColor" strokeWidth="1.5" />
    <path d="M5 1.5v3M11 1.5v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="5.5" r="3" stroke="currentColor" strokeWidth="1.5" />
    <path d="M2.5 14c0-2.5 2.2-4.5 5.5-4.5s5.5 2 5.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const EmptyStateIcon = () => (
  <svg className="w-24 h-24 mx-auto mb-6 drop-shadow-lg" viewBox="0 0 100 100" fill="none">
    <path d="M15 30c0-3 8-8 35-8s35 5 35 8v42c0 3-8 6-35 6s-35-3-35-6V30z" fill="#FEE2E2" />
    <path d="M50 22v50" stroke="#EF4444" strokeWidth="2" strokeDasharray="4 2" />
    <circle cx="50" cy="54" r="10" fill="#EF4444" />
    <text x="50" y="59" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">!</text>
  </svg>
);
// ==================================================

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
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
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-lg font-black text-[#9333EA] animate-pulse">Memuat Artikel...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (notFound) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-[#F0F7FF] flex items-center justify-center p-4">
          <div className="text-center bg-white rounded-3xl border-4 border-b-8 border-gray-200 p-8 shadow-sm max-w-md w-full">
            <EmptyStateIcon />
            <h1 className="text-2xl font-black text-gray-900 mb-2">
              Artikel Tidak Ditemukan
            </h1>
            <p className="text-sm font-bold text-gray-500 mb-8">
              Artikel yang Anda cari tidak tersedia atau telah dihapus.
            </p>
            <button
              onClick={() => router.push("/blogs")}
              className="w-full flex justify-center items-center gap-2 px-5 py-3.5 bg-[#9333EA] hover:bg-[#A855F7] text-white border-b-4 border-[#7E22CE] rounded-2xl font-black text-sm duo-btn transition-all"
            >
              <ArrowLeftIcon />
              Kembali ke Blog
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <style dangerouslySetInnerHTML={{
        __html: `
        .duo-btn { border-bottom-width: 4px; transition: all 0.1s ease; }
        .duo-btn:hover { transform: translateY(-2px); border-bottom-width: 6px; }
        .duo-btn:active { transform: translateY(4px); border-bottom-width: 0px; }
        .cloud-bg { position: absolute; background: white; border-radius: 999px; opacity: 0.7; border: 3px solid #E2E8F0; }
        .prose-custom p { margin-bottom: 1.25em; }
        .prose-custom h2 { color: #111827; font-weight: 900; margin-top: 2em; margin-bottom: 0.75em; font-size: 1.5rem; }
        .prose-custom h3 { color: #111827; font-weight: 900; margin-top: 1.5em; margin-bottom: 0.5em; font-size: 1.25rem; }
        .prose-custom ul, .prose-custom ol { padding-left: 1.5em; margin-bottom: 1.25em; font-weight: 700; color: #4B5563; }
        .prose-custom li { margin-bottom: 0.5em; }
        .prose-custom a { color: #9333EA; font-weight: 900; text-decoration: none; }
        .prose-custom a:hover { text-decoration: underline; }
        .prose-custom blockquote { border-left: 4px solid #9333EA; padding-left: 1em; color: #6B7280; font-style: italic; font-weight: 700; background: #FAF5FF; padding: 1rem; border-radius: 0 1rem 1rem 0; margin-bottom: 1.25em; }
        `
      }} />

      <div className="min-h-screen bg-[#F0F7FF] relative w-full font-[family-name:var(--font-nunito)] overflow-x-hidden pb-20">
        {/* Cloud Decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="cloud-bg w-48 h-16 top-12 -left-12 shadow-sm animate-[bounce_4s_infinite]" />
          <div className="cloud-bg w-64 h-20 top-32 -right-16 shadow-sm animate-[bounce_5s_infinite]" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-10 relative z-10 flex flex-col gap-6">
          
          {/* Top Bar with Back Button */}
          <div className="flex items-center">
            <button
              onClick={() => router.push("/blogs")}
              className="duo-btn flex items-center gap-2 px-4 py-2.5 bg-white border-2 border-b-4 border-gray-200 hover:border-[#9333EA]/30 hover:bg-[#FAF5FF] rounded-2xl font-black text-gray-700 text-sm shadow-sm"
            >
              <ArrowLeftIcon />
              Kembali
            </button>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white border-4 border-b-[8px] border-gray-200 rounded-3xl shadow-sm overflow-hidden"
          >
            {/* Cover Image */}
            {blog.coverImage ? (
              <div className="relative w-full h-48 sm:h-72 md:h-96 border-b-4 border-gray-200">
                <Image
                  src={blog.coverImage}
                  alt={blog.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            ) : (
              <div className="w-full h-32 bg-gradient-to-br from-[#E9D5FF] to-[#D8B4FE] border-b-4 border-gray-200 flex items-center justify-center">
                <svg className="w-12 h-12 text-[#A855F7] drop-shadow-sm" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="14" height="17" rx="2.5" stroke="currentColor" strokeWidth="2" />
                  <rect x="7" y="4" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
                  <path d="M6 9h8M6 12h8M6 15h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
            )}

            <div className="p-6 sm:p-10">
              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF5FF] border-2 border-[#E9D5FF] text-[#9333EA] text-[10px] font-black uppercase tracking-wider rounded-xl">
                  📝 Artikel Blog
                </span>
                <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-gray-400">
                  <CalendarIcon />
                  {new Date(blog.createdAt).toLocaleDateString("id-ID", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <span className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-gray-400">
                  <UserIcon />
                  {blog.author?.name || "Admin"}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-6 leading-tight tracking-tight">
                {blog.title}
              </h1>

              {/* Excerpt */}
              {blog.excerpt && (
                <div className="bg-[#EEF2FF] border-2 border-[#C7D2FE] rounded-2xl p-5 mb-8">
                  <p className="text-sm sm:text-base font-bold text-[#4338CA] leading-relaxed">
                    "{blog.excerpt}"
                  </p>
                </div>
              )}

              {/* Markdown Content */}
              <div className="prose-custom text-gray-700 text-base sm:text-lg font-bold leading-relaxed mb-12">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw, rehypeSanitize]}
                >
                  {blog.content}
                </ReactMarkdown>
              </div>

              {/* Divider */}
              <div className="h-1.5 w-full bg-gray-100 rounded-full mb-10" />

              {/* Interactions */}
              <div className="flex flex-col gap-10">
                <BlogReactions slug={params.slug} />
                <BlogComments slug={params.slug} />
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </DashboardLayout>
  );
}
