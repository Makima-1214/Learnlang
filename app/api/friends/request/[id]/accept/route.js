import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse, jsonResponse } from "@/lib/api-response";
import { apiLogger } from "@/lib/logger";
import { limiters, getRateLimitKey } from "@/lib/ratelimit";
import { getIO } from "@/lib/socket";
import { emitNewNotification } from "@/lib/socket";

/**
 * POST /api/friends/request/[id]/accept
 * Accept a friend request
 */
export async function POST(req, { params }) {
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
      include: { sender: true, receiver: true },
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

    // Accept request
    const updated = await prisma.friendRequest.update({
      where: { id: requestId },
      data: {
        status: "ACCEPTED",
        respondedAt: new Date(),
      },
    });

    // Create mutual follow
    await prisma.follow.upsert({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: friendRequest.senderId,
        },
      },
      create: {
        followerId: userId,
        followingId: friendRequest.senderId,
      },
      update: {},
    });

    // Create friendship
    const [id1, id2] =
      userId < friendRequest.senderId
        ? [userId, friendRequest.senderId]
        : [friendRequest.senderId, userId];

    await prisma.friendship.upsert({
      where: {
        initiatorId_friendId: {
          initiatorId: id1,
          friendId: id2,
        },
      },
      create: {
        initiatorId: id1,
        friendId: id2,
      },
      update: {},
    });

    // Create activity for sender
    await prisma.activity.create({
      data: {
        userId: friendRequest.senderId,
        type: "FRIEND_ACCEPTED",
        title: `${session.user.name} menerima permintaan pertemanan`,
        description: `Anda sekarang teman dengan ${session.user.name}`,
      },
    });

    // Create notification for sender
    const notification = await prisma.notification.create({
      data: {
        userId: friendRequest.senderId,
        title: "Permintaan Pertemanan Diterima",
        description: `${session.user.name} telah menerima permintaan pertemanan Anda`,
        icon: "👋",
        link: `/friends`,
        isRead: false,
      },
    });

    // Emit notification via socket
    try {
      emitNewNotification(friendRequest.senderId, notification);
    } catch (err) {
      console.error("Failed to emit notification:", err);
    }

    const duration = Date.now() - startTime;
    apiLogger.logApiRequest(
      "POST",
      `/api/friends/request/[id]/accept`,
      200,
      duration,
    );

    return jsonResponse(
      ApiResponse.success({
        friendship: updated,
        message: "Friend request accepted",
      }),
      200,
    );
  } catch (error) {
    console.error("Accept request error:", error);
    apiLogger.logApiRequest(
      "POST",
      `/api/friends/request/[id]/accept`,
      500,
      Date.now() - startTime,
    );
    return jsonResponse(ApiResponse.internalError(), 500);
  }
}
