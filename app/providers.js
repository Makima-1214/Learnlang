"use client";

import { SessionProvider } from "next-auth/react";
import { SocketProvider } from "@/lib/socket-provider";
import SessionGuard from "@/components/SessionGuard";

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <SocketProvider>
        <SessionGuard />
        {children}
      </SocketProvider>
    </SessionProvider>
  );
}
