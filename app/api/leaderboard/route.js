import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse, jsonResponse } from "@/lib/api-response";

/**
 * GET /api/leaderboard
 * Returns top users ranked by achievement XP points.
 * Query params:
 *   limit  — number of users to return (default 20, max 100)
 *   offset — pagination offset (default 0)
 */
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(req.url);
    const limit  = Math.min(parseInt(searchParams.get("limit")  || "20"), 100);
    const offset = parseInt(searchParams.get("offset") || "0");

    // Aggregate achievement points per user
    const aggregated = await prisma.achievement.groupBy({
      by: ["userId"],
      _sum: { points: true },
      _count: { type: true },
      orderBy: { _sum: { points: "desc" } },
      take: limit + (session ? 1 : 0), // fetch a bit extra to find current user
      skip: offset,
    });

    // Fetch user details for those IDs
    const userIds = aggregated.map((a) => a.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, username: true, avatar: true },
    });

    const userMap = Object.fromEntries(users.map((u) => [u.id, u]));

    const leaderboard = aggregated.map((a, idx) => ({
      rank: offset + idx + 1,
      id: a.userId,
      name: userMap[a.userId]?.name ?? "Unknown",
      username: userMap[a.userId]?.username ?? null,
      avatar: userMap[a.userId]?.avatar ?? null,
      totalXP: a._sum.points ?? 0,
      achievementCount: a._count.type ?? 0,
    }));

    // Find current user's rank if logged in
    let currentUserRank = null;
    if (session?.user?.id) {
      const userId = session.user.id;
      const inList = leaderboard.find((u) => u.id === userId);
      if (inList) {
        currentUserRank = inList;
      } else {
        // Count how many users have more XP
        const userAgg = await prisma.achievement.groupBy({
          by: ["userId"],
          _sum: { points: true },
          where: { userId },
        });
        const myXP = userAgg[0]?._sum?.points ?? 0;
        const ahead = await prisma.achievement.groupBy({
          by: ["userId"],
          _sum: { points: true },
          having: { points: { _sum: { gt: myXP } } },
        });
        currentUserRank = {
          rank: ahead.length + 1,
          id: userId,
          name: session.user.name,
          totalXP: myXP,
          achievementCount: userAgg[0]?._count?.type ?? 0,
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
