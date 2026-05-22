import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse, jsonResponse } from "@/lib/api-response";
import { schemas } from "@/lib/validation";
import { apiLogger } from "@/lib/logger";
import { limiters, getRateLimitKey } from "@/lib/ratelimit";

/**
 * GET /api/friends
 * Get user's friends or search for users
 * Query params:
 * - q: search query (name or username)
 * - type: "friends" | "followers" | "following" | "search"
 * - page: page number (default 1)
 */
export async function GET(req) {
  const startTime = Date.now();
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return jsonResponse(ApiResponse.unauthorized(), 401);
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const type = searchParams.get("type") || "search";
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = 20;
    const skip = (page - 1) * pageSize;

    const userId = session.user.id;
    let users = [];
    let total = 0;

    if (type === "friends") {
      // Get mutual friends
      const friendships = await prisma.friendship.findMany({
        where: {
          OR: [{ initiatorId: userId }, { friendId: userId }],
        },
        include: {
          initiator: true,
          friend: true,
        },
        skip,
        take: pageSize,
      });

      users = friendships.map((f) =>
        f.initiatorId === userId ? f.friend : f.initiator,
      );

      total = await prisma.friendship.count({
        where: {
          OR: [{ initiatorId: userId }, { friendId: userId }],
        },
      });
    } else if (type === "followers") {
      // Get followers
      const follows = await prisma.follow.findMany({
        where: { followingId: userId },
        include: { follower: true },
        skip,
        take: pageSize,
      });

      users = follows.map((f) => f.follower);

      total = await prisma.follow.count({
        where: { followingId: userId },
      });
    } else if (type === "following") {
      // Get following
      const follows = await prisma.follow.findMany({
        where: { followerId: userId },
        include: { following: true },
        skip,
        take: pageSize,
      });

      users = follows.map((f) => f.following);

      total = await prisma.follow.count({
        where: { followerId: userId },
      });
    } else {
      // Search users by name or username
      if (query.length < 2) {
        return jsonResponse(
          ApiResponse.validationError([
            "Search query must be at least 2 characters",
          ]),
          400,
        );
      }

      users = await prisma.user.findMany({
        where: {
          AND: [
            {
              id: { not: userId }, // Exclude self
            },
            {
              OR: [
                {
                  name: {
                    contains: query,
                  },
                },
                {
                  username: {
                    contains: query,
                  },
                },
              ],
            },
          ],
        },
        select: {
          id: true,
          name: true,
          username: true,
          avatar: true,
          bio: true,
        },
        skip,
        take: pageSize,
      });

      total = await prisma.user.count({
        where: {
          AND: [
            {
              id: { not: userId },
            },
            {
              OR: [
                {
                  name: {
                    contains: query,
                  },
                },
                {
                  username: {
                    contains: query,
                  },
                },
              ],
            },
          ],
        },
      });

      // Get follow status for each user
      const follows = await prisma.follow.findMany({
        where: {
          followerId: userId,
          followingId: {
            in: users.map((u) => u.id),
          },
        },
      });

      const followingIds = new Set(follows.map((f) => f.followingId));

      users = users.map((u) => ({
        ...u,
        isFollowing: followingIds.has(u.id),
      }));
    }

    // Get follow status and friendship status for each user
    const follow = await prisma.follow.findMany({
      where: {
        followerId: userId,
        followingId: {
          in: users.map((u) => u.id),
        },
      },
    });

    const followingIds = new Set(follow.map((f) => f.followingId));

    const friendships = await prisma.friendship.findMany({
      where: {
        OR: users.map((u) => ({
          OR: [
            {
              initiatorId: userId,
              friendId: u.id,
            },
            {
              initiatorId: u.id,
              friendId: userId,
            },
          ],
        })),
      },
    });

    const friendIds = new Set();
    friendships.forEach((f) => {
      friendIds.add(f.initiatorId === userId ? f.friendId : f.initiatorId);
    });

    const enrichedUsers = users.map((u) => ({
      ...u,
      isFollowing: followingIds.has(u.id),
      isFriend: friendIds.has(u.id),
    }));

    const duration = Date.now() - startTime;
    apiLogger.logApiRequest("GET", "/api/friends", 200, duration);

    return jsonResponse(
      ApiResponse.success({
        users: enrichedUsers,
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
    console.error("Friend list error:", error);
    apiLogger.logApiRequest("GET", "/api/friends", 500, Date.now() - startTime);
    return jsonResponse(ApiResponse.internalError(), 500);
  }
}
