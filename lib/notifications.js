/**
 * Universal Notification System
 *
 * Provides reusable functions for creating and emitting notifications
 * across all features (follows, friend requests, comments, reactions, quiz, etc.)
 *
 * Usage:
 *   import { createNotification } from '@/lib/notifications';
 *
 *   await createNotification({
 *     userId: recipientId,
 *     type: 'FOLLOW',
 *     title: 'Follower Baru',
 *     description: `${userName} mulai mengikuti Anda`,
 *     icon: '👤',
 *     link: `/user/${username}`,
 *     metadata: { followerId, followId }
 *   });
 */

import { prisma } from "@/lib/prisma";
import { emitNewNotification } from "@/lib/socket";
import { apiLogger } from "@/lib/logger";

/**
 * Notification types that can be created across the system
 * Each type corresponds to a feature event that triggers a notification
 */
export const NotificationType = {
  // Social/Friends
  FOLLOW: "FOLLOW",
  FRIEND_REQUEST: "FRIEND_REQUEST",
  FRIEND_REQUEST_ACCEPTED: "FRIEND_REQUEST_ACCEPTED",
  FRIEND_ADDED: "FRIEND_ADDED",
  UNFOLLOW: "UNFOLLOW",

  // Blog/Content
  BLOG_COMMENT: "BLOG_COMMENT",
  BLOG_COMMENT_REPLY: "BLOG_COMMENT_REPLY",
  BLOG_REACTION: "BLOG_REACTION",
  BLOG_PUBLISHED: "BLOG_PUBLISHED",

  // Quiz/Learning
  QUIZ_CREATED: "QUIZ_CREATED",
  QUIZ_SHARED: "QUIZ_SHARED",
  QUIZ_RESULT: "QUIZ_RESULT",
  LESSON_COMPLETED: "LESSON_COMPLETED",

  // Chat/Messages
  MESSAGE_RECEIVED: "MESSAGE_RECEIVED",
  GROUP_MESSAGE: "GROUP_MESSAGE",

  // Discussion
  ROOM_MESSAGE: "ROOM_MESSAGE",
  ROOM_CREATED: "ROOM_CREATED",

  // System
  SYSTEM: "SYSTEM",
  ANNOUNCEMENT: "ANNOUNCEMENT",
};

/**
 * Icon mapping for each notification type
 * Can be emoji, icon name, or URL
 */
export const NotificationIcons = {
  [NotificationType.FOLLOW]: "👤",
  [NotificationType.FRIEND_REQUEST]: "👋",
  [NotificationType.FRIEND_REQUEST_ACCEPTED]: "🎉",
  [NotificationType.FRIEND_ADDED]: "👥",
  [NotificationType.UNFOLLOW]: "👤",
  [NotificationType.BLOG_COMMENT]: "💬",
  [NotificationType.BLOG_COMMENT_REPLY]: "↩️",
  [NotificationType.BLOG_REACTION]: "❤️",
  [NotificationType.BLOG_PUBLISHED]: "📝",
  [NotificationType.QUIZ_CREATED]: "❓",
  [NotificationType.QUIZ_SHARED]: "🎯",
  [NotificationType.QUIZ_RESULT]: "✅",
  [NotificationType.LESSON_COMPLETED]: "🏆",
  [NotificationType.MESSAGE_RECEIVED]: "💌",
  [NotificationType.GROUP_MESSAGE]: "🗨️",
  [NotificationType.ROOM_MESSAGE]: "💬",
  [NotificationType.ROOM_CREATED]: "🎪",
  [NotificationType.SYSTEM]: "🔔",
  [NotificationType.ANNOUNCEMENT]: "📢",
};

