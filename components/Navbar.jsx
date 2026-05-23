"use client";

import Link from "next/link";
<<<<<<< HEAD
import Image from "next/image";
import { useEffect, useState } from "react";
=======
import { useState, useEffect } from "react";
>>>>>>> 3eb3d27027f6d2bdb49b6cc6118ee56598d56492
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import {
  GraduationCap, FileText, History, Settings, BarChart3, Users, 
  ClipboardList, LogOut, Menu, X, User, MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSocket } from "@/lib/socket-provider";
import NotificationBell from "@/components/NotificationBell";

// ==========================================
//   BESPOKE PLAYFUL VECTOR NAV ICONS
// ==========================================

const HomeIcon = () => (
  <svg className="w-5 h-5 transition-transform duration-100 group-hover:scale-110" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 10.1818L12 3L21 10.1818V20C21 20.5523 20.5523 21 20 21H14V14H10V21H4C3.44772 21 3 20.5523 3 20V10.1818Z" fill="#6366F1" stroke="#4338CA" strokeWidth="2.5" strokeLinejoin="round" />
  </svg>
);

const BlogIcon = () => (
  <svg className="w-5 h-5 transition-transform duration-100 group-hover:scale-110" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20V3H6.5C5.57174 3 4.6815 3.36875 4.02513 4.02513C3.36875 4.6815 3 5.57174 3 6.5V19.5C3 20.4283 3.36875 21.3185 4.02513 21.9749C4.6815 22.6313 5.57174 23 6.5 23H20V19.5H4Z" fill="#FF9600" stroke="#E65100" strokeWidth="2.5" strokeLinejoin="round" />
  </svg>
);

const AboutIcon = () => (
  <svg className="w-5 h-5 transition-transform duration-100 group-hover:scale-110" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 21H15M9 18H15M12 2C7.58 2 4 5.58 4 10C4 12.5 5.14 14.74 6.94 16.24C7.6 16.78 8 17.58 8 18.42V19C8 20.1 8.9 21 10 21H14C15.1 21 16 20.1 16 19V18.42C16 17.58 16.4 16.78 17.06 16.24C18.86 14.74 20 12.5 20 10C20 5.58 16.42 2 12 2Z" fill="#FFD54F" stroke="#FFB300" strokeWidth="2.5" strokeLinejoin="round" />
  </svg>
);

const ContactIcon = () => (
  <svg className="w-5 h-5 transition-transform duration-100 group-hover:scale-110" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="4" width="18" height="15" rx="3" fill="#1CB0F6" stroke="#0288D1" strokeWidth="2.5" />
    <path d="M3 6L12 12L21 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MascotLogo = () => (
  <svg className="w-10 h-10 group-hover:scale-110 transition-transform duration-200 drop-shadow-sm" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="15" y="20" width="70" height="70" rx="16" fill="#6366F1" />
    <rect x="15" y="20" width="70" height="60" rx="16" fill="#818CF8" />
    <line x1="50" y1="20" x2="50" y2="8" stroke="#4338CA" strokeWidth="5" strokeLinecap="round" />
    <circle cx="50" cy="8" r="5" fill="#FBBF24" />
    <circle cx="10" cy="50" r="7" fill="#4338CA" />
    <circle cx="90" cy="50" r="7" fill="#4338CA" />
    <rect x="25" y="35" width="50" height="25" rx="6" fill="#1E1B4B" />
    <ellipse cx="32" cy="53" rx="3.5" ry="2" fill="#FF8A80" opacity="0.8" />
    <ellipse cx="68" cy="53" rx="3.5" ry="2" fill="#FF8A80" opacity="0.8" />
    <circle cx="40" cy="47" r="4.5" fill="#10B981" />
    <circle cx="60" cy="47" r="4.5" fill="#10B981" />
  </svg>
);

// ==========================================
//   BESPOKE PLAYFUL VECTOR NAV ICONS
// ==========================================

