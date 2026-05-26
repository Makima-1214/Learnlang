/**
 * GET /api/friends/suggestions
 * Returns friend suggestions: users you don't follow, not friends with, not blocked
 */

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonResponse } from "@/lib/api-response";
import { apiLogger } from "@/lib/logger";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const userId = session.user.id;
    const limit = Math.min(
      parseInt(req.nextUrl.searchParams.get("limit")) || 5,
      20,
    );

    // Get all users you're already connected to (following, friends with, blocked)
    const [following, friendships, blockedByMe, blocking] = await Promise.all([
      prisma.follow.findMany({
        where: { followerId: userId },
        select: { followingId: true },
      }),
      prisma.friendship.findMany({
        where: {
          OR: [{ initiatorId: userId }, { friendId: userId }],
        },
        select: { initiatorId: true, friendId: true },
      }),
      prisma.blockedUser.findMany({
        where: { blockerId: userId },
        select: { blockedId: true },
      }),
      prisma.blockedUser.findMany({
        where: { blockedId: userId },
        select: { blockerId: true },
      }),
    ]);

    // Get all user IDs to exclude
    const excludeArray = [
      userId,
      ...following.map((f) => f.followingId).filter(Boolean),
      ...friendships
        .map((f) => (f.initiatorId === userId ? f.friendId : f.initiatorId))
        .filter(Boolean),
      ...blockedByMe.map((b) => b.blockedId).filter(Boolean),
      ...blocking.map((b) => b.blockerId).filter(Boolean),
    ];

    const excludeIds = new Set(excludeArray);

    // Get random suggestions from users not in the exclude set
    const suggestions = await prisma.user.findMany({
      where: {
        id: {
          notIn: Array.from(excludeIds).filter(Boolean),
        },
        role: "USER",
      },
      select: {
        id: true,
        name: true,
        username: true,
        avatar: true,
        bio: true,
        achievements: {
          select: {
            points: true,
          },
        },
      },
      take: limit * 2, // Get more to randomize
    });

    // Calculate XP and randomize
    const withXP = suggestions
      .map((u) => ({
        id: u.id,
        name: u.name,
        username: u.username,
        avatar: u.avatar,
        bio: u.bio,
        totalXP: u.achievements.reduce((sum, ach) => sum + ach.points, 0),
      }))
      .sort(() => Math.random() - 0.5)
      .slice(0, limit);

    return jsonResponse(
      {
        success: true,
        suggestions: withXP,
      },
      200,
      "Friend suggestions retrieved",
    );
  } catch (error) {
    apiLogger.error("Error getting friend suggestions:", {
      error: error.message,
      stack: error.stack,
    });
    return jsonResponse({ error: error.message }, 500);
  }
}
