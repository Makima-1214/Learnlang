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
      const [friendsResponse, conversationsResponse] = await Promise.all([
        fetch("/api/friends?type=friends", { cache: "no-store" }),
        fetch("/api/chats/conversations", { cache: "no-store" }),
      ]);

      const friendsData = friendsResponse.ok
        ? await friendsResponse.json()
        : null;
      const conversationsData = conversationsResponse.ok
        ? await conversationsResponse.json()
        : null;

      const friends = (friendsData?.data?.users || []).map((user) => ({
        friendId: user.id,
        friend: user,
        lastMessage: null,
        unreadCount: 0,
      }));

      const conversationMap = new Map(
        (conversationsData?.data?.conversations || []).map((item) => [
          item.friendId,
          item,
        ]),
      );

      const merged = friends.map((friend) => {
        const match = conversationMap.get(friend.friendId);
        return match
          ? {
              ...friend,
              friend: {
                ...friend.friend,
                ...match.friend,
              },
              lastMessage: match.lastMessage,
              unreadCount: match.unreadCount,
            }
          : friend;
      });

      const conversationOnly = (conversationsData?.data?.conversations || [])
        .filter(
          (item) => !merged.some((friend) => friend.friendId === item.friendId),
        )
        .map((item) => ({
          friendId: item.friendId,
          friend: item.friend,
          lastMessage: item.lastMessage,
          unreadCount: item.unreadCount,
        }));

      const mapped = [...merged, ...conversationOnly];

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
      <div className="flex min-h-0 h-[calc(100vh-4rem)] bg-white flex-col md:flex-row max-w-6xl mx-auto border-x border-gray-200">
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
          className={`${isSidebarOpen ? "block" : "hidden"} min-h-0 w-full md:w-96 border-r border-gray-200 bg-white overflow-hidden md:block`}
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
          className={`${isSidebarOpen ? "hidden md:block" : "block"} min-h-0 flex-1 bg-white overflow-hidden`}
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
