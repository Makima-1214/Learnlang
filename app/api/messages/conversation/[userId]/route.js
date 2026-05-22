import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse, jsonResponse } from "@/lib/api-response";
import { apiLogger } from "@/lib/logger";
import { limiters, getRateLimitKey } from "@/lib/ratelimit";

/**
 * GET /api/messages/conversation/[userId]
 * Get message history with a specific user
 */
export async function GET(req, { params }) {
  const startTime = Date.now();
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return jsonResponse(ApiResponse.unauthorized(), 401);
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = 50;
    const skip = (page - 1) * pageSize;

    const userId = session.user.id;
    const { userId: otherUserId } = await params;

    if (!otherUserId) {
      return jsonResponse(
        ApiResponse.validationError(["userId is required"]),
        400,
      );
    }

    // Get conversation with pagination (newest first)
    const messages = await prisma.privateMessage.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
        isDeleted: false,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    });

    const total = await prisma.privateMessage.count({
      where: {
        OR: [
          { senderId: userId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: userId },
        ],
        isDeleted: false,
      },
    });

    // Mark received messages as read
    await prisma.privateMessage.updateMany({
      where: {
        senderId: otherUserId,
        receiverId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    const duration = Date.now() - startTime;
    apiLogger.logApiRequest(
      "GET",
      `/api/messages/conversation/[userId]`,
      200,
      duration,
    );

    return jsonResponse(
      ApiResponse.success({
        messages: messages.reverse(), // Reverse to show oldest first
        pagination: {
          page,
          pageSize,
          total,
          totalPages: Math.ceil(total / pageSize),
        },
      }),
      200,
    );
  } catch (error) {
    console.error("Get conversation error:", error);
    apiLogger.logApiRequest(
      "GET",
      `/api/messages/conversation/[userId]`,
      500,
      Date.now() - startTime,
    );
    return jsonResponse(ApiResponse.internalError(), 500);
  }
}
