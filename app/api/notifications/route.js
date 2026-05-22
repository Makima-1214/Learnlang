import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse, jsonResponse } from "@/lib/api-response";
import { apiLogger } from "@/lib/logger";

/**
 * GET /api/notifications - list notifications for current user
 * PATCH /api/notifications - mark notifications as read
 */
export async function GET(req) {
  const start = Date.now();
  try {
    const session = await getServerSession(authOptions);
    if (!session) return jsonResponse(ApiResponse.unauthorized(), 401);

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = 30;
    const skip = (page - 1) * pageSize;

    const notifications = await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    });

    const total = await prisma.notification.count({
      where: { userId: session.user.id },
    });

    apiLogger.logApiRequest(
      "GET",
      "/api/notifications",
      200,
      Date.now() - start,
    );
    return jsonResponse(
      ApiResponse.success({
        notifications,
        pagination: { page, pageSize, total },
      }),
      200,
    );
  } catch (err) {
    console.error("Notifications GET error:", err);
    apiLogger.logApiRequest(
      "GET",
      "/api/notifications",
      500,
      Date.now() - start,
    );
    return jsonResponse(ApiResponse.internalError(), 500);
  }
}

export async function PATCH(req) {
  const start = Date.now();
  try {
    const session = await getServerSession(authOptions);
    if (!session) return jsonResponse(ApiResponse.unauthorized(), 401);

    const body = await req.json();
    const { ids, markAll } = body;

    if (markAll) {
      await prisma.notification.updateMany({
        where: { userId: session.user.id, isRead: false },
        data: { isRead: true },
      });
    } else if (Array.isArray(ids) && ids.length > 0) {
      await prisma.notification.updateMany({
        where: { id: { in: ids }, userId: session.user.id },
        data: { isRead: true },
      });
    } else {
      return jsonResponse(
        ApiResponse.validationError(["ids or markAll required"]),
        400,
      );
    }

    apiLogger.logApiRequest(
      "PATCH",
      "/api/notifications",
      200,
      Date.now() - start,
    );
    return jsonResponse(
      ApiResponse.success({ message: "Marked as read" }),
      200,
    );
  } catch (err) {
    console.error("Notifications PATCH error:", err);
    apiLogger.logApiRequest(
      "PATCH",
      "/api/notifications",
      500,
      Date.now() - start,
    );
    return jsonResponse(ApiResponse.internalError(), 500);
  }
}
