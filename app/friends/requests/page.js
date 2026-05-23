"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, X, Mail, Users } from "lucide-react";
import { toast } from "sonner";

export default function FriendRequestsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      loadRequests();
    }
  }, [status, router]);

  const loadRequests = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/friends/request");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal memuat permintaan teman");
      }

      setRequests(data.data.requests || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    setActionLoading(`accept-${requestId}`);
    try {
      const response = await fetch(`/api/friends/request/${requestId}/accept`, {
        method: "POST",
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Gagal menerima permintaan");
      toast.success("Permintaan teman diterima");
      setRequests((prev) => prev.filter((item) => item.id !== requestId));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async (requestId) => {
    setActionLoading(`decline-${requestId}`);
    try {
      const response = await fetch(
        `/api/friends/request/${requestId}/decline`,
        {
          method: "DELETE",
        },
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Gagal menolak permintaan");
      toast.success("Permintaan teman ditolak");
      setRequests((prev) => prev.filter((item) => item.id !== requestId));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading || status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-4xl mx-auto p-4 sm:p-6 space-y-4">
          {[1, 2, 3].map((item) => (
            <Skeleton key={item} className="h-36 w-full rounded-xl" />
          ))}
        </main>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Mail className="w-8 h-8" />
              Inbox Permintaan Teman
            </h1>
            <p className="text-gray-600 mt-1">
              Kelola permintaan pertemanan yang masuk
            </p>
          </div>
          <Badge variant="secondary" className="h-8 px-3">
            <Users className="w-4 h-4 mr-2" />
            {requests.length} pending
          </Badge>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {requests.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-gray-500">
              Belum ada permintaan teman masuk.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <Card key={request.id}>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-14 h-14">
                        <AvatarImage
                          src={request.sender?.avatar}
                          alt={request.sender?.name}
                        />
                        <AvatarFallback>
                          {request.sender?.name?.[0] || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="font-semibold text-lg">
                            {request.sender?.name}
                          </h2>
                          {request.sender?.username && (
                            <Badge variant="outline">
                              @{request.sender.username}
                            </Badge>
                          )}
                        </div>
                        {request.sender?.bio && (
                          <p className="text-sm text-gray-600 mt-1 max-w-xl">
                            {request.sender.bio}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleAccept(request.id)}
                        disabled={actionLoading !== null}
                      >
                        <Check className="w-4 h-4 mr-2" />
                        {actionLoading === `accept-${request.id}`
                          ? "Menerima..."
                          : "Terima"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleDecline(request.id)}
                        disabled={actionLoading !== null}
                      >
                        <X className="w-4 h-4 mr-2" />
                        {actionLoading === `decline-${request.id}`
                          ? "Menolak..."
                          : "Tolak"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
