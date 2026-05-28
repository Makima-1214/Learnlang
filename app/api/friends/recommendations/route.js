import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse, jsonResponse } from "@/lib/api-response";
import { apiLogger } from "@/lib/logger";
import { limiters, getRateLimitKey } from "@/lib/ratelimit";

/**
 * GET /api/friends/recommendations
 * Get friend recommendations based on:
 * - Users who follow you (that you don't follow back)
 * - Users with similar interests
 * - Users your friends are following
 */
export async function GET(req) {
  const startTime = Date.now();
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return jsonResponse(ApiResponse.unauthorized(), 401);
    }

    const userId = session.user.id;
    const limit = 10;

    const [myFollowsAll, myFriends] = await Promise.all([
      prisma.follow.findMany({
        where: { followerId: userId },
        select: { followingId: true },
      }),
      prisma.friendship.findMany({
        where: {
          OR: [{ initiatorId: userId }, { friendId: userId }],
        },
      }),
    ]);

    const alreadyFollowingIds = new Set(myFollowsAll.map((f) => f.followingId));

    // Get users who follow you but you don't follow back
    const potentialFriends = await prisma.follow.findMany({
      where: {
        followingId: userId, // People who follow me
      },
      include: {
        follower: {
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            bio: true,
          },
        },
      },
      take: limit,
    });

    const friendIds = new Set(
      myFriends.flatMap((f) =>
        f.initiatorId === userId ? [f.friendId] : [f.initiatorId],
      ),
    );

    const excludedIds = new Set([userId, ...alreadyFollowingIds, ...friendIds]);

    // Get users your friends are following (for recommendations)
    const friendFollowingIds = Array.from(friendIds);

    const friendFollowRows = friendFollowingIds.length
      ? await prisma.follow.findMany({
          where: {
            followerId: {
              in: friendFollowingIds,
            },
          },
          include: {
            following: {
              select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
                bio: true,
              },
            },
          },
        })
      : [];

    // Combine and deduplicate recommendations
    const recommendations = new Map();

    const addRecommendation = (user, reason, priority) => {
      if (!user || excludedIds.has(user.id) || recommendations.has(user.id)) {
        return;
      }

      recommendations.set(user.id, {
        ...user,
        reason,
        priority,
      });
    };

    // Add followers first (priority 1)
    potentialFriends.forEach((f) => {
      addRecommendation(f.follower, "follows you", 1);
    });

    // Add friends of friends (priority 2)
    friendFollowRows.forEach((f) => {
      addRecommendation(f.following, "mutual friends follow them", 2);
    });

    const finalRecommendations = Array.from(recommendations.values())
      .map((u) => ({
        ...u,
        isFollowing: excludedIds.has(u.id),
        isFriend: friendIds.has(u.id),
      }))
      .sort((a, b) => a.priority - b.priority)
      .filter((u) => !excludedIds.has(u.id))
      .slice(0, 10);

    // Fallback: if social graph is sparse, recommend other users the current user
    // doesn't already follow or befriend.
    if (finalRecommendations.length < limit) {
      const fallbackExcludedIds = new Set([
        ...Array.from(excludedIds),
        ...finalRecommendations.map((u) => u.id),
      ]);

      const fallbackUsers = await prisma.user.findMany({
        where: {
          id: {
            notIn: Array.from(fallbackExcludedIds),
          },
        },
        select: {
          id: true,
          name: true,
          username: true,
          avatar: true,
          bio: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: limit - finalRecommendations.length,
      });

      fallbackUsers.forEach((u) => {
        finalRecommendations.push({
          ...u,
          reason: "user lain di LernLang",
          priority: 3,
          isFollowing: false,
          isFriend: false,
        });
      });
    }

    const duration = Date.now() - startTime;
    apiLogger.logApiRequest(
      "GET",
      "/api/friends/recommendations",
      200,
      duration,
    );

    return jsonResponse(
      ApiResponse.success({
        recommendations: finalRecommendations,
      }),
      200,
    );
  } catch (error) {
    console.error("Recommendations error:", error);
    apiLogger.logApiRequest(
      "GET",
      "/api/friends/recommendations",
      500,
      Date.now() - startTime,
    );
    return jsonResponse(ApiResponse.internalError(), 500);
  }
}
