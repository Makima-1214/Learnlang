"use client";

import { useEffect, useState } from "react";
import * as Icons from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const NotificationIcon = ({ iconName }) => {
    if (iconName === "Bell") {
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9.5 3c0 0-3 2-3 6c0 4 1 8 1 8h10s1-4 1-8c0-4-3-6-3-6" />
          <circle cx="12" cy="17" r="1.5" fill="currentColor" />
          <path d="M7 19.5h10M9 21.5h6" />
        </svg>
      );
    }

    const Icon = Icons[iconName] || Icons.Bell;
    return <Icon className="w-6 h-6" />;
  };

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setNotifications(data.data.notifications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markAll = async () => {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    });
    load();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Inbox Notifikasi</h1>
          <div>
            <Button variant="outline" onClick={markAll} disabled={loading}>
              Tandai semua dibaca
            </Button>
          </div>
        </div>

        <div className="grid gap-3">
          {notifications.length === 0 && (
            <Card>
              <CardContent className="text-center text-gray-500">
                Belum ada notifikasi
              </CardContent>
            </Card>
          )}

          {notifications.map((n) => (
            <Card key={n.id} className={n.isRead ? "opacity-60" : ""}>
              <CardContent>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl">
                    <NotificationIcon iconName={n.icon || "Bell"} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{n.title}</h3>
                        {n.description && (
                          <p className="text-sm text-gray-600">
                            {n.description}
                          </p>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(n.createdAt).toLocaleString()}
                      </div>
                    </div>
                    {n.link && (
                      <div className="mt-3">
                        <Button size="sm" onClick={() => router.push(n.link)}>
                          Buka
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
