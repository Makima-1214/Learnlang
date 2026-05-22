import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse, jsonResponse } from "@/lib/api-response";
import { schemas } from "@/lib/validation";
import { apiLogger } from "@/lib/logger";
import { limiters, getRateLimitKey } from "@/lib/ratelimit";

/**
 * POST /api/friends/block
 * Block a user - prevent them from following or messaging
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
      return jsonResponse(ApiResponse.error("Cannot block yourself"), 400);
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: followingId },
    });

    if (!targetUser) {
      return jsonResponse(ApiResponse.notFound("User not found"), 404);
    }

    // Check if already blocked
    const existingBlock = await prisma.blockedUser.findUnique({
      where: {
        blockerId_blockedId: {
          blockerId: userId,
          blockedId: followingId,
        },
      },
    });

    if (existingBlock) {
      return jsonResponse(ApiResponse.error("User already blocked"), 400);
    }

    // Block user
    const blocked = await prisma.blockedUser.create({
      data: {
        blockerId: userId,
        blockedId: followingId,
        reason: data.reason || null,
      },
    });

    // Remove follow relationships
    await prisma.follow.deleteMany({
      where: {
        OR: [
          { followerId: userId, followingId: followingId },
          { followerId: followingId, followingId: userId },
        ],
      },
    });

    // Remove friendship
    const [id1, id2] =
      userId < followingId ? [userId, followingId] : [followingId, userId];

    await prisma.friendship.deleteMany({
      where: {
        initiatorId: id1,
        friendId: id2,
      },
    });

    // Delete pending friend requests
    await prisma.friendRequest.deleteMany({
      where: {
        OR: [
          { senderId: userId, receiverId: followingId },
          { senderId: followingId, receiverId: userId },
        ],
      },
    });

    const duration = Date.now() - startTime;
    apiLogger.logApiRequest("POST", "/api/friends/block", 200, duration);

    return jsonResponse(
      ApiResponse.success({
        blocked,
        message: "User blocked successfully",
      }),
      200,
    );
  } catch (error) {
    console.error("Block user error:", error);
    apiLogger.logApiRequest(
      "POST",
      "/api/friends/block",
      500,
      Date.now() - startTime,
    );
    return jsonResponse(ApiResponse.internalError(), 500);
  }
}

/**
 * GET /api/friends/block
 * Get list of blocked users
 */
export async function GET(req) {
  const startTime = Date.now();
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return jsonResponse(ApiResponse.unauthorized(), 401);
    }

    const userId = session.user.id;

    const blocked = await prisma.blockedUser.findMany({
      where: { blockerId: userId },
      include: {
        blocked: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
      },
    });

    const duration = Date.now() - startTime;
    apiLogger.logApiRequest("GET", "/api/friends/block", 200, duration);

    return jsonResponse(
      ApiResponse.success({
        blocked: blocked.map((b) => ({
          ...b.blocked,
          blockedAt: b.createdAt,
          reason: b.reason,
        })),
        count: blocked.length,
      }),
      200,
    );
  } catch (error) {
    console.error("Get blocked users error:", error);
    apiLogger.logApiRequest(
      "GET",
      "/api/friends/block",
      500,
      Date.now() - startTime,
    );
    return jsonResponse(ApiResponse.internalError(), 500);
  }
}
