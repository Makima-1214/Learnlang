import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse, jsonResponse } from "@/lib/api-response";
import { apiLogger } from "@/lib/logger";
import { limiters, getRateLimitKey } from "@/lib/ratelimit";

/**
 * DELETE /api/friends/unfollow
 * Unfollow a user and remove friendship if existed
 */
export async function DELETE(req) {
  const startTime = Date.now();
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return jsonResponse(ApiResponse.unauthorized(), 401);
    }

    // Rate limiting
    const key = getRateLimitKey(session.user.id);
    if (!limiters.create.isAllowed(key)) {
      apiLogger.logRateLimit(session.user.id, "unfollow");
      return jsonResponse(ApiResponse.rateLimit(), 429);
    }
    limiters.create.increment(key);

    const { searchParams } = new URL(req.url);
    const followingId = searchParams.get("followingId");
    const userId = session.user.id;

    if (!followingId) {
      return jsonResponse(
        ApiResponse.validationError(["followingId is required"]),
        400,
      );
    }

    // Delete follow record
    const follow = await prisma.follow.deleteMany({
      where: {
        followerId: userId,
        followingId: followingId,
      },
    });

    if (follow.count === 0) {
      return jsonResponse(ApiResponse.error("Not following this user"), 400);
    }

    // Check and remove friendship if exists
    await prisma.friendship.deleteMany({
      where: {
        OR: [
          {
            initiatorId: userId < followingId ? userId : followingId,
            friendId: userId > followingId ? userId : followingId,
          },
          {
            initiatorId: userId > followingId ? userId : followingId,
            friendId: userId < followingId ? userId : followingId,
          },
        ],
      },
    });

    const duration = Date.now() - startTime;
    apiLogger.logApiRequest("DELETE", "/api/friends/unfollow", 200, duration);

    return jsonResponse(
      ApiResponse.success({ message: "Unfollowed successfully" }),
      200,
    );
  } catch (error) {
    apiLogger.logApiRequest(
      "DELETE",
      "/api/friends/unfollow",
      500,
      Date.now() - startTime,
    );
    return jsonResponse(ApiResponse.internalError(), 500);
  }
}