/**
 * Create and emit a notification
 *
 * @param {Object} options - Notification options
 * @param {string} options.userId - Recipient user ID
 * @param {string} options.type - NotificationType enum value
 * @param {string} options.title - Notification title
 * @param {string} options.description - Notification description (optional)
 * @param {string} options.icon - Icon/emoji (optional, defaults to type's icon)
 * @param {string} options.link - Action link (optional)
 * @param {Object} options.metadata - Additional metadata as object (optional)
 * @param {boolean} options.skipEmit - Skip real-time emit, only save to DB (optional)
 * @returns {Promise<Object>} Created notification object
 *
 * @example
 * // Create a follow notification
 * const notification = await createNotification({
 *   userId: targetUserId,
 *   type: NotificationType.FOLLOW,
 *   title: 'Follower Baru',
 *   description: `${followerName} mulai mengikuti Anda`,
 *   link: `/user/${followerUsername}`,
 *   metadata: { followerId, followId }
 * });
 */
export async function createNotification(options) {
  const {
    userId,
    type,
    title,
    description,
    icon,
    link,
    metadata,
    skipEmit = false,
  } = options;

  // Validate required fields
  if (!userId || !type || !title) {
    throw new Error("createNotification: userId, type, and title are required");
  }

  try {
    // Use provided icon or default to type's icon
    const finalIcon = icon || NotificationIcons[type] || "🔔";

    // Create notification in database
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        description: description || null,
        icon: finalIcon,
        link: link || null,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });

    // Emit real-time notification unless explicitly skipped
    if (!skipEmit) {
      try {
        emitNewNotification(userId, {
          id: notification.id,
          title: notification.title,
          description: notification.description,
          icon: notification.icon,
          link: notification.link,
          type,
          isRead: notification.isRead,
          createdAt: notification.createdAt,
        });
      } catch (emitError) {
        // Log but don't fail if emit fails - notification is still persisted
        apiLogger.error("Failed to emit notification:", {
          userId,
          notificationId: notification.id,
          error: emitError.message,
        });
      }
    }

    return notification;
  } catch (error) {
    apiLogger.error("Failed to create notification:", {
      userId,
      type,
      error: error.message,
    });
    throw error;
  }
}

/**
 * Create multiple notifications at once
 * Useful for broadcasting to multiple users
 *
 * @param {Array<Object>} notifications - Array of notification options
 * @returns {Promise<Array>} Array of created notifications
 *
 * @example
 * // Notify all followers of a new blog post
 * const followers = [user1, user2, user3];
 * await createBulkNotifications(
 *   followers.map(follower => ({
 *     userId: follower.id,
 *     type: NotificationType.BLOG_PUBLISHED,
 *     title: 'Blog Baru',
 *     description: `${authorName} menerbitkan "${blogTitle}"`,
 *     link: `/blogs/${blogSlug}`,
 *     metadata: { blogId, authorId }
 *   }))
 * );
 */
export async function createBulkNotifications(notifications) {
  if (!Array.isArray(notifications) || notifications.length === 0) {
    throw new Error(
      "createBulkNotifications: notifications must be a non-empty array",
    );
  }

  try {
    const results = await Promise.allSettled(
      notifications.map((notif) => createNotification(notif)),
    );

    // Log failures but continue
    const failures = results.filter((r) => r.status === "rejected");
    if (failures.length > 0) {
      apiLogger.warn(
        `${failures.length} of ${notifications.length} bulk notifications failed`,
      );
    }

    return results.filter((r) => r.status === "fulfilled").map((r) => r.value);
  } catch (error) {
    apiLogger.error("Bulk notification creation failed:", {
      count: notifications.length,
      error: error.message,
    });
    throw error;
  }
}

/**
 * Get default notification config for common features
 * Simplifies notification creation by providing pre-configured templates
 *
 * @param {string} featureType - Feature type ('FOLLOW', 'COMMENT', 'REACTION', etc)
 * @param {Object} data - Feature-specific data
 * @returns {Object} Notification config object ready for createNotification()
 *
 * @example
 * const config = getNotificationConfig('FOLLOW', {
 *   userId: targetId,
 *   userName: follower.name,
 *   userUsername: follower.username
 * });
 * await createNotification(config);
 */
