"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import UserAvatar from "@/components/UserAvatar";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { format, isToday, isYesterday } from "date-fns";
import { id } from "date-fns/locale";
import { useSocket } from "@/lib/socket-provider";

// ==================================================
// CUSTOM SVG ICONS 
// ==================================================
const ArrowLeftIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

const SendIcon = () => (
  <svg className="w-5 h-5 shrink-0 transition-transform duration-200 group-hover:translate-x-1" viewBox="0 0 24 24" fill="none">
    <path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
  </svg>
);

const EmptyChatIcon = () => (
  <svg className="w-20 h-20 mx-auto mb-4 drop-shadow-md" viewBox="0 0 80 80" fill="none">
    <circle cx="40" cy="40" r="32" fill="#F0FDF4" stroke="#4ADE80" strokeWidth="3" />
    <path d="M25 45c0-6 7-10 15-10s15 4 15 10-7 10-15 10c-2 0-4.5-.5-6-1.5L25 58l1.5-6.5c-1.5-1.5-1.5-3-1.5-6.5z" fill="white" stroke="#22C55E" strokeWidth="2.5" />
    <circle cx="34" cy="45" r="2" fill="#22C55E" />
    <circle cx="40" cy="45" r="2" fill="#22C55E" />
    <circle cx="46" cy="45" r="2" fill="#22C55E" />
  </svg>
);

