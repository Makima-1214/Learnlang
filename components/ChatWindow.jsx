"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useSocket } from "@/lib/socket-provider";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Download,
  Check,
  CheckCheck,
  ChevronDown,
  Loader2,
  Paperclip,
  Send,
  Trash2,
} from "lucide-react";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
const MAX_ATTACHMENTS = 10;

function mergeUniqueMessages(current, incoming) {
  const map = new Map();
  [...current, ...incoming].forEach((msg) => {
    if (!msg?.id) return;
    map.set(msg.id, msg);
  });

  return Array.from(map.values()).sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
  );
}

function updateMessageReadState(messages, messageId, readAt) {
  return messages.map((message) =>
    message.id === messageId ? { ...message, isRead: true, readAt } : message,
  );
}

export default function ChatWindow({
  friendId,
  friend,
  onMessageSent,
  onOpenSidebar,
}) {
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

  // Load messages
  useEffect(() => {
    if (!friendId) return;
    loadMessages();
  }, [friendId]);

  const scrollToBottom = (behavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({ behavior });
    setShowScrollToBottom(false);
    shouldAutoScrollRef.current = true;
  };

  const handleMessagesScroll = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    const isFarFromBottom = distanceFromBottom > 160;
    const isNearBottom = distanceFromBottom <= 24;

    setShowScrollToBottom(isFarFromBottom);
    // Disable auto-scroll as soon as user moves away from the bottom,
    // so manual scrolling is not "pulled back".
    shouldAutoScrollRef.current = isNearBottom;
  };

  // Ensure opening a conversation lands on newest message.
  useEffect(() => {
    if (!friendId || isLoading) return;

    const frame = requestAnimationFrame(() => {
      scrollToBottom("auto");
    });

    return () => cancelAnimationFrame(frame);
  }, [friendId, isLoading]);

  // Auto-scroll for incoming updates only when user is near the bottom.
  useEffect(() => {
    if (isLoading) return;

    if (shouldAutoScrollRef.current) {
      scrollToBottom("smooth");
    }
  }, [messages.length, isLoading]);

  useEffect(() => {
    shouldAutoScrollRef.current = true;
    setShowScrollToBottom(false);
  }, [friendId]);

  const loadMessages = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/chats/${friendId}/messages`, {
        cache: "no-store",
      });
      if (!res.ok) return;
      const data = await res.json();
      setMessages(mergeUniqueMessages([], data.data.messages || []));

      await fetch(`/api/chats/${friendId}/messages`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Listen for new messages
  useEffect(() => {
    if (!socket || !session?.user?.id || !friendId) return;

    socket.emit("join-private-chat", {
      userId1: session.user.id,
      userId2: friendId,
    });

    const handleFriendTyping = ({ userId, isTyping }) => {
      if (userId === friendId) {
        setIsFriendTyping(Boolean(isTyping));
      }
    };

    const handleReadReceipt = ({ messageId, readAt }) => {
      setMessages((prev) => updateMessageReadState(prev, messageId, readAt));
    };

    const handleFriendOffline = ({ userId }) => {
      if (userId === friendId && friend?.isOnline) {
        setIsFriendTyping(false);
      }
    };

    const handleFriendOnline = ({ userId }) => {
      if (userId === friendId) {
        setIsFriendTyping(false);
      }
    };

    const handleNewMessage = (message) => {
      // Check if message is from the current friend
      if (
        (message.senderId === friendId &&
          message.receiverId === session?.user?.id) ||
        (message.senderId === session?.user?.id &&
          message.receiverId === friendId)
      ) {
        setMessages((prev) => mergeUniqueMessages(prev, [message]));

        // If the incoming message was sent to this user and the conversation
        // is open, immediately mark it as read so the sender receives a
        // realtime read receipt.
        try {
          if (
            message.senderId === friendId &&
            message.receiverId === session?.user?.id &&
            socket
          ) {
            socket.emit("message-read", {
              messageId: message.id,
              senderId: message.senderId,
              receiverId: message.receiverId,
            });
          }
        } catch (err) {
          console.error(
            "Failed to emit message-read for incoming message:",
            err,
          );
        }
      }
    };

    socket.on("private-message", handleNewMessage);
    socket.on("friend-typing", handleFriendTyping);
    socket.on("message-read-receipt", handleReadReceipt);
    socket.on("friend-offline", handleFriendOffline);
    socket.on("friend-online", handleFriendOnline);
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      socket.emit("leave-private-chat", {
        userId1: session.user.id,
        userId2: friendId,
      });
      socket.off("private-message", handleNewMessage);
      socket.off("friend-typing", handleFriendTyping);
      socket.off("message-read-receipt", handleReadReceipt);
      socket.off("friend-offline", handleFriendOffline);
      socket.off("friend-online", handleFriendOnline);
    };
  }, [socket, friendId, session?.user?.id]);

  useEffect(() => {
    if (!socket || !session?.user?.id || !friendId) return;

    if (messageInput.trim()) {
      socket.emit("private-typing-start", {
        userId: session.user.id,
        friendId,
      });
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("private-typing-stop", {
          userId: session.user.id,
          friendId,
        });
      }, 800);
    } else {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      socket.emit("private-typing-stop", {
        userId: session.user.id,
        friendId,
      });
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [messageInput, friendId, socket, session?.user?.id]);

  const handleAttachmentSelect = async (event) => {
    const selected = Array.from(event.target.files || []);
    if (selected.length === 0) return;

    const remaining = MAX_ATTACHMENTS - attachments.length;
    if (remaining <= 0) {
      toast.error(`Maksimal ${MAX_ATTACHMENTS} attachment per pesan`);
      event.target.value = "";
      return;
    }

    const files = selected.slice(0, remaining);
    if (selected.length > remaining) {
      toast.warning(
        `Hanya ${remaining} file yang ditambahkan (maksimal ${MAX_ATTACHMENTS})`,
      );
    }

    setIsUploading(true);
    try {
      const uploaded = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/messages/attachments", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || `Gagal upload ${file.name}`);
        }
        uploaded.push(data);
      }

      setAttachments((prev) =>
        [...prev, ...uploaded].slice(0, MAX_ATTACHMENTS),
      );
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

    if (socket && session?.user?.id && friendId) {
      socket.emit("private-typing-stop", {
        userId: session.user.id,
        friendId,
      });
    }

    setIsSending(true);
    try {
      const createdMessages = [];

      if (attachments.length === 0) {
        const res = await fetch(`/api/messages/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            receiverId: friendId,
            content: messageInput.trim(),
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(
            data?.error?.message || data?.error || "Failed to send message",
          );
        }
        createdMessages.push(data.data.message);
      } else {
        for (let i = 0; i < attachments.length; i++) {
          const att = attachments[i];
          const res = await fetch(`/api/messages/send`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              receiverId: friendId,
              // text acts as optional caption/message; attached only to first sent item
              content: i === 0 ? messageInput.trim() : "",
              attachmentUrl: att?.url,
              attachmentName: att?.name,
              attachmentType: att?.type,
              attachmentSize: att?.size,
            }),
          });

          const data = await res.json();
          if (!res.ok) {
            throw new Error(
              data?.error?.message ||
                data?.error ||
                "Failed to send attachment",
            );
          }
          createdMessages.push(data.data.message);
        }
      }

      setMessages((prev) => mergeUniqueMessages(prev, createdMessages));
      setMessageInput("");
      setAttachments([]);
      onMessageSent?.();
    } catch (err) {
      toast.error(err.message || "Gagal mengirim pesan");
    } finally {
      setIsSending(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    await submitMessage();
  };

  const handleInputKeyDown = async (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isSending) {
        await submitMessage();
      }
    }
  };

  const renderMessageStatus = (msg, isOwn) => {
    if (!isOwn) return null;

    const iconClass = msg.isRead ? "text-blue-400" : "text-white/70";
    return msg.isRead ? (
      <CheckCheck className={`inline-block h-3.5 w-3.5 ${iconClass}`} />
    ) : (
      <Check className={`inline-block h-3.5 w-3.5 ${iconClass}`} />
    );
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderAttachment = (msg) => {
    if (!msg.attachmentUrl) return null;
    const isImage = msg.attachmentType?.startsWith("image/");

    return (
      <div className="mt-2 space-y-2">
        {msg.attachmentCaption && (
          <p className="text-sm whitespace-pre-wrap">{msg.attachmentCaption}</p>
        )}
        {isImage ? (
          <a
            href={msg.attachmentUrl}
            target="_blank"
            rel="noreferrer"
            className="block"
          >
            <img
              src={msg.attachmentUrl}
              alt={msg.attachmentName || "attachment"}
              className="w-full max-w-sm rounded-xl border object-cover"
            />
          </a>
        ) : (
          <div className="flex items-center gap-2 rounded-xl border bg-white/90 p-3 max-w-sm">
            <Paperclip className="w-4 h-4 text-gray-500" />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium truncate">
                {msg.attachmentName || "File"}
              </p>
              <p className="text-[11px] text-gray-500 truncate">
                {msg.attachmentType || "Attachment"}
              </p>
            </div>
            <a
              href={msg.attachmentUrl}
              download
              className="text-xs text-primary inline-flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              Unduh
            </a>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
        {/* Mobile back button to open sidebar */}
        <button
          onClick={() => onOpenSidebar && onOpenSidebar()}
          className="md:hidden mr-2 text-sm text-primary"
        >
          Kembali
        </button>
        {friend?.avatar ? (
          <Image
            src={friend.avatar}
            alt={friend.name}
            width={40}
            height={40}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-green-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
            {friend?.name
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)}
          </div>
        )}
        <div>
          <h2 className="font-semibold text-gray-900">{friend?.name}</h2>
          <p className="text-xs text-gray-500">@{friend?.username}</p>
          <p className="text-xs text-gray-500">
            {friend?.isOnline
              ? "Online"
              : friend?.lastOnline
                ? `Terakhir online ${new Date(friend.lastOnline).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}`
                : "Offline"}
            {isFriendTyping ? " · Mengetik..." : ""}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="relative flex-1 min-h-0">
        <div
          ref={messagesContainerRef}
          onScroll={handleMessagesScroll}
          className="h-full overflow-y-auto p-4 md:p-6 space-y-4 bg-gradient-to-b from-white to-gray-50"
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">Memuat pesan...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-gray-500">
                <p className="mb-2">Belum ada pesan</p>
                <p className="text-sm">
                  Mulai percakapan dengan {friend?.name}
                </p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => {
                const isOwn = msg.senderId === session?.user?.id;
                const showSender =
                  idx === 0 || messages[idx - 1]?.senderId !== msg.senderId;

                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOwn ? "justify-end" : "justify-start"} ${
                      !showSender && idx !== 0 ? "mt-1" : "mt-3"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[70%] px-4 py-2 rounded-2xl shadow-sm ${
                        isOwn
                          ? "bg-primary text-white"
                          : "bg-white text-gray-900 border border-gray-200"
                      }`}
                    >
                      {msg.content ? (
                        <p className="text-sm whitespace-pre-wrap">
                          {msg.content}
                        </p>
                      ) : null}
                      {renderAttachment(msg)}
                      <p
                        className={`text-xs mt-1 ${
                          isOwn ? "text-primary-100" : "text-gray-500"
                        }`}
                      >
                        {formatTime(msg.createdAt)}{" "}
                        {renderMessageStatus(msg, isOwn)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {showScrollToBottom && (
          <button
            type="button"
            onClick={() => scrollToBottom("smooth")}
            className="absolute bottom-4 right-4 z-10 inline-flex items-center gap-2 rounded-full bg-primary px-3 py-2 text-xs font-medium text-white shadow-lg transition hover:opacity-95"
            aria-label="Scroll ke pesan terbaru"
          >
            <ChevronDown className="h-4 w-4" />
            Pesan terbaru
          </button>
        )}
      </div>

      {/* Message Input */}
      <div className="px-4 md:px-6 py-4 border-t border-gray-200 bg-white space-y-3">
        {attachments.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {attachments.map((att, idx) => {
              const isImage = att?.isImage || IMAGE_TYPES.includes(att?.type);
              return (
                <div
                  key={`${att.url}-${idx}`}
                  className="group relative rounded-xl border bg-gray-50 p-2 overflow-hidden"
                >
                  <button
                    type="button"
                    className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() =>
                      setAttachments((prev) => prev.filter((_, i) => i !== idx))
                    }
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {isImage ? (
                    <img
                      src={att.url}
                      alt={att.name || "attachment"}
                      className="h-24 w-full rounded-lg object-cover"
                    />
                  ) : (
                    <div className="h-24 w-full rounded-lg bg-white border flex flex-col items-center justify-center px-2">
                      <Paperclip className="w-5 h-5 text-gray-600 mb-1" />
                      <p className="text-[10px] text-center text-gray-600 line-clamp-2">
                        {att.name || "File"}
                      </p>
                    </div>
                  )}

                  <p
                    className="mt-1 text-[10px] truncate text-gray-600"
                    title={att.name}
                  >
                    {att.name}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        <form onSubmit={handleSendMessage} className="space-y-3">
          <Textarea
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Tulis pesan..."
            className="min-h-[88px] resize-none"
            disabled={isSending}
          />

          <div className="flex flex-col sm:flex-row gap-2 sm:justify-between sm:items-center">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={
                  isUploading ||
                  isSending ||
                  attachments.length >= MAX_ATTACHMENTS
                }
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Paperclip className="w-4 h-4 mr-2" />
                )}
                {isUploading ? "Mengupload..." : "Lampirkan"}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                multiple
                onChange={handleAttachmentSelect}
              />
            </div>

            <Button
              type="submit"
              disabled={
                (!messageInput.trim() && attachments.length === 0) || isSending
              }
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Send className="h-4 w-4 mr-2" />
              )}
              {isSending ? "Mengirim..." : "Kirim"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
