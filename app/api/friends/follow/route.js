import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse, jsonResponse } from "@/lib/api-response";
import { schemas } from "@/lib/validation";
import { apiLogger } from "@/lib/logger";
import { limiters, getRateLimitKey } from "@/lib/ratelimit";
import { createNotification, NotificationType } from "@/lib/notifications";

/**
 * POST /api/friends/follow
 * Follow a user - creates Follow record and checks for mutual friendship
 */
export async function POST(req) {
  const startTime = Date.now();
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return jsonResponse(ApiResponse.unauthorized(), 401);
    }

    // Rate limiting
    const key = getRateLimitKey(session.user.id);
    if (!limiters.create.isAllowed(key)) {
      apiLogger.logRateLimit(session.user.id, "follow");
      return jsonResponse(ApiResponse.rateLimit(), 429);
    }
    limiters.create.increment(key);

    const data = await req.json();

    // Validation
    const validation = schemas.followSchema(data);
    if (!validation.valid) {
      return jsonResponse(ApiResponse.validationError(validation.errors), 400);
    }

    const { followingId } = data;
    const userId = session.user.id;

    // Prevent self-follow
    if (userId === followingId) {
      return jsonResponse(ApiResponse.error("Cannot follow yourself"), 400);
    }

    // Check if user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: followingId },
    });

    if (!targetUser) {
      return jsonResponse(ApiResponse.notFound("User not found"), 404);
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: followingId,
        },
      },
    });

    if (existingFollow) {
      return jsonResponse(
        ApiResponse.error("Already following this user"),
        400,
      );
    }

    // Create follow record
    const follow = await prisma.follow.create({
      data: {
        followerId: userId,
        followingId: followingId,
      },
    });

    const follower = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, username: true, avatar: true },
    });

    // Create and emit follow notification
    await createNotification({
      userId: followingId,
      type: NotificationType.FOLLOW,
      title: "Follower Baru",
      description: `${follower?.name ?? "Seseorang"} mulai mengikuti Anda`,
      icon: "👤",
      link: `/user/${follower?.username || follower?.id}`,
      metadata: {
        followerId: userId,
        followId: follow.id,
      },
    });

    // Check for mutual follow (user follows me back?)
    const mutualFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: followingId,
          followingId: userId,
        },
      },
    });

    let isFriend = false;

    // If mutual, create friendship
    if (mutualFollow) {
      // Check if friendship already exists
      const existingFriendship = await prisma.friendship.findUnique({
        where: {
          initiatorId_friendId: {
            initiatorId: userId < followingId ? userId : followingId, // Keep consistent order
            friendId: userId > followingId ? userId : followingId,
          },
        },
      });

      if (!existingFriendship) {
        await prisma.friendship.create({
          data: {
            initiatorId: userId < followingId ? userId : followingId,
            friendId: userId > followingId ? userId : followingId,
          },
        });
      }
      isFriend = true;

      // Notify both users of new friendship
      await Promise.all([
        createNotification({
          userId,
          type: NotificationType.FRIEND_ADDED,
          title: "Teman Baru",
          description: `${targetUser.name} juga mengikuti Anda. Anda sekarang berteman!`,
          icon: "🤝",
          link: `/friends`,
          metadata: { friendId: followingId },
        }),
        createNotification({
          userId: followingId,
          type: NotificationType.FRIEND_ADDED,
          title: "Teman Baru",
          description: `${follower?.name ?? "Seseorang"} juga mengikuti Anda. Anda sekarang berteman!`,
          icon: "🤝",
          link: `/friends`,
          metadata: { friendId: userId },
        }),
      ]);
    }

    const duration = Date.now() - startTime;
    apiLogger.logApiRequest("POST", "/api/friends/follow", 200, duration);

    return jsonResponse(
      ApiResponse.success({
        follow,
        isFriend,
        message: isFriend ? "Friendship created!" : "Following user",
      }),
      200,
    );
  } catch (error) {
    apiLogger.logApiRequest(
      "POST",
      "/api/friends/follow",
      500,
      Date.now() - startTime,
    );
    return jsonResponse(ApiResponse.internalError(), 500);
  }
}