const HomeIcon = () => (
  <svg className="w-5 h-5 transition-transform duration-100 group-hover:scale-110" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 10.1818L12 3L21 10.1818V20C21 20.5523 20.5523 21 20 21H14V14H10V21H4C3.44772 21 3 20.5523 3 20V10.1818Z" fill="#6366F1" stroke="#4338CA" strokeWidth="2.5" strokeLinejoin="round" />
  </svg>
);

const BlogIcon = () => (
  <svg className="w-5 h-5 transition-transform duration-100 group-hover:scale-110" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20V3H6.5C5.57174 3 4.6815 3.36875 4.02513 4.02513C3.36875 4.6815 3 5.57174 3 6.5V19.5C3 20.4283 3.36875 21.3185 4.02513 21.9749C4.6815 22.6313 5.57174 23 6.5 23H20V19.5H4Z" fill="#FF9600" stroke="#E65100" strokeWidth="2.5" strokeLinejoin="round" />
  </svg>
);

const AboutIcon = () => (
  <svg className="w-5 h-5 transition-transform duration-100 group-hover:scale-110" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 21H15M9 18H15M12 2C7.58 2 4 5.58 4 10C4 12.5 5.14 14.74 6.94 16.24C7.6 16.78 8 17.58 8 18.42V19C8 20.1 8.9 21 10 21H14C15.1 21 16 20.1 16 19V18.42C16 17.58 16.4 16.78 17.06 16.24C18.86 14.74 20 12.5 20 10C20 5.58 16.42 2 12 2Z" fill="#FFD54F" stroke="#FFB300" strokeWidth="2.5" strokeLinejoin="round" />
  </svg>
);

const ContactIcon = () => (
  <svg className="w-5 h-5 transition-transform duration-100 group-hover:scale-110" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="4" width="18" height="15" rx="3" fill="#1CB0F6" stroke="#0288D1" strokeWidth="2.5" />
    <path d="M3 6L12 12L21 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MascotLogo = () => (
  <svg className="w-10 h-10 group-hover:scale-110 transition-transform duration-200 drop-shadow-sm" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="15" y="20" width="70" height="70" rx="16" fill="#6366F1" />
    <rect x="15" y="20" width="70" height="60" rx="16" fill="#818CF8" />
    <line x1="50" y1="20" x2="50" y2="8" stroke="#4338CA" strokeWidth="5" strokeLinecap="round" />
    <circle cx="50" cy="8" r="5" fill="#FBBF24" />
    <circle cx="10" cy="50" r="7" fill="#4338CA" />
    <circle cx="90" cy="50" r="7" fill="#4338CA" />
    <rect x="25" y="35" width="50" height="25" rx="6" fill="#1E1B4B" />
    <ellipse cx="32" cy="53" rx="3.5" ry="2" fill="#FF8A80" opacity="0.8" />
    <ellipse cx="68" cy="53" rx="3.5" ry="2" fill="#FF8A80" opacity="0.8" />
    <circle cx="40" cy="47" r="4.5" fill="#10B981" />
    <circle cx="60" cy="47" r="4.5" fill="#10B981" />
  </svg>
);

