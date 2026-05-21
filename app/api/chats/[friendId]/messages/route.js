import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse, jsonResponse } from "@/lib/api-response";
import { apiLogger } from "@/lib/logger";
import { awardDirectMessageAchievements } from "@/lib/achievements";
import { emitNewPrivateMessage } from "@/lib/socket";

/**
 * GET /api/chats/[friendId]/messages
 * Get messages between current user and a friend
 */
export async function GET(req, { params }) {
  const startTime = Date.now();
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return jsonResponse(ApiResponse.unauthorized(), 401);
    }

    const userId = session.user.id;
    const { friendId } = await params;

    // Check if they are friends
    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { initiatorId: userId, friendId },
          { initiatorId: friendId, friendId: userId },
        ],
      },
    });

    if (!friendship) {
      return jsonResponse(ApiResponse.forbidden("Not friends"), 403);
    }

    // Get messages
    const messages = await prisma.privateMessage.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: friendId },
          { senderId: friendId, receiverId: userId },
        ],
        isDeleted: false,
      },
      orderBy: { createdAt: "asc" },
      take: 50,
      skip: 0,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // Note: marking messages as read (and emitting receipts) is handled by
    // the PATCH endpoint or realtime socket events. Do not update here so
    // the client-side flow can reliably emit read receipts.

    const duration = Date.now() - startTime;
    apiLogger.logApiRequest(
      "GET",
      `/api/chats/[friendId]/messages`,
      200,
      duration,
    );

    return jsonResponse(
      ApiResponse.success({
        messages,
      }),
      200,
    );
  } catch (error) {
    console.error("Get messages error:", error);
    const duration = Date.now() - startTime;
    apiLogger.logApiRequest(
      "GET",
      `/api/chats/[friendId]/messages`,
      500,
      duration,
    );
    return jsonResponse(ApiResponse.internalError(), 500);
  }
}

/**
 * POST /api/chats/[friendId]/messages
 * Send a message to a friend
 */
export async function POST(req, { params }) {
  const startTime = Date.now();
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return jsonResponse(ApiResponse.unauthorized(), 401);
    }

    const userId = session.user.id;
    const { friendId } = await params;
    const body = await req.json();
    const { content } = body;

    if (!content || content.trim() === "") {
      return jsonResponse(
        ApiResponse.validationError(["Message content is required"]),
        400,
      );
    }

    // Check if they are friends
    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { initiatorId: userId, friendId },
          { initiatorId: friendId, friendId: userId },
        ],
      },
    });

    if (!friendship) {
      return jsonResponse(ApiResponse.forbidden("Not friends"), 403);
    }

    // Create message
    const message = await prisma.privateMessage.create({
      data: {
        senderId: userId,
        receiverId: friendId,
        content: content.trim(),
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // Emit realtime message via socket
    try {
      emitNewPrivateMessage(friendId, message);
    } catch (err) {
      console.error("Failed to emit message:", err);
    }

    try {
      await awardDirectMessageAchievements(userId);
    } catch (achievementError) {
      console.error("Failed to award chat achievements:", achievementError);
    }

    const duration = Date.now() - startTime;
    apiLogger.logApiRequest(
      "POST",
      `/api/chats/[friendId]/messages`,
      200,
      duration,
    );

    return jsonResponse(
      ApiResponse.success({
        message,
      }),
      200,
    );
  } catch (error) {
    console.error("Send message error:", error);
    const duration = Date.now() - startTime;
    apiLogger.logApiRequest(
      "POST",
      `/api/chats/[friendId]/messages`,
      500,
      duration,
    );
    return jsonResponse(ApiResponse.internalError(), 500);
  }
}

/**
 * PATCH /api/chats/[friendId]/messages
 * Mark messages from a friend as read
 */
export async function PATCH(req, { params }) {
  const startTime = Date.now();
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return jsonResponse(ApiResponse.unauthorized(), 401);
    }

    const userId = session.user.id;
    const { friendId } = await params;

    const friendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { initiatorId: userId, friendId },
          { initiatorId: friendId, friendId: userId },
        ],
      },
    });

    if (!friendship) {
      return jsonResponse(ApiResponse.forbidden("Not friends"), 403);
    }

    // Find the message IDs to mark as read so we can emit per-message receipts
    const messagesToMark = await prisma.privateMessage.findMany({
      where: {
        senderId: friendId,
        receiverId: userId,
        isRead: false,
        isDeleted: false,
      },
      select: { id: true },
    });

    const now = new Date();
    let updatedCount = 0;
    if (messagesToMark.length > 0) {
      const ids = messagesToMark.map((m) => m.id);
      const updateResult = await prisma.privateMessage.updateMany({
        where: { id: { in: ids } },
        data: { isRead: true, readAt: now },
      });
      updatedCount = updateResult.count || messagesToMark.length;

      try {
        const { emitToRoom } = await import("@/lib/socket");
        for (const m of messagesToMark) {
          emitToRoom(`user:${friendId}`, "message-read-receipt", {
            messageId: m.id,
            readAt: now,
          });
        }
      } catch (err) {
        console.error("Failed to emit read receipts:", err);
      }
    }

    const duration = Date.now() - startTime;
    apiLogger.logApiRequest(
      "PATCH",
      `/api/chats/[friendId]/messages`,
      200,
      duration,
    );

    return jsonResponse(
      ApiResponse.success({
        updatedCount,
        readAt: now,
      }),
      200,
    );
  } catch (error) {
    console.error("Mark messages read error:", error);
    const duration = Date.now() - startTime;
    apiLogger.logApiRequest(
      "PATCH",
      `/api/chats/[friendId]/messages`,
      500,
      duration,
    );
    return jsonResponse(ApiResponse.internalError(), 500);
  }
}
