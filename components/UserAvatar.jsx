"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

/**
 * Warna fallback berdasarkan huruf pertama nama
 * — 8 palet berbeda agar tiap user terasa unik
 */
const PALETTES = [
  { bg: "bg-violet-100", border: "border-violet-300", head: "#7C3AED", body: "#8B5CF6" },
  { bg: "bg-sky-100",    border: "border-sky-300",    head: "#0284C7", body: "#0EA5E9" },
  { bg: "bg-emerald-100",border: "border-emerald-300",head: "#059669", body: "#10B981" },
  { bg: "bg-rose-100",   border: "border-rose-300",   head: "#E11D48", body: "#F43F5E" },
  { bg: "bg-amber-100",  border: "border-amber-300",  head: "#D97706", body: "#F59E0B" },
  { bg: "bg-indigo-100", border: "border-indigo-300", head: "#4338CA", body: "#6366F1" },
  { bg: "bg-teal-100",   border: "border-teal-300",   head: "#0F766E", body: "#14B8A6" },
  { bg: "bg-pink-100",   border: "border-pink-300",   head: "#BE185D", body: "#EC4899" },
];

function getPalette(name) {
  if (!name) return PALETTES[5]; // default indigo
  const code = name.charCodeAt(0);
  return PALETTES[code % PALETTES.length];
}

/**
 * Icon orang custom dengan desain modern & unik
 * Desain: geometric abstract person dengan gradient & detail artistik
 */
function PersonIcon({ headColor, bodyColor, size = 32 }) {
  const s = size;
  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        {/* Gradient untuk kepala */}
        <linearGradient id={`head-grad-${headColor}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={headColor} stopOpacity="1" />
          <stop offset="100%" stopColor={bodyColor} stopOpacity="0.9" />
        </linearGradient>
        {/* Gradient untuk badan */}
        <linearGradient id={`body-grad-${bodyColor}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={bodyColor} stopOpacity="0.95" />
          <stop offset="100%" stopColor={headColor} stopOpacity="0.7" />
        </linearGradient>
        {/* Glow effect */}
        <filter id={`glow-${headColor}`}>
          <feGaussianBlur stdDeviation="0.8" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Background circle subtle */}
      <circle cx="16" cy="16" r="14" fill={bodyColor} opacity="0.08" />
      
      {/* Kepala - geometric rounded */}
      <circle 
        cx="16" 
        cy="10.5" 
        r="5.8" 
        fill={`url(#head-grad-${headColor})`}
        filter={`url(#glow-${headColor})`}
      />
      
      {/* Highlight kepala - artistic touch */}
      <ellipse 
        cx="14.5" 
        cy="8.5" 
        rx="2.2" 
        ry="2.8" 
        fill="white" 
        opacity="0.3"
        transform="rotate(-25 14.5 8.5)"
      />
      
      {/* Leher dengan style */}
      <path
        d="M13.5 15.5 L13.5 17.5 C13.5 18 14 18.5 14.5 18.5 L17.5 18.5 C18 18.5 18.5 18 18.5 17.5 L18.5 15.5"
        fill={headColor}
        opacity="0.75"
      />
      
      {/* Badan - abstract geometric shape */}
      <path
        d="M7 29 C7 22 10.5 18.5 16 18.5 C21.5 18.5 25 22 25 29 L7 29 Z"
        fill={`url(#body-grad-${bodyColor})`}
      />
      
      {/* Bahu kiri - geometric accent */}
      <path
        d="M7 29 C7.5 24 10 20.5 13 19.5"
        stroke={headColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.4"
      />
      
      {/* Bahu kanan - geometric accent */}
      <path
        d="M25 29 C24.5 24 22 20.5 19 19.5"
        stroke={headColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.4"
      />
      
      {/* Detail badan - artistic lines */}
      <path
        d="M16 19 L16 29"
        stroke="white"
        strokeWidth="0.8"
        opacity="0.15"
      />
      
      {/* Collar accent - modern touch */}
      <path
        d="M13 19.5 L16 21 L19 19.5"
        stroke="white"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.25"
      />
      
      {/* Sparkle effect - top right */}
      <circle cx="20" cy="7" r="0.8" fill="white" opacity="0.6" />
      <circle cx="22" cy="9" r="0.5" fill="white" opacity="0.4" />
    </svg>
  );
}

/**
 * UserAvatar — drop-in replacement untuk Avatar + AvatarImage + AvatarFallback
 *
 * Props:
 *   src       — URL gambar (opsional)
 *   name      — nama user, untuk warna palet & inisial
 *   className — class tambahan untuk Avatar root
 *   size      — ukuran icon SVG fallback (default 32)
 *   showInitial — tampilkan inisial di atas icon (default false)
 */
export default function UserAvatar({
  src,
  name,
  className,
  size = 32,
  showInitial = false,
  ...props
}) {
  const palette = getPalette(name);
  const initial = name ? name.charAt(0).toUpperCase() : "?";

  return (
    <Avatar className={cn("border-2", palette.border, className)} {...props}>
      {src && <AvatarImage src={src} alt={name ?? "avatar"} />}
      <AvatarFallback
        className={cn(
          "flex items-center justify-center overflow-hidden",
          palette.bg
        )}
      >
        {showInitial ? (
          /* Mode inisial — untuk avatar kecil */
          <span
            className="font-black text-sm leading-none"
            style={{ color: palette.head }}
          >
            {initial}
          </span>
        ) : (
          /* Mode icon orang — untuk avatar medium/besar */
          <PersonIcon
            headColor={palette.head}
            bodyColor={palette.body}
            size={size}
          />
        )}
      </AvatarFallback>
    </Avatar>
  );
}
