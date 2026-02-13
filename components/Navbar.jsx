"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
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
  GraduationCap,
  FileText,
  History,
  Settings,
  BarChart3,
  Users,
  ClipboardList,
  LogOut,
  Menu,
  X,
  ChevronDown,
  User,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const user = session?.user;
  const isAdmin = user?.role === "ADMIN";

  // Public navigation items
  const publicNavItems = [
    { name: "Beranda", href: "/" },
    { name: "Blog", href: "/blogs" },
    { name: "Tentang", href: "/about" },
    { name: "Kontak", href: "/contact" },
  ];

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={"/"} className="flex items-center gap-2 group">
            <div className="relative w-10 h-10 group-hover:scale-110 transition-transform">
              <Image
                src="/learnlang2.png"
                alt="LernLang Logo"
                fill
                className="object-contain rounded-lg"
              />
            </div>
            <span className="text-xl font-bold bg-linear-to-r from-primary to-green-600 bg-clip-text text-transparent">
              LernLang
            </span>
          </Link>

          {/* Navigation and Profile Section */}
          <div className="flex items-center gap-8">
            {/* Public Navigation Links - Show for all users */}
            <div className="hidden md:flex items-center gap-8">
              {publicNavItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-700 hover:text-primary font-medium transition-colors relative group"
                >
                  {item.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
                </Link>
              ))}
            </div>

            {/* Public Auth Buttons - Show only for public users (desktop) */}
            {!user && (
              <div className="hidden md:flex items-center gap-3">
                <Link href="/login">
                  <div className="px-4 py-2 rounded-md text-gray-700 font-medium hover:bg-gray-100 transition-colors cursor-pointer">
                    Masuk
                  </div>
                </Link>
                <Link href="/register">
                  <div className="px-4 py-2 rounded-md bg-primary text-white font-medium hover:bg-primary/90 transition-colors cursor-pointer">
                    Daftar Gratis
                  </div>
                </Link>
              </div>
            )}

            {/* Profile Dropdown - Show only for authenticated users */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none">
                  <div className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-medium">{user?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {isAdmin ? "Administrator" : "User"}
                      </p>
                    </div>
                    <Avatar>
                      <AvatarImage src={user?.avatar} alt={user?.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(user?.name)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div>
                      <p className="font-medium">{user?.name}</p>
                      <p className="text-xs text-muted-foreground font-normal">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profil Saya
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/learn" className="cursor-pointer">
                      <GraduationCap className="mr-2 h-4 w-4" />
                      Belajar
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem disabled>
                    <FileText className="mr-2 h-4 w-4" />
                    Quiz (Segera Hadir)
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link href="/history" className="cursor-pointer">
                      <History className="mr-2 h-4 w-4" />
                      History
                    </Link>
                  </DropdownMenuItem>

                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <Settings className="mr-2 h-4 w-4" />
                          Admin
                        </DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                          <DropdownMenuItem asChild>
                            <Link href="/admin" className="cursor-pointer">
                              <BarChart3 className="mr-2 h-4 w-4" />
                              Dashboard
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href="/admin/reports"
                              className="cursor-pointer"
                            >
                              <ClipboardList className="mr-2 h-4 w-4" />
                              Reports
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href="/admin/users"
                              className="cursor-pointer"
                            >
                              <Users className="mr-2 h-4 w-4" />
                              Users Management
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link
                              href="/admin/blogs"
                              className="cursor-pointer"
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              Blog Management
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuSub>
                    </>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Mobile Menu Button - Show for all users */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu for Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b"
          >
            <div className="px-4 py-4 space-y-3">
              {/* Public Navigation Items */}
              {publicNavItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block py-2 px-3 rounded-lg hover:bg-gray-100 font-medium transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {/* Auth Buttons for Public Users */}
              {!user && (
                <>
                  <div className="border-t border-gray-200 my-2"></div>
                  <Link href="/login">
                    <div className="block py-2 px-3 rounded-lg text-gray-700 font-medium hover:bg-gray-100 transition-colors text-center">
                      Masuk
                    </div>
                  </Link>
                  <Link href="/register">
                    <div className="block py-2 px-3 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-colors text-center">
                      Daftar Gratis
                    </div>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
