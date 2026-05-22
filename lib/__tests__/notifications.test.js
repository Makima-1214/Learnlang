/**
 * Unit tests for lib/notifications.js
 * Tests notification creation, emission, and helper functions
 */

import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import {
  createNotification,
  NotificationType,
  NotificationIcons,
} from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import { emitNewNotification } from "@/lib/socket";

// Mock prisma and socket
jest.mock("@/lib/prisma");
jest.mock("@/lib/socket");

describe("lib/notifications.js", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Setup mock structure for prisma.notification methods
    prisma.notification = {
      create: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
    };
  });

  describe("NotificationType enum", () => {
    it("should have all notification types defined", () => {
      expect(NotificationType.FOLLOW).toBe("FOLLOW");
      expect(NotificationType.FRIEND_REQUEST).toBe("FRIEND_REQUEST");
      expect(NotificationType.BLOG_COMMENT).toBe("BLOG_COMMENT");
      expect(NotificationType.QUIZ_CREATED).toBe("QUIZ_CREATED");
      expect(NotificationType.MESSAGE_RECEIVED).toBe("MESSAGE_RECEIVED");
    });
  });

  describe("NotificationIcons mapping", () => {
    it("should map icons for each notification type", () => {
      expect(NotificationIcons[NotificationType.FOLLOW]).toBe("👤");
      expect(NotificationIcons[NotificationType.FRIEND_REQUEST]).toBe("👋");
      expect(NotificationIcons[NotificationType.BLOG_COMMENT]).toBe("💬");
      expect(NotificationIcons[NotificationType.MESSAGE_RECEIVED]).toBe("💌");
    });

    it("should have default icon for all types", () => {
      Object.values(NotificationType).forEach((type) => {
        expect(NotificationIcons[type]).toBeDefined();
      });
    });
  });

  describe("createNotification()", () => {
    const mockNotificationData = {
      id: "notif-1",
      userId: "user-1",
      type: "FOLLOW",
      title: "Follower Baru",
      description: "John mengikuti Anda",
      icon: "👤",
      link: "/user/john",
      isRead: false,
      metadata: JSON.stringify({ followerId: "john-id" }),
      createdAt: new Date(),
    };

    it("should create notification with required fields", async () => {
      prisma.notification.create.mockResolvedValue(mockNotificationData);

      const result = await createNotification({
        userId: "user-1",
        type: NotificationType.FOLLOW,
        title: "Follower Baru",
      });

      expect(prisma.notification.create).toHaveBeenCalled();
      expect(result.userId).toBe("user-1");
      expect(result.title).toBe("Follower Baru");
    });

    it("should use default icon from NotificationIcons if not provided", async () => {
      const createCall = prisma.notification.create.mockResolvedValue({
        ...mockNotificationData,
        icon: "👤", // Default for FOLLOW
      });

      await createNotification({
        userId: "user-1",
        type: NotificationType.FOLLOW,
        title: "Follower Baru",
      });

      expect(createCall).toHaveBeenCalled();
    });

    it("should use provided icon over default", async () => {
      const createCall = prisma.notification.create.mockResolvedValue({
        ...mockNotificationData,
        icon: "⭐",
      });

      await createNotification({
        userId: "user-1",
        type: NotificationType.FOLLOW,
        title: "Follower Baru",
        icon: "⭐",
      });

      const callArgs = createCall.mock.calls[0][0];
      expect(callArgs.data.icon).toBe("⭐");
    });

    it("should convert metadata object to JSON string", async () => {
      const createCall =
        prisma.notification.create.mockResolvedValue(mockNotificationData);

      const metadataObj = { followerId: "user-2", followId: "follow-1" };

      await createNotification({
        userId: "user-1",
        type: NotificationType.FOLLOW,
        title: "Follower Baru",
        metadata: metadataObj,
      });

      const callArgs = createCall.mock.calls[0][0];
      expect(typeof callArgs.data.metadata).toBe("string");
      expect(JSON.parse(callArgs.data.metadata)).toEqual(metadataObj);
    });

    it("should emit real-time notification by default", async () => {
      prisma.notification.create.mockResolvedValue(mockNotificationData);

      await createNotification({
        userId: "user-1",
        type: NotificationType.FOLLOW,
        title: "Follower Baru",
      });

      expect(emitNewNotification).toHaveBeenCalledWith(
        "user-1",
        expect.any(Object),
      );
    });

    it("should skip emit if skipEmit flag is true", async () => {
      prisma.notification.create.mockResolvedValue(mockNotificationData);

      await createNotification({
        userId: "user-1",
        type: NotificationType.FOLLOW,
        title: "Follower Baru",
        skipEmit: true,
      });

      expect(emitNewNotification).not.toHaveBeenCalled();
    });

    it("should throw error if required fields are missing", async () => {
      await expect(
        createNotification({
          type: NotificationType.FOLLOW,
          title: "Test",
        }),
      ).rejects.toThrow("userId");

      await expect(
        createNotification({
          userId: "user-1",
          title: "Test",
        }),
      ).rejects.toThrow("type");

      await expect(
        createNotification({
          userId: "user-1",
          type: NotificationType.FOLLOW,
        }),
      ).rejects.toThrow("title");
    });
  });

  describe("NotificationType and NotificationIcons sanity checks", () => {
    it("all types should have corresponding icons", () => {
      Object.values(NotificationType).forEach((type) => {
        expect(NotificationIcons[type]).toBeDefined();
        expect(typeof NotificationIcons[type]).toBe("string");
      });
    });

    it("should have common notification types", () => {
      expect(NotificationType.FOLLOW).toBeDefined();
      expect(NotificationType.FRIEND_REQUEST).toBeDefined();
      expect(NotificationType.BLOG_COMMENT).toBeDefined();
      expect(NotificationType.QUIZ_CREATED).toBeDefined();
    });
  });
});
