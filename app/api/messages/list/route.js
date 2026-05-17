import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse, jsonResponse } from "@/lib/api-response";
import { apiLogger } from "@/lib/logger";
import { limiters, getRateLimitKey } from "@/lib/ratelimit";

/**
 * GET /api/messages/list
 * Get list of conversations (friends with recent messages)
 */
export async function GET(req) {
  const startTime = Date.now();
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return jsonResponse(ApiResponse.unauthorized(), 401);
    }

    const userId = session.user.id;

    // Get all friends
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [{ initiatorId: userId }, { friendId: userId }],
      },
      include: {
        initiator: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
        friend: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    // For each friend, get the latest message
    const conversations = await Promise.all(
      friendships.map(async (friendship) => {
        const otherUser =
          friendship.initiatorId === userId
            ? friendship.friend
            : friendship.initiator;

        const lastMessage = await prisma.privateMessage.findFirst({
          where: {
            OR: [
              { senderId: userId, receiverId: otherUser.id },
              { senderId: otherUser.id, receiverId: userId },
            ],
            isDeleted: false,
          },
          orderBy: { createdAt: "desc" },
        });

        const unreadCount = await prisma.privateMessage.count({
          where: {
            senderId: otherUser.id,
            receiverId: userId,
            isRead: false,
          },
        });

        return {
          user: otherUser,
          lastMessage,
          unreadCount,
          lastMessageAt: lastMessage?.createdAt || friendship.createdAt,
        };
      }),
    );

    // Sort by last message date (newest first)
    conversations.sort(
      (a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt),
    );

    const duration = Date.now() - startTime;
    apiLogger.logApiRequest("GET", "/api/messages/list", 200, duration);

    return jsonResponse(
      ApiResponse.success({
        conversations,
        total: conversations.length,
      }),
      200,
    );
  } catch (error) {
    console.error("Get conversations error:", error);
    apiLogger.logApiRequest(
      "GET",
      "/api/messages/list",
      500,
      Date.now() - startTime,
    );
    return jsonResponse(ApiResponse.internalError(), 500);
  }
}
