"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import LoadingScreen from "@/components/LoadingScreen";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Send,
  MessageSquare,
  Users,
  Star,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow, format, isToday, isYesterday } from "date-fns";
import { id } from "date-fns/locale";
import { useSocket } from "@/lib/socket-provider";

export default function ChatRoomPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const { socket, isConnected } = useSocket();
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const [room, setRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchRoom();
      fetchMessages();
    }
  }, [status, router]);

  // Socket.IO event listeners
  useEffect(() => {
    if (!socket || !params.roomId) return;

    // Join room
    socket.emit("join-room", params.roomId);

    // Listen for new messages
    socket.on("new-message", (message) => {
      setMessages((prev) => [...prev, message]);
      if (message.user.id !== session?.user?.id) {
        // Play notification sound or show notification
      }
    });

    // Listen for deleted messages
    socket.on("message-deleted", (message) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === message.id ? message : msg)),
      );
    });

    // Listen for typing indicators
    socket.on("user-typing", ({ user, isTyping }) => {
      setTypingUsers((prev) => {
        if (isTyping) {
          if (!prev.find((u) => u.id === user.id)) {
            return [...prev, user];
          }
        } else {
          return prev.filter((u) => u.id !== user.id);
        }
        return prev;
      });
    });

    // Cleanup
    return () => {
      socket.emit("leave-room", params.roomId);
      socket.off("new-message");
      socket.off("message-deleted");
      socket.off("user-typing");
    };
  }, [socket, params.roomId, session]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchRoom = async () => {
    try {
      const response = await fetch(`/api/rooms/${params.roomId}`);
      if (response.ok) {
        const data = await response.json();
        setRoom(data);
      } else {
        toast.error("Room tidak ditemukan");
        router.push("/diskusi");
      }
    } catch (error) {
      console.error("Failed to fetch room:", error);
      toast.error("Gagal memuat room");
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/rooms/${params.roomId}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const response = await fetch(`/api/rooms/${params.roomId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage }),
      });

      if (response.ok) {
        setNewMessage("");
        // Message will be added via socket event
        // Stop typing indicator
        if (socket) {
          socket.emit("typing-stop", {
            roomId: params.roomId,
            user: { id: session.user.id, name: session.user.name },
          });
        }
      } else {
        toast.error("Gagal mengirim pesan");
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      toast.error("Gagal mengirim pesan");
    } finally {
      setSending(false);
    }
  };

  const handleTyping = useCallback(
    (e) => {
      setNewMessage(e.target.value);

      if (!socket) return;

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Emit typing start
      socket.emit("typing-start", {
        roomId: params.roomId,
        user: { id: session?.user?.id, name: session?.user?.name },
      });

      // Set timeout to stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("typing-stop", {
          roomId: params.roomId,
          user: { id: session?.user?.id, name: session?.user?.name },
        });
      }, 2000);
    },
    [socket, params.roomId, session],
  );

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatMessageTime = (date) => {
    const messageDate = new Date(date);
    if (isToday(messageDate)) {
      return format(messageDate, "HH:mm");
    } else if (isYesterday(messageDate)) {
      return "Kemarin " + format(messageDate, "HH:mm");
    }
    return format(messageDate, "dd/MM/yy HH:mm");
  };

  const shouldShowDateDivider = (currentMsg, prevMsg) => {
    if (!prevMsg) return true;
    const currentDate = new Date(currentMsg.createdAt).toDateString();
    const prevDate = new Date(prevMsg.createdAt).toDateString();
    return currentDate !== prevDate;
  };

  const formatDateDivider = (date) => {
    const messageDate = new Date(date);
    if (isToday(messageDate)) return "Hari ini";
    if (isYesterday(messageDate)) return "Kemarin";
    return format(messageDate, "EEEE, dd MMMM yyyy", { locale: id });
  };

  const canDeleteMessage = (message) => {
    if (session?.user?.role === "ADMIN") return true;

    if (message.userId !== session?.user?.id) return false;

    // Check if message is less than 1 minute old
    const messageAgeInMs = Date.now() - new Date(message.createdAt).getTime();
    const messageAgeInMinutes = messageAgeInMs / (1000 * 60);
    return messageAgeInMinutes < 1 && !message.isDeleted;
  };

  const handleDeleteMessage = async (messageId, roomId) => {
    try {
      const response = await fetch(
        `/api/rooms/${roomId}/messages/${messageId}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "Gagal menghapus pesan");
        return;
      }

      toast.success("Pesan berhasil dihapus");
      // Message update will come via socket event
    } catch (error) {
      console.error("Failed to delete message:", error);
      toast.error("Gagal menghapus pesan");
    }
  };

  if (loading || status === "loading") return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* Chat Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/diskusi")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-primary shrink-0" />
                <h1 className="font-semibold text-gray-900 truncate">
                  {room?.name}
                </h1>
                {room?.isDefault && (
                  <Badge className="bg-yellow-100 text-yellow-700 border-0 gap-1 shrink-0">
                    <Star className="w-3 h-3" />
                    Default
                  </Badge>
                )}
              </div>
              {room?.description && (
                <p className="text-sm text-gray-500 truncate">
                  {room.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span
                className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-gray-400"}`}
              />
              <span className="hidden sm:inline">
                {isConnected ? "Terhubung" : "Menghubungkan..."}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-4">
          {messages.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="font-medium">Belum ada pesan</p>
              <p className="text-sm">Mulai percakapan sekarang!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => {
                const isOwnMessage = message.user.id === session?.user?.id;
                const prevMessage = messages[index - 1];
                const showDateDivider = shouldShowDateDivider(
                  message,
                  prevMessage,
                );

                return (
                  <div key={message.id}>
                    {/* Date Divider */}
                    {showDateDivider && (
                      <div className="flex items-center justify-center my-6">
                        <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                          {formatDateDivider(message.createdAt)}
                        </div>
                      </div>
                    )}

                    {/* Message */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-3 group ${isOwnMessage ? "flex-row-reverse" : ""}`}
                    >
                      {!isOwnMessage && (
                        <Avatar className="w-8 h-8 shrink-0">
                          <AvatarImage
                            src={message.user.avatar}
                            alt={message.user.name}
                          />
                          <AvatarFallback className="text-xs bg-primary text-white">
                            {getInitials(message.user.name)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`max-w-[70%] ${isOwnMessage ? "items-end" : "items-start"}`}
                      >
                        {!isOwnMessage && (
                          <p className="text-xs text-gray-500 mb-1 ml-1">
                            {message.user.name}
                          </p>
                        )}
                        <div
                          className={`rounded-2xl px-4 py-2 relative ${
                            isOwnMessage
                              ? "bg-primary text-white rounded-tr-sm"
                              : "bg-white border border-gray-200 rounded-tl-sm"
                          }`}
                        >
                          <p
                            className={`whitespace-pre-wrap warp-break-word ${
                              message.isDeleted ? "italic text-gray-400" : ""
                            }`}
                          >
                            {message.content}
                          </p>

                          {/* Delete Button */}
                          {canDeleteMessage(message) && (
                            <button
                              onClick={() =>
                                handleDeleteMessage(message.id, params.roomId)
                              }
                              className={`absolute -top-2 ${
                                isOwnMessage ? "left-1" : "right-1"
                              } opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full ${
                                isOwnMessage
                                  ? "hover:bg-red-200"
                                  : "hover:bg-red-100"
                              }`}
                              title="Hapus pesan"
                            >
                              <Trash2
                                className={`w-3 h-3 ${
                                  isOwnMessage ? "text-red-600" : "text-red-500"
                                }`}
                              />
                            </button>
                          )}
                        </div>
                        <p
                          className={`text-xs text-gray-400 mt-1 ${isOwnMessage ? "text-right mr-1" : "ml-1"}`}
                        >
                          {formatMessageTime(message.createdAt)}
                        </p>
                      </div>
                    </motion.div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Typing Indicator */}
      <AnimatePresence>
        {typingUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-white border-t border-gray-100"
          >
            <div className="max-w-4xl mx-auto px-4 py-2">
              <p className="text-sm text-gray-500 italic">
                {typingUsers.map((u) => u.name).join(", ")} sedang mengetik...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Message Input */}
      <div className="bg-white border-t border-gray-200 sticky bottom-0">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <Input
              ref={inputRef}
              placeholder="Ketik pesan..."
              value={newMessage}
              onChange={handleTyping}
              disabled={sending}
              className="flex-1"
            />
            <Button type="submit" disabled={sending || !newMessage.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
