/**
 * GET /api/leaderboard
 * Returns top users by XP (achievement points)
 * Includes current user's ranking
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonResponse } from "@/lib/api-response";
import { calculateTotalXP } from "@/lib/streak";
import { apiLogger } from "@/lib/logger";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return jsonResponse(
        { error: "Unauthorized" },
        401,
        "User not authenticated"
      );
    }

    const userId = session.id;
    const limit = Math.min(parseInt(req.nextUrl.searchParams.get("limit")) || 10, 100);

    // Get all users with their total XP
    // We'll calculate total XP per user from achievements
    const users = await prisma.user.findMany({
      where: {
        role: "USER", // Exclude admins
      },
      select: {
        id: true,
        name: true,
        username: true,
        avatar: true,
        createdAt: true,
        achievements: {
          select: {
            points: true,
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
      take: 1000, // Get top 1000 to calculate XP
    });

    // Calculate total XP for each user and create leaderboard
    const leaderboard = users
      .map((user) => ({
        id: user.id,
        name: user.name,
        username: user.username,
        avatar: user.avatar,
        totalXP: user.achievements.reduce((sum, ach) => sum + ach.points, 0),
      }))
      .sort((a, b) => b.totalXP - a.totalXP)
      .slice(0, limit);

    // Add rank to each user
    leaderboard.forEach((user, index) => {
      user.rank = index + 1;
    });

    // Find current user's rank
    const currentUserRank = leaderboard.find((u) => u.id === userId);
    const fullRank = users
      .map((user) => ({
        id: user.id,
        totalXP: user.achievements.reduce((sum, ach) => sum + ach.points, 0),
      }))
      .sort((a, b) => b.totalXP - a.totalXP)
      .findIndex((u) => u.id === userId) + 1;

    return jsonResponse(
      {
        success: true,
        leaderboard,
        currentUserRank: currentUserRank || { rank: fullRank, totalXP: 0 },
        totalUsers: users.length,
      },
      200,
      "Leaderboard retrieved"
    );
  } catch (error) {
    apiLogger.error("Error getting leaderboard:", {
      error: error.message,
      stack: error.stack,
    });
    return jsonResponse({ error: error.message }, 500);
  }
}