export function getNotificationConfig(featureType, data = {}) {
  const configs = {
    FOLLOW: {
      type: NotificationType.FOLLOW,
      title: "Follower Baru",
      description: `${data.userName ?? "Seseorang"} mulai mengikuti Anda`,
      link: data.userUsername ? `/user/${data.userUsername}` : null,
      metadata: {
        type: "FOLLOW",
        followerId: data.followerId,
        followId: data.followId,
      },
    },
    FRIEND_REQUEST: {
      type: NotificationType.FRIEND_REQUEST,
      title: "Permintaan Pertemanan",
      description: `${data.userName ?? "Seseorang"} mengirim permintaan pertemanan`,
      link: data.userUsername ? `/user/${data.userUsername}` : null,
      metadata: {
        type: "FRIEND_REQUEST",
        senderId: data.senderId,
        requestId: data.requestId,
      },
    },
    FRIEND_REQUEST_ACCEPTED: {
      type: NotificationType.FRIEND_REQUEST_ACCEPTED,
      title: "Permintaan Diterima",
      description: `${data.userName ?? "Seseorang"} menerima permintaan pertemanan Anda`,
      link: data.userUsername ? `/user/${data.userUsername}` : null,
      metadata: {
        type: "FRIEND_REQUEST_ACCEPTED",
        userId: data.userId,
      },
    },
    BLOG_COMMENT: {
      type: NotificationType.BLOG_COMMENT,
      title: "Komentar Baru",
      description: `${data.userName ?? "Seseorang"} berkomentar pada artikel Anda: "${data.excerpt}"`,
      link: data.blogLink ? `/blogs/${data.blogLink}` : null,
      metadata: {
        type: "BLOG_COMMENT",
        commentId: data.commentId,
        blogId: data.blogId,
      },
    },
    BLOG_REACTION: {
      type: NotificationType.BLOG_REACTION,
      title: "Reaksi Baru",
      description: `${data.userName ?? "Seseorang"} memberi reaksi ${data.emoji} pada artikel Anda`,
      link: data.blogLink ? `/blogs/${data.blogLink}` : null,
      icon: data.emoji || "❤️",
      metadata: {
        type: "BLOG_REACTION",
        emoji: data.emoji,
        blogId: data.blogId,
      },
    },
  };

  return {
    ...configs[featureType],
    userId: data.userId,
  };
}

/**
 * Mark notification(s) as read
 *
 * @param {string|Array<string>} ids - Notification ID(s)
 * @returns {Promise<Object>} Update result
 */
export async function markAsRead(ids) {
  const idArray = Array.isArray(ids) ? ids : [ids];

  try {
    const result = await prisma.notification.updateMany({
      where: { id: { in: idArray } },
      data: { isRead: true },
    });
    return result;
  } catch (error) {
    apiLogger.error("Failed to mark notifications as read:", {
      error: error.message,
    });
    throw error;
  }
}

/**
 * Mark all notifications for a user as read
 *
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Update result
 */
export async function markAllAsRead(userId) {
  try {
    const result = await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    return result;
  } catch (error) {
    apiLogger.error("Failed to mark all notifications as read:", {
      userId,
      error: error.message,
    });
    throw error;
  }
}

/**
 * Delete notification(s)
 *
 * @param {string|Array<string>} ids - Notification ID(s)
 * @returns {Promise<Object>} Delete result
 */
export async function deleteNotifications(ids) {
  const idArray = Array.isArray(ids) ? ids : [ids];

  try {
    const result = await prisma.notification.deleteMany({
      where: { id: { in: idArray } },
    });
    return result;
  } catch (error) {
    apiLogger.error("Failed to delete notifications:", {
      error: error.message,
    });
    throw error;
  }
}

/**
 * Get unread notification count for a user
 *
 * @param {string} userId - User ID
 * @returns {Promise<number>} Unread count
 */
export async function getUnreadCount(userId) {
  try {
    const count = await prisma.notification.count({
      where: { userId, isRead: false },
    });
    return count;
  } catch (error) {
    apiLogger.error("Failed to get unread count:", {
      userId,
      error: error.message,
    });
    throw error;
  }
}
