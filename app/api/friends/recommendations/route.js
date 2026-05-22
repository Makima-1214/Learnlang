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

    // Get users I already follow (must be excluded from recommendations)
    const myFollowsAll = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });
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

    // Get your friends
    const myFriends = await prisma.friendship.findMany({
      where: {
        OR: [{ initiatorId: userId }, { friendId: userId }],
      },
    });

    const friendIds = new Set(
      myFriends.flatMap((f) =>
        f.initiatorId === userId ? [f.friendId] : [f.initiatorId],
      ),
    );

    // Get users your friends are following (for recommendations)
    const friendFollows = await prisma.follow.findMany({
      where: {
        followerId: {
          in: Array.from(friendIds),
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
    });

    // Combine and deduplicate recommendations
    const recommendations = new Map();

    // Add followers first (priority 1)
    potentialFriends.forEach((f) => {
      if (
        f.follower.id !== userId &&
        !friendIds.has(f.follower.id) &&
        !alreadyFollowingIds.has(f.follower.id)
      ) {
        recommendations.set(f.follower.id, {
          ...f.follower,
          reason: "follows you",
          priority: 1,
        });
      }
    });

    // Add friends of friends (priority 2)
    friendFollows.forEach((f) => {
      if (
        f.following.id !== userId &&
        !friendIds.has(f.following.id) &&
        !alreadyFollowingIds.has(f.following.id) &&
        !recommendations.has(f.following.id)
      ) {
        recommendations.set(f.following.id, {
          ...f.following,
          reason: "mutual friends follow them",
          priority: 2,
        });
      }
    });

    // Get current follow status (for safety + metadata on returned users)
    const myFollows = await prisma.follow.findMany({
      where: {
        followerId: userId,
        followingId: {
          in: Array.from(recommendations.keys()),
        },
      },
    });

    const followingIds = new Set(myFollows.map((f) => f.followingId));

    const finalRecommendations = Array.from(recommendations.values())
      .map((u) => ({
        ...u,
        isFollowing: followingIds.has(u.id),
        isFriend: friendIds.has(u.id),
      }))
      .sort((a, b) => a.priority - b.priority)
      .filter((u) => !u.isFollowing && !u.isFriend)
      .slice(0, 10);

    // Fallback: if social graph is sparse, recommend other users the current user
    // doesn't already follow or befriend.
    if (finalRecommendations.length < limit) {
      const excludedIds = new Set([
        userId,
        ...friendIds,
        ...followingIds,
        ...finalRecommendations.map((u) => u.id),
      ]);

      const fallbackUsers = await prisma.user.findMany({
        where: {
          id: {
            notIn: Array.from(excludedIds),
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
          isFollowing: followingIds.has(u.id),
          isFriend: friendIds.has(u.id),
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
