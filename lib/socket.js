// Socket.IO helper functions for server-side
export function getIO() {
  if (!global.io) {
    throw new Error("Socket.IO not initialized");
  }
  return global.io;
}

export function emitToRoom(room, event, data) {
  try {
    const io = getIO();
    io.to(room).emit(event, data);
  } catch (error) {
    console.error("Socket emit error:", error);
  }
}

export function emitNewComment(blogSlug, comment) {
  emitToRoom(`blog:${blogSlug}`, "new-comment", comment);
}

export function emitDeleteComment(blogSlug, commentId) {
  emitToRoom(`blog:${blogSlug}`, "delete-comment", { commentId });
}

export function emitReactionUpdate(blogSlug, reactionData) {
  emitToRoom(`blog:${blogSlug}`, "reaction-update", reactionData);
}

// Discussion room events
export function emitNewMessage(roomId, message) {
  emitToRoom(`room:${roomId}`, "new-message", message);
}

export function emitMessageDeleted(roomId, message) {
  emitToRoom(`room:${roomId}`, "message-deleted", message);
}

export function emitDeleteMessage(roomId, messageId) {
  emitToRoom(`room:${roomId}`, "delete-message", { messageId });
}

// Private friend chat events
export function getPrivateChatRoom(userId1, userId2) {
  return `dm:${[userId1, userId2].sort().join(":")}`;
}

export function emitNewPrivateMessage(arg1, arg2, arg3) {
  // Backward-compatible signatures:
  // 1) emitNewPrivateMessage(receiverId, message)
  // 2) emitNewPrivateMessage(senderId, receiverId, message)
  let senderId;
  let receiverId;
  let message;

  if (arg3) {
    senderId = arg1;
    receiverId = arg2;
    message = arg3;
  } else {
    receiverId = arg1;
    message = arg2;
    senderId = message?.senderId;
  }

  if (!receiverId || !message) return;

  emitToRoom(`user:${receiverId}`, "private-message", message);
  if (senderId) {
    emitToRoom(`user:${senderId}`, "private-message", message);
  }

  if (message.senderId && message.receiverId) {
    emitToRoom(
      getPrivateChatRoom(message.senderId, message.receiverId),
      "private-message",
      message,
    );
  }
}

export function emitPrivateMessageDeleted(userId1, userId2, message) {
  emitToRoom(
    getPrivateChatRoom(userId1, userId2),
    "private-message-deleted",
    message,
  );
}

// Friend request notifications
export function emitNewFriendRequest(userId, request) {
  emitToRoom(`user:${userId}`, "friend-request", request);
}

// Generic notification emit
export function emitNewNotification(userId, notification) {
  emitToRoom(`user:${userId}`, "notification", notification);
}