const StarIcon = () => (
  <svg className="w-3.5 h-3.5 text-amber-500 fill-amber-400" viewBox="0 0 16 16" fill="none">
    <path d="M8 12.27L12.94 15.29L11.64 9.68L16 5.86L10.24 5.38L8 0L5.76 5.38L0 5.86L4.36 9.68L3.06 15.29L8 12.27Z" />
  </svg>
);
// ==================================================

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

    socket.emit("join-room", params.roomId);

    socket.on("new-message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on("message-deleted", (message) => {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === message.id ? message : msg)),
      );
    });

    socket.on("user-typing", ({ user, isTyping }) => {
      setTypingUsers((prev) => {
        if (isTyping) {
          if (!prev.find((u) => u.id === user.id)) return [...prev, user];
        } else {
          return prev.filter((u) => u.id !== user.id);
        }
        return prev;
      });
    });

    return () => {
      socket.emit("leave-room", params.roomId);
      socket.off("new-message");
      socket.off("message-deleted");
      socket.off("user-typing");
    };
  }, [socket, params.roomId, session]);

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
      toast.error("Gagal mengirim pesan");
    } finally {
      setSending(false);
    }
  };

  const handleTyping = useCallback(
    (e) => {
      setNewMessage(e.target.value);
      if (!socket) return;
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      socket.emit("typing-start", {
        roomId: params.roomId,
        user: { id: session?.user?.id, name: session?.user?.name },
      });
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
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const formatMessageTime = (date) => {
    const messageDate = new Date(date);
    if (isToday(messageDate)) return format(messageDate, "HH:mm");
    if (isYesterday(messageDate)) return "Kemarin " + format(messageDate, "HH:mm");
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
    const messageAgeInMs = Date.now() - new Date(message.createdAt).getTime();
    const messageAgeInMinutes = messageAgeInMs / (1000 * 60);
    return messageAgeInMinutes < 1 && !message.isDeleted;
  };

  const handleDeleteMessage = async (messageId, roomId) => {
    try {
      const response = await fetch(`/api/rooms/${roomId}/messages/${messageId}`, { method: "DELETE" });
      if (!response.ok) {
        const error = await response.json();
        toast.error(error.error || "Gagal menghapus pesan");
        return;
      }
      toast.success("Pesan berhasil dihapus");
    } catch (error) {
      toast.error("Gagal menghapus pesan");
    }
  };

  if (loading || status === "loading") return null;

  return (
    <div className="flex flex-col h-[100dvh] w-full bg-[#F0F7FF] font-[family-name:var(--font-nunito)] overflow-hidden">
      <style dangerouslySetInnerHTML={{
        __html: `
        .duo-btn { border-bottom-width: 4px; transition: all 0.1s ease; }
        .duo-btn:hover { transform: translateY(-2px); border-bottom-width: 6px; }
        .duo-btn:active { transform: translateY(4px); border-bottom-width: 0px; }
      `}} />

      {/* ── Top Bar ── */}
      <header className="bg-white border-b-4 border-gray-200 p-3 sm:p-4 shrink-0 flex items-center justify-between z-10 shadow-sm relative">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            onClick={() => router.push("/diskusi")}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-white border-2 border-b-4 border-gray-200 hover:bg-gray-50 flex items-center justify-center shrink-0 duo-btn text-gray-600 transition-all"
          >
            <ArrowLeftIcon />
          </button>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl border-2 border-[#818CF8] bg-[#EEF2FF] flex items-center justify-center text-[#4F46E5] font-black text-lg shrink-0">
              💬
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-black text-gray-900 text-sm sm:text-base truncate">
                  {room?.name}
                </h1>
                {room?.isDefault && (
                  <span className="hidden sm:inline-flex items-center gap-1 rounded-lg bg-amber-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-amber-700 border border-amber-300 shrink-0">
                    <StarIcon /> Bawaan
                  </span>
                )}
              </div>
              <p className="text-xs font-bold text-gray-500 truncate">
                {room?.description || "Ruang diskusi santai"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-2 bg-gray-50 border-2 border-gray-100 rounded-xl px-2 py-1.5">
          <div className="relative flex h-3 w-3 items-center justify-center">
            {isConnected && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
            <span className={`relative inline-flex rounded-full h-2 w-2 ${isConnected ? "bg-emerald-500" : "bg-red-400"}`}></span>
          </div>
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-gray-500 hidden sm:inline-block">
            {isConnected ? "Terhubung" : "Terputus"}
          </span>
        </div>
      </header>

      {/* ── Messages Area ── */}
      <div className="flex-1 overflow-y-auto p-4 scrollbar-hide relative z-0 flex flex-col min-h-0 bg-[#F0F7FF]">
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center opacity-70">
            <EmptyChatIcon />
            <h3 className="font-black text-gray-600 text-lg">Ruangan Kosong</h3>
            <p className="text-sm font-bold text-gray-400">Jadilah yang pertama menyapa!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5 max-w-4xl mx-auto w-full">
            {messages.map((message, index) => {
              const isOwnMessage = message.user.id === session?.user?.id;
              const prevMessage = messages[index - 1];
              const showDateDivider = shouldShowDateDivider(message, prevMessage);

              return (
                <div key={message.id} className="flex flex-col">
                  {showDateDivider && (
                    <div className="flex justify-center my-6 relative">
                      <div className="absolute inset-0 flex items-center"><div className="w-full border-t-2 border-gray-200/60"></div></div>
                      <span className="relative bg-[#F0F7FF] px-4 text-[10px] sm:text-xs font-black uppercase tracking-widest text-gray-400">
                        {formatDateDivider(message.createdAt)}
                      </span>
                    </div>
                  )}

                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`flex items-end gap-2 group ${isOwnMessage ? "flex-row-reverse" : "flex-row"}`}
                  >
                    {!isOwnMessage && (
                      <UserAvatar
                        src={message.user.avatar}
                        name={message.user.name}
                        className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl shadow-sm shrink-0 mb-4"
                        size={32}
                        showInitial
                      />
                    )}

                    <div className={`flex flex-col max-w-[75%] sm:max-w-[70%] ${isOwnMessage ? "items-end" : "items-start"}`}>
                      {!isOwnMessage && (
                        <span className="text-[10px] font-black text-gray-500 mb-1 ml-1 px-1 bg-white/50 rounded-lg">
                          {message.user.name.split(" ")[0]}
                        </span>
                      )}

                      <div className={`relative px-4 py-3 sm:px-5 sm:py-3.5 border-2 shadow-sm whitespace-pre-wrap break-words ${
                        isOwnMessage
                          ? "bg-[#6366F1] border-[#4338CA] text-white rounded-3xl rounded-br-sm"
                          : "bg-white border-gray-200 text-gray-800 rounded-3xl rounded-bl-sm"
                        } ${message.isDeleted ? "opacity-60 italic" : ""}`}
                      >
                        <p className={`text-sm sm:text-[15px] font-bold leading-relaxed ${isOwnMessage ? "text-white" : "text-gray-800"}`}>
                          {message.content}
                        </p>

                        {/* Delete Button inside bubble (visible on hover) */}
                        {canDeleteMessage(message) && (
                          <button
                            onClick={() => handleDeleteMessage(message.id, params.roomId)}
                            className={`absolute -top-3 ${isOwnMessage ? "-left-2" : "-right-2"} w-7 h-7 bg-red-100 border-2 border-red-200 text-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:border-red-600 hover:text-white transition-all shadow-sm z-10 duo-btn border-b-2`}
                            title="Hapus pesan"
                          >
                            <TrashIcon />
                          </button>
                        )}
                      </div>

                      <span className={`text-[9px] font-black text-gray-400 mt-1 ${isOwnMessage ? "mr-1" : "ml-1"}`}>
                        {formatMessageTime(message.createdAt)}
                      </span>
                    </div>
                  </motion.div>
                </div>
              );
            })}
            <div ref={messagesEndRef} className="h-2" />
          </div>
        )}
      </div>

      {/* ── Typing Indicator ── */}
      <AnimatePresence>
        {typingUsers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-20 left-0 right-0 pointer-events-none z-10 flex justify-center"
          >
            <div className="bg-gray-800/80 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-2 shadow-lg">
              <span className="flex items-center gap-0.5">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </span>
              {typingUsers.map((u) => u.name.split(" ")[0]).join(", ")} mengetik...
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Input Area ── */}
      <div className="bg-white border-t-4 border-gray-200 p-3 sm:p-4 shrink-0 z-20">
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto flex items-center gap-2 sm:gap-3">
          <input
            ref={inputRef}
            placeholder="Ketik pesan..."
            value={newMessage}
            onChange={handleTyping}
            disabled={sending}
            className="flex-1 bg-gray-50 border-2 border-gray-200 rounded-2xl px-4 py-3 sm:py-3.5 text-sm font-bold text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#6366F1] focus:ring-4 focus:ring-[#EEF2FF] transition-all disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-2xl border-2 border-b-4 border-[#4338CA] flex items-center justify-center duo-btn disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:border-b-4 disabled:bg-gray-300 disabled:border-gray-400 group"
          >
            <SendIcon />
          </button>
        </form>
      </div>
    </div>
  );
}