export default function Navbar() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const user = session?.user;
  const isAdmin = user?.role === "ADMIN";
  const { socket } = useSocket();
  const [friendRequestCount, setFriendRequestCount] = useState(0);

  useEffect(() => {
    if (!socket) return;
    const handler = (payload) => {
      setFriendRequestCount((c) => c + 1);
    };
    socket.on("friend-request", handler);
    return () => {
      socket.off("friend-request", handler);
    };
  }, [socket]);

  const publicNavItems = [
    { name: "Beranda", href: "/", icon: <HomeIcon /> },
    { name: "Blog", href: "/blogs", icon: <BlogIcon /> },
    { name: "Tentang", href: "/about", icon: <AboutIcon /> },
    { name: "Kontak", href: "/contact", icon: <ContactIcon /> },
  ];

  return (
    <header className="bg-white/90 backdrop-blur-md border-b-4 border-gray-200 sticky top-0 z-50 font-[family-name:var(--font-nunito)] transition-all">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo (Duolingo Style: Cute 3D block) */}
          <Link href={"/"} className="flex items-center gap-3 group">
            <MascotLogo />
            <span className="text-2xl font-black text-gray-900 tracking-tight">
              Lern<span className="text-[#6366F1]">Lang</span>
            </span>
          </Link>

          {/* Navigation and Profile Section */}
          <div className="flex items-center gap-6">
            
            {/* Public Navigation Links */}
            <div className="hidden md:flex items-center gap-2">
              {publicNavItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl font-black transition-colors flex items-center gap-2.5 text-sm group"
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Auth Buttons */}
            {!user && (
              <div className="hidden md:flex items-center gap-4">
                <Link href="/login">
                  <div className="px-5 py-2.5 bg-white border-2 border-b-4 border-gray-200 text-[#1cb0f6] font-black rounded-xl cursor-pointer text-sm transition-all hover:bg-gray-50 active:translate-y-[2px] active:border-b-2">
                    MASUK
                  </div>
                </Link>
                <Link href="/register">
                  <div className="px-6 py-2.5 bg-[#6366F1] border-b-4 border-[#4338CA] text-white font-black rounded-xl cursor-pointer text-sm transition-all hover:bg-[#818CF8] active:translate-y-[2px] active:border-b-0">
                    DAFTAR GRATIS
                  </div>
                </Link>
              </div>
            )}

