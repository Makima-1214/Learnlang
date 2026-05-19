import { describe, it, expect, beforeEach, jest } from "@jest/globals";

jest.mock("next-auth/next", () => ({
  getServerSession: jest.fn(),
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    friendRequest: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    blockedUser: {
      findUnique: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
    friendship: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      upsert: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
    },
    follow: {
      findUnique: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn(),
      upsert: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
    },
    activity: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    notification: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    privateMessage: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      updateMany: jest.fn(),
      findFirst: jest.fn(),
    },
  },
}));

jest.mock("@/lib/api-response", () => ({
  ApiResponse: {
    success: (data) => ({ success: true, data }),
    error: (error) => ({ success: false, error }),
    validationError: (errors) => ({ success: false, errors }),
    rateLimit: () => ({ success: false, error: "Too many requests" }),
    unauthorized: () => ({ success: false, error: "Unauthorized" }),
    forbidden: (error = "Forbidden") => ({ success: false, error }),
    notFound: (error = "Not found") => ({ success: false, error }),
    internalError: () => ({ success: false, error: "Internal server error" }),
  },
  jsonResponse: (data, status) => ({ data, status }),
}));

jest.mock("@/lib/logger", () => ({
  apiLogger: {
    logApiRequest: jest.fn(),
    logRateLimit: jest.fn(),
  },
}));

jest.mock("@/lib/ratelimit", () => ({
  limiters: {
    create: {
      isAllowed: jest.fn(() => true),
      increment: jest.fn(),
    },
    general: {
      isAllowed: jest.fn(() => true),
      increment: jest.fn(),
    },
  },
  getRateLimitKey: jest.fn(() => "test-key"),
}));

jest.mock("@/lib/socket", () => ({
  emitNewPrivateMessage: jest.fn(),
  emitNewNotification: jest.fn(),
}));

jest.mock("@/lib/notifications", () => ({
  createNotification: jest.fn(),
  NotificationType: {
    FOLLOW: "FOLLOW",
    FRIEND_REQUEST: "FRIEND_REQUEST",
    FRIEND_REQUEST_ACCEPTED: "FRIEND_REQUEST_ACCEPTED",
    FRIEND_ADDED: "FRIEND_ADDED",
    BLOG_COMMENT: "BLOG_COMMENT",
    BLOG_REACTION: "BLOG_REACTION",
  },
}));

jest.mock("fs/promises", () => ({
  mkdir: jest.fn(),
  writeFile: jest.fn(),
}));

import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";

describe("Friend system routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getServerSession.mockResolvedValue({
      user: { id: "user-1", name: "User One", role: "USER" },
    });
  });

  it("creates a friend request", async () => {
    const { POST } = await import("../friends/request/route.js");
    prisma.user.findUnique.mockResolvedValue({
      id: "user-2",
      name: "User Two",
    });
    prisma.blockedUser.findUnique.mockResolvedValue(null);
    prisma.friendRequest.findUnique.mockResolvedValue(null);
    prisma.friendRequest.create.mockResolvedValue({
      id: "req-1",
      senderId: "user-1",
      receiverId: "user-2",
      status: "PENDING",
    });
    prisma.activity.create.mockResolvedValue({ id: "act-1" });
    prisma.notification.create.mockResolvedValue({
      id: "notif-1",
      userId: "user-2",
      title: "Permintaan Pertemanan",
      isRead: false,
    });

    const req = {
      json: async () => ({ followingId: "user-2" }),
    };

    const result = await POST(req);

    expect(result.status).toBe(200);
    expect(prisma.friendRequest.create).toHaveBeenCalled();
  });

  it("sends private message with attachment metadata", async () => {
    const { POST } = await import("../messages/send/route.js");
    prisma.user.findUnique.mockResolvedValue({
      id: "user-2",
      name: "User Two",
    });
    prisma.friendship.findUnique.mockResolvedValue({ id: "friendship-1" });
    prisma.blockedUser.findUnique.mockResolvedValue(null);
    prisma.privateMessage.create.mockResolvedValue({
      id: "msg-1",
      senderId: "user-1",
      receiverId: "user-2",
      content: "",
      attachmentUrl: "/uploads/messages/file.png",
      attachmentName: "file.png",
      attachmentType: "image/png",
      attachmentSize: 1234,
      attachmentCaption: "Lampiran",
      sender: { id: "user-1", name: "User One", avatar: null },
      receiver: { id: "user-2", name: "User Two", avatar: null },
    });

    const req = {
      json: async () => ({
        receiverId: "user-2",
        content: "",
        attachmentUrl: "/uploads/messages/file.png",
        attachmentName: "file.png",
        attachmentType: "image/png",
        attachmentSize: 1234,
        attachmentCaption: "Lampiran",
      }),
    };

    const result = await POST(req);

    expect(result.status).toBe(200);
    expect(prisma.privateMessage.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          attachmentUrl: "/uploads/messages/file.png",
          attachmentCaption: "Lampiran",
        }),
      }),
    );
  });

  it("uploads chat attachment metadata", async () => {
    const { POST } = await import("../messages/attachments/route.js");
    const fakeFile = {
      type: "image/png",
      size: 1000,
      name: "image.png",
      arrayBuffer: async () => new ArrayBuffer(8),
    };

    const req = {
      formData: async () => ({ get: () => fakeFile }),
    };

    const result = await POST(req);
    const payload = await result.json();

    expect(result.status).toBe(200);
    expect(payload.url).toContain("/uploads/messages/");
  });
});
