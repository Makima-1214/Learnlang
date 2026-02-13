"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";

const AVAILABLE_REACTIONS = ["👍", "❤️", "😂", "🎉", "🤔", "👏"];

export default function BlogReactions({ slug }) {
  const { data: session } = useSession();
  const [reactions, setReactions] = useState({ summary: [], total: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReactions();
  }, [slug]);

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
        fetchReactions();
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
