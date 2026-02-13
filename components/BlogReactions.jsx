"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import { useSocket } from "@/lib/socket-provider";

const AVAILABLE_REACTIONS = ["👍", "❤️", "😂", "🎉", "🤔", "👏"];

export default function BlogReactions({ slug }) {
  const { data: session } = useSession();
  const { socket, isConnected } = useSocket();
  const [reactions, setReactions] = useState({ summary: [], total: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReactions();
  }, [slug]);

  // Socket.IO real-time listeners
  useEffect(() => {
    if (!socket || !slug) return;

    // Join blog room (will be same room as comments)
    socket.emit("join-blog", slug);

    // Listen for reaction updates
    socket.on("reaction-update", ({ action, emoji }) => {
      // Refetch reactions to get updated counts
      fetchReactions();
    });

    // Cleanup
    return () => {
      socket.off("reaction-update");
      // Don't leave room here as comments component might still need it
    };
  }, [socket, slug]);

  const fetchReactions = async () => {
    try {
      const response = await fetch(`/api/blogs/${slug}/reactions`);
      if (response.ok) {
        const data = await response.json();
        setReactions(data);
      }
    } catch (error) {
      console.error("Failed to fetch reactions:", error);
    }
  };

  const handleReaction = async (emoji) => {
    if (!session) {
      toast.error("Silakan login untuk memberikan reaksi");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/blogs/${slug}/reactions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(
          data.action === "added"
            ? `Reaksi ${emoji} ditambahkan`
            : `Reaksi ${emoji} dihapus`,
        );
        // Reactions will be updated via socket event
      } else {
        toast.error("Gagal memberikan reaksi");
      }
    } catch (error) {
      console.error("Failed to toggle reaction:", error);
      toast.error("Gagal memberikan reaksi");
    } finally {
      setLoading(false);
    }
  };

  const getReactionData = (emoji) => {
    return (
      reactions.summary.find((r) => r.emoji === emoji) || {
        count: 0,
        hasReacted: false,
      }
    );
  };

  return (
    <div className="border-t border-gray-200 pt-6">
      <h3 className="text-lg font-semibold mb-4">Reaksi</h3>
      {!session && (
        <p className="text-sm text-gray-600 mb-4">
          <Link href="/login" className="text-primary hover:underline">
            Login
          </Link>{" "}
          untuk memberikan reaksi pada artikel ini
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {AVAILABLE_REACTIONS.map((emoji) => {
          const reactionData = getReactionData(emoji);
          return (
            <Button
              key={emoji}
              variant={reactionData.hasReacted ? "default" : "outline"}
              size="sm"
              onClick={() => handleReaction(emoji)}
              disabled={loading || !session}
              className={`gap-1 ${
                reactionData.hasReacted
                  ? "bg-primary text-white"
                  : "hover:bg-gray-100"
              }`}
            >
              <span className="text-lg">{emoji}</span>
              {reactionData.count > 0 && (
                <span className="text-sm font-medium">
                  {reactionData.count}
                </span>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
