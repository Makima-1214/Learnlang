"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ChatWindow from "@/components/ChatWindow";
import FriendsList from "@/components/FriendsList";
import Navbar from "@/components/Navbar";

export default function ChatsClient({ initialUserId = null }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedFriendId, setSelectedFriendId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (session === null) {
      router.push("/login");
    }
  }, [session, router]);

  useEffect(() => {
    if (!session) return;
    loadConversations();
  }, [session, initialUserId]);

  useEffect(() => {
    if (!initialUserId) return;
    setSelectedFriendId(initialUserId);
  }, [initialUserId]);

  const loadConversations = async () => {
    try {
      const res = await fetch("/api/messages/list", { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      const mapped = (data?.data?.conversations || []).map((item) => ({
        friendId: item.user.id,
        friend: item.user,
        lastMessage: item.lastMessage,
        unreadCount: item.unreadCount,
      }));
      setConversations(mapped);
      if (initialUserId) {
        setSelectedFriendId(initialUserId);
      } else if (mapped.length > 0) {
        setSelectedFriendId((prev) => prev || mapped[0].friendId);
      }
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex h-[calc(100vh-4rem)] bg-white flex-col md:flex-row max-w-6xl mx-auto border-x border-gray-200">
        <div className="md:hidden flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-white">
          <h2 className="text-lg font-semibold">Pesan</h2>
          <button
            className="text-sm text-primary"
            onClick={() => setIsSidebarOpen((s) => !s)}
          >
            {isSidebarOpen ? "Tutup" : "Teman"}
          </button>
        </div>

        <div
          className={`${isSidebarOpen ? "block" : "hidden"} w-full md:w-96 border-r border-gray-200 bg-white overflow-hidden md:block`}
        >
          <FriendsList
            conversations={conversations}
            selectedFriendId={selectedFriendId}
            onSelectFriend={(id) => {
              setSelectedFriendId(id);
              if (typeof window !== "undefined" && window.innerWidth < 768) {
                setIsSidebarOpen(false);
              }
            }}
            isLoading={isLoading}
            onConversationsUpdate={setConversations}
          />
        </div>

        <div
          className={`${isSidebarOpen ? "hidden md:block" : "block"} flex-1 bg-white overflow-hidden`}
        >
          {selectedFriendId ? (
            <ChatWindow
              friendId={selectedFriendId}
              friend={
                conversations.find((c) => c.friendId === selectedFriendId)
                  ?.friend
              }
              onMessageSent={() => loadConversations()}
              onOpenSidebar={() => setIsSidebarOpen(true)}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <p className="text-lg font-medium mb-2">Tidak ada percakapan</p>
                <p className="text-sm">Pilih teman untuk memulai percakapan</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
