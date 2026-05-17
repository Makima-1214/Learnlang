const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const { Server } = require("socket.io");

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

    socket.on("disconnect", () => {
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
