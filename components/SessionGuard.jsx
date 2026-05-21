"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function SessionGuard() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const enforce = () => {
      const sessionId = sessionStorage.getItem("learningSessionId");
      const method = sessionStorage.getItem("learningMethod");

      if (!sessionId) return; // no active session

      // Allow staying inside learn routes. Otherwise, redirect back to active session.
      if (pathname && !pathname.startsWith("/learn")) {
        const target = `/learn/${method || ""}`;
        try {
          // Replace to avoid polluting history
          router.replace(target);
        } catch (err) {
          // fallback
          window.location.href = target;
        }
      }
    };

    enforce();

    const handleStorage = (e) => {
      if (e.key === "learningSessionId" || e.key === "learningMethod")
        enforce();
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [pathname, router]);

  return null;
}
