import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse, jsonResponse } from "@/lib/api-response";
import { apiLogger } from "@/lib/logger";

/**
 * GET /api/chats/conversations
 * Get list of conversations (friends with messages) for the current user
 */
export async function GET(req) {
  const startTime = Date.now();
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return jsonResponse(ApiResponse.unauthorized(), 401);
    }

    const userId = session.user.id;

    // Get all friendships (both directions)
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [{ initiatorId: userId }, { friendId: userId }],
      },
      include: {
        initiator: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            username: true,
          },
        },
        friend: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            username: true,
          },
        },
      },
    });

    // Get friend IDs
    const friendIds = friendships.map((f) =>
      f.initiatorId === userId ? f.friendId : f.initiatorId,
    );

    // Get latest messages with each friend
    const conversations = await Promise.all(
      friendIds.map(async (friendId) => {
        const lastMessage = await prisma.privateMessage.findFirst({
          where: {
            OR: [
              { senderId: userId, receiverId: friendId },
              { senderId: friendId, receiverId: userId },
            ],
            isDeleted: false,
          },
          orderBy: { createdAt: "desc" },
          take: 1,
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

        // Get unread count
        const unreadCount = await prisma.privateMessage.count({
          where: {
            senderId: friendId,
            receiverId: userId,
            isRead: false,
            isDeleted: false,
          },
        });

        const friend = friendships.find(
          (f) =>
            (f.initiatorId === userId && f.friendId === friendId) ||
            (f.friendId === userId && f.initiatorId === friendId),
        );

        const friendData =
          friend.initiatorId === userId ? friend.friend : friend.initiator;

        return {
          friendId,
          friend: friendData,
          lastMessage,
          unreadCount,
        };
      }),
    );

    // Sort by last message date
    conversations.sort(
      (a, b) =>
        (b.lastMessage?.createdAt?.getTime() ?? 0) -
        (a.lastMessage?.createdAt?.getTime() ?? 0),
    );

    const duration = Date.now() - startTime;
    apiLogger.logApiRequest("GET", "/api/chats/conversations", 200, duration);

    return jsonResponse(
      ApiResponse.success({
        conversations,
      }),
      200,
    );
  } catch (error) {
    console.error("Get conversations error:", error);
    const duration = Date.now() - startTime;
    apiLogger.logApiRequest("GET", "/api/chats/conversations", 500, duration);
    return jsonResponse(ApiResponse.internalError(), 500);
  }
}
