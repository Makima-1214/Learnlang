"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketInstance = io({
      path: "/socket.io",
      transports: ["websocket", "polling"],
    });

    socketInstance.on("connect", () => {
      console.log("Socket connected:", socketInstance.id);
      setIsConnected(true);
      // Identify current user to join personal notification room
      (async () => {
        try {
          const res = await fetch("/api/profile");
          if (res.ok) {
            const profile = await res.json();
            const userId = profile.id;
            if (userId) {
              socketInstance.emit("identify", { userId });
              socketInstance.emit("user-online", {
                userId,
                username: profile.username,
              });
            }
          }
        } catch (err) {
          console.warn("Socket identify failed:", err);
        }
      })();
    });

    socketInstance.on("disconnect", () => {
      console.log("Socket disconnected");
      setIsConnected(false);
    });

    window.addEventListener("beforeunload", () => {
      try {
        const profileRequest = fetch("/api/profile");
        profileRequest
          .then((res) => res.json())
          .then((profile) => {
            if (profile?.id) {
              socketInstance.emit("user-offline", { userId: profile.id });
            }
          });
      } catch (err) {
        console.warn("Offline emit failed:", err);
      }
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}
