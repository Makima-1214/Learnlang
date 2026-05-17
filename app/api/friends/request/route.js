import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse, jsonResponse } from "@/lib/api-response";
import { schemas } from "@/lib/validation";
import { apiLogger } from "@/lib/logger";
import { limiters, getRateLimitKey } from "@/lib/ratelimit";
import { emitNewFriendRequest, emitNewNotification } from "@/lib/socket";

/**
 * POST /api/friends/request
 * Send a friend request instead of auto-follow
 */
export async function POST(req) {
  const startTime = Date.now();
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return jsonResponse(ApiResponse.unauthorized(), 401);
    }

    const key = getRateLimitKey(session.user.id);
    if (!limiters.create.isAllowed(key)) {
      apiLogger.logRateLimit(session.user.id, "friend_request");
      return jsonResponse(ApiResponse.rateLimit(), 429);
    }
    limiters.create.increment(key);

    const data = await req.json();
    const validation = schemas.followSchema(data);
    if (!validation.valid) {
      return jsonResponse(ApiResponse.validationError(validation.errors), 400);
    }

    const { followingId } = data;
    const userId = session.user.id;

    if (userId === followingId) {
      return jsonResponse(
        ApiResponse.error("Cannot send friend request to yourself"),
        400,
      );
    }

    // Check if user is blocked
    const isBlocked = await prisma.blockedUser.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId: followingId,
          blockedId: userId,
        },
      },
    });

    if (isBlocked) {
      return jsonResponse(ApiResponse.error("This user has blocked you"), 403);
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: followingId },
    });

    if (!targetUser) {
      return jsonResponse(ApiResponse.notFound("User not found"), 404);
    }

    // Check if request already exists
    const existingRequest = await prisma.friendRequest.findUnique({
      where: {
        senderId_receiverId: {
          senderId: userId,
          receiverId: followingId,
        },
      },
    });

    if (existingRequest) {
      if (existingRequest.status === "PENDING") {
        return jsonResponse(
          ApiResponse.error("Friend request already sent"),
          400,
        );
      }
    }

    // Create friend request
    const friendRequest = await prisma.friendRequest.create({
      data: {
        senderId: userId,
        receiverId: followingId,
      },
    });

    // Create activity for receiver
    await prisma.activity.create({
      data: {
        userId: followingId,
        type: "FRIEND_ADDED",
        title: `${session.user.name} mengirim permintaan pertemanan`,
        description: `${session.user.name} ingin menjadi teman anda`,
      },
    });

    // Persist notification for receiver
    const notification = await prisma.notification.create({
      data: {
        userId: followingId,
        title: "Permintaan Pertemanan",
        description: `${session.user.name} mengirim permintaan pertemanan`,
        icon: "users",
        metadata: JSON.stringify({
          requestId: friendRequest.id,
          senderId: userId,
        }),
      },
    });

    // Fetch sender basic info for notification
    const sender = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, username: true, avatar: true },
    });

    try {
      emitNewFriendRequest(followingId, {
        id: friendRequest.id,
        sender,
        status: friendRequest.status,
        createdAt: friendRequest.createdAt,
      });
    } catch (err) {
      console.error("Emit friend request error:", err);
    }

    try {
      emitNewNotification(followingId, {
        id: notification.id,
        title: notification.title,
        description: notification.description,
        icon: notification.icon,
        createdAt: notification.createdAt,
      });
    } catch (err) {
      console.error("Emit friend request error:", err);
    }

    const duration = Date.now() - startTime;
    apiLogger.logApiRequest("POST", "/api/friends/request", 200, duration);

    return jsonResponse(
      ApiResponse.success({
        friendRequest,
        message: "Friend request sent",
      }),
      200,
    );
  } catch (error) {
    console.error("Friend request error:", error);
    apiLogger.logApiRequest(
      "POST",
      "/api/friends/request",
      500,
      Date.now() - startTime,
    );
    return jsonResponse(ApiResponse.internalError(), 500);
  }
}

/**
 * GET /api/friends/request
 * Get pending friend requests
 */
export async function GET(req) {
  const startTime = Date.now();
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return jsonResponse(ApiResponse.unauthorized(), 401);
    }

    const userId = session.user.id;

    // Get pending friend requests
    const requests = await prisma.friendRequest.findMany({
      where: {
        receiverId: userId,
        status: "PENDING",
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            bio: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const duration = Date.now() - startTime;
    apiLogger.logApiRequest("GET", "/api/friends/request", 200, duration);

    return jsonResponse(
      ApiResponse.success({
        requests,
        count: requests.length,
      }),
      200,
    );
  } catch (error) {
    console.error("Get requests error:", error);
    apiLogger.logApiRequest(
      "GET",
      "/api/friends/request",
      500,
      Date.now() - startTime,
    );
    return jsonResponse(ApiResponse.internalError(), 500);
  }
}
