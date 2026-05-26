import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse, jsonResponse } from "@/lib/api-response";

/**
 * GET /api/leaderboard
 * Returns top users ranked by persisted XP totals.
 * Query params:
 *   limit  — number of users to return (default 20, max 100)
 *   offset — pagination offset (default 0)
 */
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");

    const [users, achievementGroups] = await Promise.all([
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          username: true,
          avatar: true,
          xp: true,
        },
      }),
      prisma.achievement.groupBy({
        by: ["userId"],
        _sum: { points: true },
        _count: { type: true },
      }),
    ]);

    const achievementMap = new Map(
      achievementGroups.map((item) => [item.userId, item]),
    );

    const rankedUsers = users
      .map((user) => {
        const achievement = achievementMap.get(user.id);
        const achievementCount = achievement?._count?.type ?? 0;

        return {
          id: user.id,
          name: user.name,
          username: user.username,
          avatar: user.avatar,
          totalXP: user.xp || 0,
          achievementCount,
        };
      })
      .sort((left, right) => {
        if (right.totalXP !== left.totalXP) return right.totalXP - left.totalXP;
        if (right.achievementCount !== left.achievementCount) {
          return right.achievementCount - left.achievementCount;
        }
        return left.name.localeCompare(right.name);
      });

    const leaderboard = rankedUsers
      .slice(offset, offset + limit)
      .map((user, index) => ({
        rank: offset + index + 1,
        ...user,
      }));

    // Find current user's rank if logged in
    let currentUserRank = null;
    if (session?.user?.id) {
      const userId = session.user.id;
      const rankIndex = rankedUsers.findIndex((item) => item.id === userId);
      if (rankIndex >= 0) {
        currentUserRank = {
          rank: rankIndex + 1,
          ...rankedUsers[rankIndex],
        };
      } else {
        const myUser = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
            xp: true,
          },
        });
        const myXP = myUser?.xp || 0;
        currentUserRank = {
          rank: rankedUsers.filter((item) => item.totalXP > myXP).length + 1,
          id: userId,
          name: session.user.name,
          username: session.user.username || null,
          avatar: session.user.avatar || null,
          totalXP: myXP,
          achievementCount: 0,
        };
      }
    }

    return jsonResponse(
      ApiResponse.success({ leaderboard, currentUserRank }),
      200,
    );
  } catch (error) {
    console.error("Leaderboard error:", error);
    return jsonResponse(ApiResponse.internalError(), 500);
  }
}
