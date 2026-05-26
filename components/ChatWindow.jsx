"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useSocket } from "@/lib/socket-provider";
import { toast } from "sonner";

// ── Custom SVG Icons ──────────────────────────────────────
const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);
const PaperclipIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </svg>
);
const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-3.5 h-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6" /><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);
const DownloadIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);
const ChevronDownIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="inline-block w-3.5 h-3.5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const CheckCheckIcon = ({ colored }) => (
  <svg viewBox="0 0 24 24" fill="none" className={`inline-block w-3.5 h-3.5 ${colored ? "text-[#6366F1]" : "text-white/60"}`} stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="17 6 9 17 5 13" /><polyline points="22 6 13 15 11 13" />
  </svg>
);
const SpinnerIcon = () => (
  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
  </svg>
);
const ArrowLeftIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
  </svg>
);
// ─────────────────────────────────────────────────────────

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_ATTACHMENTS = 10;

function mergeUniqueMessages(current, incoming) {
  const map = new Map();
  [...current, ...incoming].forEach((msg) => { if (msg?.id) map.set(msg.id, msg); });
  return Array.from(map.values()).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
}

function updateMessageReadState(messages, messageId, readAt) {
  return messages.map((m) => m.id === messageId ? { ...m, isRead: true, readAt } : m);
}

