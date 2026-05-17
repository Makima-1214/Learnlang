"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useSocket } from "@/lib/socket-provider";
import { MessageSquare, Search } from "lucide-react";

export default function FriendsList({
  conversations,
  selectedFriendId,
  onSelectFriend,
  isLoading,
  onConversationsUpdate,
}) {
  const { socket } = useSocket();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredConversations, setFilteredConversations] =
    useState(conversations);

  // Update filtered conversations when search term or conversations change
  useEffect(() => {
    const filtered = conversations.filter((conv) =>
      conv.friend.name.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    setFilteredConversations(filtered);
  }, [searchTerm, conversations]);

  // Listen for new messages to update conversations list
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (message) => {
      onConversationsUpdate((prev) => {
        const updated = [...prev];
        const convIndex = updated.findIndex(
          (c) =>
            c.friendId === message.senderId ||
            c.friendId === message.receiverId,
        );

        if (convIndex > -1) {
          const [conv] = updated.splice(convIndex, 1);
          conv.lastMessage = message;

          // increment unread only if message came from friend and this thread isn't active
          if (
            message.senderId === conv.friendId &&
            selectedFriendId !== conv.friendId
          ) {
            conv.unreadCount = (conv.unreadCount || 0) + 1;
          }

          updated.unshift(conv);
        }
        return updated;
      });
    };

    socket.on("private-message", handleNewMessage);
    return () => {
      socket.off("private-message", handleNewMessage);
    };
  }, [socket, onConversationsUpdate, selectedFriendId]);

  const formatTime = (date) => {
    if (!date) return "";
    const d = new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Baru saja";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return d.toLocaleDateString("id-ID", { month: "short", day: "numeric" });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Pesan</h2>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Cari teman..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:border-primary bg-gray-50"
          />
        </div>
      </div>

      {/* Friends List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="p-4 text-center text-gray-500">Memuat...</div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchTerm ? "Tidak ada teman yang cocok" : "Belum ada percakapan"}
          </div>
        ) : (
          filteredConversations.map((conv) => (
            <button
              key={conv.friendId}
              onClick={() => {
                onConversationsUpdate((prev) =>
                  prev.map((item) =>
                    item.friendId === conv.friendId
                      ? { ...item, unreadCount: 0 }
                      : item,
                  ),
                );
                onSelectFriend(conv.friendId);
              }}
              className={`w-full px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors text-left ${
                selectedFriendId === conv.friendId
                  ? "bg-blue-50 border-l-4 border-l-primary"
                  : ""
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-green-600 rounded-full flex items-center justify-center overflow-hidden">
                    {conv.friend.avatar ? (
                      <Image
                        src={conv.friend.avatar}
                        alt={conv.friend.name}
                        width={48}
                        height={48}
                        className="object-cover"
                      />
                    ) : (
                      <span className="text-white font-semibold text-sm">
                        {conv.friend.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </span>
                    )}
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {conv.unreadCount > 99 ? "99+" : conv.unreadCount}
                    </span>
                  )}
                </div>

                {/* Conversation Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900 truncate">
                      {conv.friend.name}
                    </h3>
                    {conv.lastMessage && (
                      <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                        {formatTime(conv.lastMessage.createdAt)}
                      </span>
                    )}
                  </div>
                  {conv.lastMessage ? (
                    <p
                      className={`text-sm truncate ${
                        conv.unreadCount > 0
                          ? "font-semibold text-gray-900"
                          : "text-gray-600"
                      }`}
                    >
                      {conv.lastMessage.senderId === conv.friendId
                        ? ""
                        : "Anda: "}
                      {conv.lastMessage.content ||
                        (conv.lastMessage.attachmentUrl
                          ? "[Lampiran]"
                          : "Pesan")}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500">Belum ada pesan</p>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