<<<<<<< HEAD
            {/* Bell Icon - Notifications */}
            {user && <NotificationBell />}

            {/* Profile Dropdown - Show only for authenticated users */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none">
                  <div className="relative flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
=======
            {/* Profile Dropdown */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none">
                  <div className="flex items-center gap-3 bg-white border-2 border-b-4 border-gray-200 pl-4 pr-1 py-1 rounded-full cursor-pointer hover:bg-gray-50 active:translate-y-[2px] active:border-b-2 transition-all">
>>>>>>> 3eb3d27027f6d2bdb49b6cc6118ee56598d56492
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-black text-gray-800">{user?.name}</p>
                      <p className="text-xs font-black text-[#6366F1]">
                        {isAdmin ? "Admin" : "Pelajar"}
                      </p>
                    </div>
<<<<<<< HEAD
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={user?.avatar} alt={user?.name} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getInitials(user?.name)}
                        </AvatarFallback>
                      </Avatar>
                      {friendRequestCount > 0 && (
                        <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                          {friendRequestCount}
                        </span>
                      )}
                    </div>
=======
                    <Avatar className="w-8 h-8 border-2 border-white shadow-sm">
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback className="bg-[#6366F1] text-white font-black text-xs">
                        {getInitials(user?.name)}
                      </AvatarFallback>
                    </Avatar>
>>>>>>> 3eb3d27027f6d2bdb49b6cc6118ee56598d56492
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-2xl border-2 border-b-4 border-gray-200 shadow-xl p-2 font-[family-name:var(--font-nunito)]">
                  <DropdownMenuLabel className="mb-2">
                    <p className="font-black text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-400 font-bold">{user?.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-200 mb-2" />
                  
                  <DropdownMenuItem asChild className="rounded-xl hover:bg-[#FFFDE7] focus:bg-[#FFFDE7] cursor-pointer font-black text-gray-700 mb-1">
                    <Link href="/profile"><User className="mr-2 h-4 w-4 text-orange-500" /> Profil Saya</Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild className="rounded-xl hover:bg-[#F1FFF8] focus:bg-[#F1FFF8] cursor-pointer font-black text-gray-700 mb-1">
                    <Link href="/learn"><GraduationCap className="mr-2 h-4 w-4 text-[#6366F1]" /> Belajar</Link>
<<<<<<< HEAD
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild className="rounded-xl hover:bg-[#E1F5FE] focus:bg-[#E1F5FE] cursor-pointer font-black text-gray-700 mb-1">
                    <Link href="/quiz"><FileText className="mr-2 h-4 w-4 text-[#1cb0f6]" /> Quiz & Game</Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild className="rounded-xl hover:bg-amber-50 focus:bg-amber-50 cursor-pointer font-black text-gray-700 mb-1">
                    <Link href="/history"><History className="mr-2 h-4 w-4 text-amber-500" /> Riwayat Belajar</Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild className="rounded-xl hover:bg-[#F9F0FF] focus:bg-[#F9F0FF] cursor-pointer font-black text-gray-700 mb-2">
                    <Link href="/diskusi"><MessageSquare className="mr-2 h-4 w-4 text-purple-500" /> Forum Diskusi</Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/chats" className="cursor-pointer">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Chats
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/friends" className="cursor-pointer">
                      <Users className="mr-2 h-4 w-4" />
                      Cari Teman
                    </Link>
=======
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild className="rounded-xl hover:bg-[#E1F5FE] focus:bg-[#E1F5FE] cursor-pointer font-black text-gray-700 mb-1">
                    <Link href="/quiz"><FileText className="mr-2 h-4 w-4 text-[#1cb0f6]" /> Quiz & Game</Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild className="rounded-xl hover:bg-amber-50 focus:bg-amber-50 cursor-pointer font-black text-gray-700 mb-1">
                    <Link href="/history"><History className="mr-2 h-4 w-4 text-amber-500" /> Riwayat Belajar</Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild className="rounded-xl hover:bg-[#F9F0FF] focus:bg-[#F9F0FF] cursor-pointer font-black text-gray-700 mb-2">
                    <Link href="/diskusi"><MessageSquare className="mr-2 h-4 w-4 text-purple-500" /> Forum Diskusi</Link>
>>>>>>> 3eb3d27027f6d2bdb49b6cc6118ee56598d56492
                  </DropdownMenuItem>

                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator className="bg-gray-200 my-2" />
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger className="rounded-xl font-black text-gray-700">
                          <Settings className="mr-2 h-4 w-4 text-gray-400" /> Menu Admin
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent className="rounded-xl border-2 border-gray-200 shadow-xl p-1 font-[family-name:var(--font-nunito)]">
                          <DropdownMenuItem asChild className="rounded-lg cursor-pointer font-black"><Link href="/admin"><BarChart3 className="mr-2 h-4 w-4" /> Dashboard</Link></DropdownMenuItem>
                          <DropdownMenuItem asChild className="rounded-lg cursor-pointer font-black"><Link href="/admin/quizzes"><ClipboardList className="mr-2 h-4 w-4" /> Kuis</Link></DropdownMenuItem>
                          <DropdownMenuItem asChild className="rounded-lg cursor-pointer font-black"><Link href="/admin/quizzes"><ClipboardList className="mr-2 h-4 w-4" /> Kuis</Link></DropdownMenuItem>
                          <DropdownMenuItem asChild className="rounded-lg cursor-pointer font-black"><Link href="/admin/users"><Users className="mr-2 h-4 w-4" /> Pengguna</Link></DropdownMenuItem>
                          <DropdownMenuItem asChild className="rounded-lg cursor-pointer font-black"><Link href="/admin/blogs"><FileText className="mr-2 h-4 w-4" /> Blog</Link></DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                    </>
                  )}

                  <DropdownMenuSeparator className="bg-gray-200 my-2" />
                  <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/" })} className="rounded-xl cursor-pointer text-red-600 font-black hover:bg-red-50 focus:bg-red-50">
                    <LogOut className="mr-2 h-4 w-4" /> Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b-4 border-gray-200 overflow-hidden"
          >
            <div className="px-6 py-6 space-y-4">
              {publicNavItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-3.5 py-3 px-4 rounded-xl hover:bg-gray-100 text-gray-800 font-black text-lg transition-colors group"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.icon}
                  {item.name}
                </Link>
              ))}

              {!user && (
                <div className="pt-6 border-t border-gray-100 space-y-3">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <div className="w-full py-3 rounded-xl bg-white border-2 border-b-4 border-gray-200 text-[#1cb0f6] font-black text-center">
                      MASUK
                    </div>
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                    <div className="w-full py-3 rounded-xl bg-[#6366F1] border-b-4 border-[#4338CA] text-white font-black text-center shadow-lg">
                      DAFTAR GRATIS
                    </div>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
