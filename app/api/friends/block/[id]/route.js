import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse, jsonResponse } from "@/lib/api-response";
import { apiLogger } from "@/lib/logger";
import { limiters, getRateLimitKey } from "@/lib/ratelimit";

/**
 * DELETE /api/friends/block?blockedId=user-id
 * Unblock a user
 */
export async function DELETE(req) {
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

    const { searchParams } = new URL(req.url);
    const blockedId = searchParams.get("blockedId");
    const userId = session.user.id;

    if (!blockedId) {
      return jsonResponse(
        ApiResponse.validationError(["blockedId is required"]),
        400,
      );
    }

    // Delete block
    const result = await prisma.blockedUser.deleteMany({
      where: {
        blockerId: userId,
        blockedId: blockedId,
      },
    });

    if (result.count === 0) {
      return jsonResponse(ApiResponse.error("User not blocked"), 400);
    }

    const duration = Date.now() - startTime;
    apiLogger.logApiRequest("DELETE", "/api/friends/block", 200, duration);

    return jsonResponse(
      ApiResponse.success({ message: "User unblocked successfully" }),
      200,
    );
  } catch (error) {
    console.error("Unblock user error:", error);
    apiLogger.logApiRequest(
      "DELETE",
      "/api/friends/block",
      500,
      Date.now() - startTime,
    );
    return jsonResponse(ApiResponse.internalError(), 500);
  }
}