export default function ChatWindow({ friendId, friend, onMessageSent, onOpenSidebar }) {
  const { data: session } = useSession();
  const { socket } = useSocket();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [messageInput, setMessageInput] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isFriendTyping, setIsFriendTyping] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const typingTimeoutRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const shouldAutoScrollRef = useRef(true);

  useEffect(() => { if (friendId) loadMessages(); }, [friendId]);

  const scrollToBottom = (behavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
    setShowScrollToBottom(false);
    shouldAutoScrollRef.current = true;
  };

  const handleMessagesScroll = () => {
    const c = messagesContainerRef.current;
    if (!c) return;
    const dist = c.scrollHeight - c.scrollTop - c.clientHeight;
    setShowScrollToBottom(dist > 160);
    shouldAutoScrollRef.current = dist <= 24;
  };

  useEffect(() => {
    if (!friendId || isLoading) return;
    const frame = requestAnimationFrame(() => scrollToBottom("auto"));
    return () => cancelAnimationFrame(frame);
  }, [friendId, isLoading]);

  useEffect(() => {
    if (!isLoading && shouldAutoScrollRef.current) scrollToBottom("smooth");
  }, [messages.length, isLoading]);

  useEffect(() => {
    shouldAutoScrollRef.current = true;
    setShowScrollToBottom(false);
  }, [friendId]);

  const loadMessages = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/chats/${friendId}/messages`, { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setMessages(mergeUniqueMessages([], data.data.messages || []));
      await fetch(`/api/chats/${friendId}/messages`, { method: "PATCH", headers: { "Content-Type": "application/json" } });
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!socket || !session?.user?.id || !friendId) return;
    socket.emit("join-private-chat", { userId1: session.user.id, userId2: friendId });

    const onTyping = ({ userId, isTyping }) => { if (userId === friendId) setIsFriendTyping(Boolean(isTyping)); };
    const onRead = ({ messageId, readAt }) => setMessages((prev) => updateMessageReadState(prev, messageId, readAt));
    const onOffline = ({ userId }) => { if (userId === friendId) setIsFriendTyping(false); };
    const onMsg = (message) => {
      if (
        (message.senderId === friendId && message.receiverId === session?.user?.id) ||
        (message.senderId === session?.user?.id && message.receiverId === friendId)
      ) {
        setMessages((prev) => mergeUniqueMessages(prev, [message]));
        if (message.senderId === friendId && socket) {
          socket.emit("message-read", { messageId: message.id, senderId: message.senderId, receiverId: message.receiverId });
        }
      }
    };

    socket.on("private-message", onMsg);
    socket.on("friend-typing", onTyping);
    socket.on("message-read-receipt", onRead);
    socket.on("friend-offline", onOffline);
    socket.on("friend-online", onOffline);
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      socket.emit("leave-private-chat", { userId1: session.user.id, userId2: friendId });
      socket.off("private-message", onMsg);
      socket.off("friend-typing", onTyping);
      socket.off("message-read-receipt", onRead);
      socket.off("friend-offline", onOffline);
      socket.off("friend-online", onOffline);
    };
  }, [socket, friendId, session?.user?.id]);

  useEffect(() => {
    if (!socket || !session?.user?.id || !friendId) return;
    if (messageInput.trim()) {
      socket.emit("private-typing-start", { userId: session.user.id, friendId });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("private-typing-stop", { userId: session.user.id, friendId });
      }, 800);
    } else {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      socket.emit("private-typing-stop", { userId: session.user.id, friendId });
    }
    return () => { if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current); };
  }, [messageInput, friendId, socket, session?.user?.id]);

  const handleAttachmentSelect = async (event) => {
    const selected = Array.from(event.target.files || []);
    if (!selected.length) return;
    const remaining = MAX_ATTACHMENTS - attachments.length;
    if (remaining <= 0) { toast.error(`Maksimal ${MAX_ATTACHMENTS} attachment`); event.target.value = ""; return; }
    const files = selected.slice(0, remaining);
    if (selected.length > remaining) toast.warning(`Hanya ${remaining} file ditambahkan`);
    setIsUploading(true);
    try {
      const uploaded = [];
      for (const file of files) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/messages/attachments", { method: "POST", body: fd });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `Gagal upload ${file.name}`);
        uploaded.push(data);
      }
      setAttachments((prev) => [...prev, ...uploaded].slice(0, MAX_ATTACHMENTS));
      toast.success(`${uploaded.length} attachment siap dikirim`);
    } catch (err) {
      toast.error(err.message || "Gagal upload attachment");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const submitMessage = async () => {
    if (!messageInput.trim() && attachments.length === 0) return;
    if (socket && session?.user?.id && friendId) socket.emit("private-typing-stop", { userId: session.user.id, friendId });
    setIsSending(true);
    try {
      const created = [];
      if (attachments.length === 0) {
        const res = await fetch("/api/messages/send", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ receiverId: friendId, content: messageInput.trim() }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error?.message || data?.error || "Gagal kirim");
        created.push(data.data.message);
      } else {
        for (let i = 0; i < attachments.length; i++) {
          const att = attachments[i];
          const res = await fetch("/api/messages/send", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ receiverId: friendId, content: i === 0 ? messageInput.trim() : "", attachmentUrl: att?.url, attachmentName: att?.name, attachmentType: att?.type, attachmentSize: att?.size }),
          });
          const data = await res.json();
          if (!res.ok) throw new Error(data?.error?.message || data?.error || "Gagal kirim attachment");
          created.push(data.data.message);
        }
      }
      setMessages((prev) => mergeUniqueMessages(prev, created));
      setMessageInput("");
      setAttachments([]);
      onMessageSent?.();
    } catch (err) {
      toast.error(err.message || "Gagal mengirim pesan");
    } finally {
      setIsSending(false);
    }
  };

  const handleInputKeyDown = async (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (!isSending) await submitMessage(); }
  };

  const renderStatus = (msg, isOwn) => {
    if (!isOwn) return null;
    return msg.isRead ? <CheckCheckIcon colored /> : <CheckIcon />;
  };

  const formatTime = (date) => new Date(date).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  const renderAttachment = (msg) => {
    if (!msg.attachmentUrl) return null;
    const isImage = msg.attachmentType?.startsWith("image/");
    return (
      <div className="mt-2">
        {msg.attachmentCaption && <p className="text-sm whitespace-pre-wrap mb-1">{msg.attachmentCaption}</p>}
        {isImage ? (
          <a href={msg.attachmentUrl} target="_blank" rel="noreferrer">
            <img src={msg.attachmentUrl} alt={msg.attachmentName || "attachment"} className="w-full max-w-xs rounded-2xl border-2 border-white/20 object-cover" />
          </a>
        ) : (
          <div className="flex items-center gap-2 rounded-2xl border-2 border-white/20 bg-white/10 p-3 max-w-xs">
            <PaperclipIcon />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold truncate">{msg.attachmentName || "File"}</p>
              <p className="text-[11px] opacity-70 truncate">{msg.attachmentType || "Attachment"}</p>
            </div>
            <a href={msg.attachmentUrl} download className="text-xs font-bold inline-flex items-center gap-1 opacity-80 hover:opacity-100">
              <DownloadIcon /> Unduh
            </a>
          </div>
        )}
      </div>
    );
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <div className="flex flex-col h-full min-h-0 font-[family-name:var(--font-nunito)]">
      <style dangerouslySetInnerHTML={{ __html: `
        .duo-btn { border-bottom-width: 4px; transition: all 0.1s ease; }
        .duo-btn:hover { transform: translateY(-2px); border-bottom-width: 6px; }
        .duo-btn:active { transform: translateY(3px); border-bottom-width: 0px; }
        .msg-bubble-in { border-bottom-left-radius: 4px; }
        .msg-bubble-out { border-bottom-right-radius: 4px; }
      `}} />

      {/* ── Header ── */}
      <div className="px-5 py-4 border-b-4 border-gray-100 bg-white flex items-center gap-3 shrink-0">
        <button
          onClick={() => onOpenSidebar?.()}
          className="md:hidden mr-1 p-2 rounded-xl bg-[#EEF2FF] border-2 border-b-4 border-[#C7D2FE] text-[#6366F1] font-black duo-btn"
        >
          <ArrowLeftIcon />
        </button>

        {/* Avatar */}
        <div className="relative">
          <div className="w-11 h-11 rounded-full border-3 border-[#6366F1] overflow-hidden bg-gradient-to-br from-[#6366F1] to-[#818CF8] flex items-center justify-center shrink-0">
            {friend?.avatar ? (
              <Image src={friend.avatar} alt={friend.name || ""} width={44} height={44} className="w-full h-full object-cover" />
            ) : (
              <span className="text-sm font-black text-white">{getInitials(friend?.name)}</span>
            )}
          </div>
          {friend?.isOnline && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="font-black text-gray-950 text-base leading-tight truncate">{friend?.name}</h2>
          <p className="text-xs font-bold text-[#78909C] truncate">
            {isFriendTyping ? (
              <span className="text-[#6366F1] animate-pulse">Mengetik...</span>
            ) : friend?.isOnline ? (
              <span className="text-emerald-500">● Online</span>
            ) : friend?.lastOnline ? (
              `Terakhir ${new Date(friend.lastOnline).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`
            ) : (
              "Offline"
            )}
          </p>
        </div>
      </div>

      {/* ── Messages Area ── */}
      <div className="relative flex-1 min-h-0 bg-[#F8F9FF]">
        {/* Subtle dot pattern background */}
        <div className="absolute inset-0 opacity-40" style={{ backgroundImage: "radial-gradient(#C7D2FE 1px, transparent 1px)", backgroundSize: "24px 24px" }} />

        <div
          ref={messagesContainerRef}
          onScroll={handleMessagesScroll}
          className="relative h-full overflow-y-auto p-4 md:p-6 space-y-2"
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-3">
                <SpinnerIcon />
                <p className="text-sm font-bold text-[#78909C]">Memuat pesan...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-8 max-w-xs">
                <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-white border-4 border-b-6 border-gray-200 flex items-center justify-center shadow-sm">
                  <svg viewBox="0 0 40 40" fill="none" className="w-10 h-10">
                    <rect x="4" y="8" width="32" height="24" rx="8" fill="#EEF2FF" stroke="#6366F1" strokeWidth="2.5" />
                    <path d="M4 28l8 8V28H4z" fill="#EEF2FF" stroke="#6366F1" strokeWidth="2.5" strokeLinejoin="round" />
                    <circle cx="14" cy="20" r="2" fill="#6366F1" />
                    <circle cx="20" cy="20" r="2" fill="#6366F1" />
                    <circle cx="26" cy="20" r="2" fill="#6366F1" />
                  </svg>
                </div>
                <p className="text-lg font-black text-gray-950 mb-1">Mulai Obrolan!</p>
                <p className="text-sm font-bold text-[#78909C]">
                  Kirim pesan pertama ke {friend?.name}
                </p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => {
                const isOwn = msg.senderId === session?.user?.id;
                const showSender = idx === 0 || messages[idx - 1]?.senderId !== msg.senderId;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOwn ? "justify-end" : "justify-start"} ${!showSender && idx !== 0 ? "mt-0.5" : "mt-3"}`}
                  >
                    {/* Friend avatar for incoming messages */}
                    {!isOwn && showSender && (
                      <div className="w-7 h-7 rounded-full border-2 border-[#6366F1] overflow-hidden bg-gradient-to-br from-[#6366F1] to-[#818CF8] flex items-center justify-center shrink-0 mr-2 mt-1">
                        {friend?.avatar ? (
                          <img src={friend.avatar} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-[9px] font-black text-white">{getInitials(friend?.name)}</span>
                        )}
                      </div>
                    )}
                    {!isOwn && !showSender && <div className="w-9 shrink-0" />}

                    <div
                      className={`max-w-[80%] sm:max-w-[65%] px-4 py-2.5 rounded-2xl shadow-sm ${
                        isOwn
                          ? "bg-[#6366F1] text-white border-2 border-b-4 border-[#4338CA] msg-bubble-out"
                          : "bg-white text-gray-900 border-2 border-b-4 border-gray-200 msg-bubble-in"
                      }`}
                    >
                      {msg.content ? (
                        <p className="text-sm font-bold whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                      ) : null}
                      {renderAttachment(msg)}
                      <p className={`text-[11px] font-bold mt-1.5 flex items-center gap-1 ${isOwn ? "text-white/70 justify-end" : "text-gray-400"}`}>
                        {formatTime(msg.createdAt)}
                        {renderStatus(msg, isOwn)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Scroll to bottom button */}
        {showScrollToBottom && (
          <button
            type="button"
            onClick={() => scrollToBottom("smooth")}
            className="absolute bottom-4 right-4 z-10 inline-flex items-center gap-1.5 rounded-2xl bg-[#6366F1] border-2 border-b-4 border-[#4338CA] px-3 py-2 text-xs font-black text-white shadow-lg duo-btn"
          >
            <ChevronDownIcon />
            Terbaru
          </button>
        )}
      </div>

      {/* ── Input Area ── */}
      <div className="px-4 md:px-5 py-4 border-t-4 border-gray-100 bg-white shrink-0 space-y-3">
        {/* Attachment previews */}
        {attachments.length > 0 && (
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
            {attachments.map((att, idx) => {
              const isImage = att?.isImage || IMAGE_TYPES.includes(att?.type);
              return (
                <div key={`${att.url}-${idx}`} className="group relative rounded-2xl border-2 border-b-4 border-gray-200 bg-gray-50 p-1.5 overflow-hidden">
                  <button
                    type="button"
                    className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))}
                  >
                    <TrashIcon />
                  </button>
                  {isImage ? (
                    <img src={att.url} alt={att.name || "attachment"} className="h-16 w-full rounded-xl object-cover" />
                  ) : (
                    <div className="h-16 w-full rounded-xl bg-[#EEF2FF] flex flex-col items-center justify-center px-1">
                      <PaperclipIcon />
                      <p className="text-[9px] text-center text-[#6366F1] font-bold line-clamp-2 mt-1">{att.name || "File"}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); submitMessage(); }} className="flex items-end gap-2">
          {/* Attach button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isSending || attachments.length >= MAX_ATTACHMENTS}
            className="shrink-0 p-3 rounded-2xl border-2 border-b-4 border-gray-200 bg-white text-[#6366F1] font-black duo-btn disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:bg-[#EEF2FF]"
            title="Lampirkan file"
          >
            {isUploading ? <SpinnerIcon /> : <PaperclipIcon />}
          </button>
          <input ref={fileInputRef} type="file" className="hidden" multiple onChange={handleAttachmentSelect} />

          {/* Text input */}
          <div className="flex-1 relative">
            <textarea
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="Tulis pesan... (Enter untuk kirim)"
              rows={1}
              disabled={isSending}
              className="w-full px-4 py-3 rounded-2xl border-2 border-b-4 border-gray-200 bg-white text-gray-900 font-bold placeholder:text-gray-400 focus:outline-none focus:border-[#6366F1] transition-colors text-sm resize-none leading-relaxed disabled:opacity-60"
              style={{ minHeight: "48px", maxHeight: "120px", overflowY: "auto" }}
              onInput={(e) => {
                e.target.style.height = "auto";
                e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
              }}
            />
          </div>

          {/* Send button */}
          <button
            type="submit"
            disabled={(!messageInput.trim() && attachments.length === 0) || isSending}
            className="shrink-0 p-3 rounded-2xl bg-[#6366F1] border-2 border-b-4 border-[#4338CA] text-white font-black duo-btn disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isSending ? <SpinnerIcon /> : <SendIcon />}
          </button>
        </form>

        <p className="text-center text-[10px] font-bold text-gray-300">Tekan Enter untuk kirim · Shift+Enter untuk baris baru</p>
      </div>
    </div>
  );
}
