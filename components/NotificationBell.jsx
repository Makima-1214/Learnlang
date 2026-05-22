"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { useSocket } from "@/lib/socket-provider";

export default function NotificationBell() {
  const { socket } = useSocket();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingRead, setIsMarkingRead] = useState(false);

  // Load initial notifications
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch("/api/notifications");
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        // Take latest 5
        const latest5 = (data.data.notifications || []).slice(0, 5);
        setNotifications(latest5);
        const unread = (data.data.notifications || []).filter(
          (n) => !n.isRead,
        ).length;
        setUnreadCount(unread);
      } catch (err) {
        console.error("Failed to load notifications:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Listen for realtime notifications
  useEffect(() => {
    if (!socket) return;
    const handler = (payload) => {
      // Prepend new notification to list
      setNotifications((prev) => {
        const updated = [payload, ...prev];
        // Keep only 5
        return updated.slice(0, 5);
      });
      setUnreadCount((prev) => prev + 1);
    };
    socket.on("notification", handler);
    return () => {
      socket.off("notification", handler);
    };
  }, [socket]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins}m lalu`;
    if (diffHours < 24) return `${diffHours}h lalu`;
    if (diffDays < 7) return `${diffDays}d lalu`;
    return date.toLocaleDateString("id-ID");
  };

  const handleBellClick = async () => {
    setIsOpen((prev) => !prev);

    if (unreadCount <= 0 || isMarkingRead) return;

    // Optimistic UI: bell click acts like "mark all as read"
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

    try {
      setIsMarkingRead(true);
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
    } catch (err) {
      console.error("Failed to mark notifications as read:", err);
    } finally {
      setIsMarkingRead(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleBellClick}
        className="relative p-2 text-gray-700 hover:text-primary transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center w-5 h-5 text-xs font-bold leading-none text-white bg-amber-600 rounded-full">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Notifikasi</h3>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500">
                Memuat notifikasi...
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500">
                Tidak ada notifikasi
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                    !notif.isRead ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex gap-3">
                    {notif.icon && (
                      <div className="flex-shrink-0 text-xl">{notif.icon}</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {notif.title}
                        </h4>
                        {!notif.isRead && (
                          <span className="ml-2 inline-block w-2 h-2 bg-blue-600 rounded-full flex-shrink-0 mt-1"></span>
                        )}
                      </div>
                      {notif.description && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notif.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(notif.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-100 text-center">
            <Link
              href="/notifications"
              className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Lihat Semua Notifikasi
            </Link>
          </div>
        </div>
      )}

      {/* Close dropdown on outside click */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
}
