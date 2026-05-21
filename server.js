const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");
const { PrismaClient } = require("@prisma/client");

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

async function emitPresenceToFriends(userId, event, payload) {
  const friendships = await prisma.friendship.findMany({
    where: {
      OR: [{ initiatorId: userId }, { friendId: userId }],
    },
    select: {
      initiatorId: true,
      friendId: true,
    },
  });

  const friendIds = friendships.map((friendship) =>
    friendship.initiatorId === userId
      ? friendship.friendId
      : friendship.initiatorId,
  );

  const io = global.io;
  for (const friendId of friendIds) {
    io?.to(`user:${friendId}`).emit(event, payload);
  }
}

// Temporary in-memory presence store. Later replace with Redis for multi-process.
const presenceStore = new Map();

function setPresence(userId, data) {
  const existing = presenceStore.get(userId) || {};
  presenceStore.set(userId, { ...existing, ...data });
}

function getPresence(userId) {
  return presenceStore.get(userId) || null;
}

function removePresence(userId) {
  presenceStore.delete(userId);
}

// Expose presenceStore for API routes to read (temporary; replace with Redis later)
global.presenceStore = presenceStore;

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  const io = new Server(httpServer, {
    cors: {
      origin:
        process.env.NODE_ENV === "production"
          ? process.env.NEXTAUTH_URL
          : "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  // Socket.IO connection handling
  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    // Join blog-specific room
    socket.on("join-blog", (blogSlug) => {
      socket.join(`blog:${blogSlug}`);
      console.log(`Socket ${socket.id} joined blog:${blogSlug}`);
    });

    // Leave blog-specific room
    socket.on("leave-blog", (blogSlug) => {
      socket.leave(`blog:${blogSlug}`);
      console.log(`Socket ${socket.id} left blog:${blogSlug}`);
    });

    // Join discussion room
    socket.on("join-room", (roomId) => {
      socket.join(`room:${roomId}`);
      console.log(`Socket ${socket.id} joined room:${roomId}`);
    });

    // Leave discussion room
    socket.on("leave-room", (roomId) => {
      socket.leave(`room:${roomId}`);
      console.log(`Socket ${socket.id} left room:${roomId}`);
    });

    // Join private friend chat room
    socket.on("join-private-chat", ({ userId1, userId2 }) => {
      const roomId = `dm:${[userId1, userId2].sort().join(":")}`;
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined ${roomId}`);
    });

    // Identify user and join personal room for direct notifications
    socket.on("identify", (payload) => {
      try {
        const userId = payload?.userId || payload;
        if (userId) {
          socket.data.userId = userId;
          socket.join(`user:${userId}`);
          console.log(`Socket ${socket.id} joined user:${userId}`);
        }
      } catch (err) {
        console.error("Identify error:", err);
      }
    });

    socket.on("leave-private-chat", ({ userId1, userId2 }) => {
      const roomId = `dm:${[userId1, userId2].sort().join(":")}`;
      socket.leave(roomId);
      console.log(`Socket ${socket.id} left ${roomId}`);
    });

    // User typing indicator
    socket.on("typing-start", ({ roomId, user }) => {
      socket.to(`room:${roomId}`).emit("user-typing", { user, isTyping: true });
    });

    socket.on("typing-stop", ({ roomId, user }) => {
      socket
        .to(`room:${roomId}`)
        .emit("user-typing", { user, isTyping: false });
    });

    // Presence tracking for private chat
    socket.on("user-online", ({ userId, username }) => {
      try {
        const now = new Date();
        setPresence(userId, {
          isOnline: true,
          lastOnline: now,
          isTyping: false,
          username,
        });
        emitPresenceToFriends(userId, "friend-online", {
          userId,
          username,
          isOnline: true,
          lastOnline: now,
        });
        console.log(`User ${userId} is now online`);
      } catch (err) {
        console.error(
          "Error setting user online status in presence store:",
          err,
        );
      }
    });

    socket.on("user-offline", ({ userId }) => {
      try {
        const now = new Date();
        setPresence(userId, { isOnline: false, lastOnline: now });
        emitPresenceToFriends(userId, "friend-offline", {
          userId,
          lastOnline: now,
          isOnline: false,
        });
        console.log(`User ${userId} is now offline`);
      } catch (err) {
        console.error(
          "Error setting user offline status in presence store:",
          err,
        );
      }
    });

    // Typing indicator for private chat
    socket.on("private-typing-start", ({ userId, friendId }) => {
      try {
        setPresence(userId, { isTyping: true });
      } catch (err) {
        console.error("Error updating typing state in presence store:", err);
      }
      socket
        .to(`user:${friendId}`)
        .emit("friend-typing", { userId, isTyping: true });
    });

    socket.on("private-typing-stop", ({ userId, friendId }) => {
      try {
        setPresence(userId, { isTyping: false });
      } catch (err) {
        console.error("Error updating typing state in presence store:", err);
      }
      socket
        .to(`user:${friendId}`)
        .emit("friend-typing", { userId, isTyping: false });
    });

    // Message read receipt
    socket.on("message-read", async ({ messageId, senderId, receiverId }) => {
      try {
        const now = new Date();
        await prisma.privateMessage.update({
          where: { id: messageId },
          data: {
            isRead: true,
            readAt: now,
          },
        });
        io.to(`user:${senderId}`).emit("message-read-receipt", {
          messageId,
          readAt: now,
        });
        console.log(
          `Message ${messageId} marked as read by user ${receiverId}`,
        );
      } catch (err) {
        console.error("Error marking message as read:", err);
      }
    });

    socket.on("disconnect", () => {
      if (socket.data.userId) {
        const uid = socket.data.userId;
        try {
          const now = new Date();
          setPresence(uid, { isOnline: false, lastOnline: now });
          emitPresenceToFriends(uid, "friend-offline", {
            userId: uid,
            lastOnline: now,
            isOnline: false,
          });
        } catch (err) {
          console.error("Disconnect presence update failed:", err);
        }
      }
      console.log("Client disconnected:", socket.id);
    });
  });

  // Make io accessible globally
  global.io = io;

  httpServer
    .once("error", (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(
        `> Ready on http://${hostname}:${port} as ${dev ? "development" : process.env.NODE_ENV}`,
      );
    });
});
