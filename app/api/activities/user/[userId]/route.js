import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse, jsonResponse } from "@/lib/api-response";
import { apiLogger } from "@/lib/logger";
import { limiters, getRateLimitKey } from "@/lib/ratelimit";

/**
 * GET /api/activities/user/[userId]
 * Get activities for a specific user
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
    const pageSize = 20;
    const skip = (page - 1) * pageSize;

    const { userId } = await params;

    if (!userId) {
      return jsonResponse(
        ApiResponse.validationError(["userId is required"]),
        400,
      );
    }

    // Get activities for specific user
    const activities = await prisma.activity.findMany({
      where: { userId },
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
      where: { userId },
    });

    const duration = Date.now() - startTime;
    apiLogger.logApiRequest(
      "GET",
      `/api/activities/user/[userId]`,
      200,
      duration,
    );

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
    console.error("Get user activities error:", error);
    apiLogger.logApiRequest(
      "GET",
      `/api/activities/user/[userId]`,
      500,
      Date.now() - startTime,
    );
    return jsonResponse(ApiResponse.internalError(), 500);
  }
}
