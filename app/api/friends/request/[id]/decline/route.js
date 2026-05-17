import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse, jsonResponse } from "@/lib/api-response";
import { apiLogger } from "@/lib/logger";
import { limiters, getRateLimitKey } from "@/lib/ratelimit";

/**
 * DELETE /api/friends/request/[id]/decline
 * Decline a friend request
 */
export async function DELETE(req, { params }) {
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

    const userId = session.user.id;
    const { id: requestId } = await params;

    // Get friend request
    const friendRequest = await prisma.friendRequest.findUnique({
      where: { id: requestId },
    });

    if (!friendRequest) {
      return jsonResponse(
        ApiResponse.notFound("Friend request not found"),
        404,
      );
    }

    // Check if user is the receiver
    if (friendRequest.receiverId !== userId) {
      return jsonResponse(ApiResponse.forbidden("Not your request"), 403);
    }

    if (friendRequest.status !== "PENDING") {
      return jsonResponse(ApiResponse.error("Request already responded"), 400);
    }

    // Decline request
    await prisma.friendRequest.update({
      where: { id: requestId },
      data: {
        status: "DECLINED",
        respondedAt: new Date(),
      },
    });

    const duration = Date.now() - startTime;
    apiLogger.logApiRequest(
      "DELETE",
      `/api/friends/request/[id]/decline`,
      200,
      duration,
    );

    return jsonResponse(
      ApiResponse.success({ message: "Friend request declined" }),
      200,
    );
  } catch (error) {
    console.error("Decline request error:", error);
    apiLogger.logApiRequest(
      "DELETE",
      `/api/friends/request/[id]/decline`,
      500,
      Date.now() - startTime,
    );
    return jsonResponse(ApiResponse.internalError(), 500);
  }
}
