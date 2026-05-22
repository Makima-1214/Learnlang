import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse, jsonResponse } from "@/lib/api-response";
import { apiLogger } from "@/lib/logger";
import { limiters, getRateLimitKey } from "@/lib/ratelimit";

/**
 * GET /api/activities
 * Get activity feed for logged in user and their friends
 */
export async function GET(req) {
  const startTime = Date.now();
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return jsonResponse(ApiResponse.unauthorized(), 401);
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = 20;
    const skip = (page - 1) * pageSize;

    const userId = session.user.id;

    // Get all friend IDs
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [{ initiatorId: userId }, { friendId: userId }],
      },
    });

    const friendIds = friendships.map((f) =>
      f.initiatorId === userId ? f.friendId : f.initiatorId,
    );
    friendIds.push(userId); // Include own activities

    // Get activities from user and friends
    const activities = await prisma.activity.findMany({
      where: {
        userId: {
          in: friendIds,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    });

    const total = await prisma.activity.count({
      where: {
        userId: {
          in: friendIds,
        },
      },
    });

    const duration = Date.now() - startTime;
    apiLogger.logApiRequest("GET", "/api/activities", 200, duration);

    return jsonResponse(
      ApiResponse.success({
        activities,
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
    console.error("Get activities error:", error);
    apiLogger.logApiRequest(
      "GET",
      "/api/activities",
      500,
      Date.now() - startTime,
    );
    return jsonResponse(ApiResponse.internalError(), 500);
  }
}
