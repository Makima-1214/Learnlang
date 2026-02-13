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

export function emitDeleteMessage(roomId, messageId) {
  emitToRoom(`room:${roomId}`, "delete-message", { messageId });
}
