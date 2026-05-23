/**
 * GET /api/user/stats
 * Returns current user's stats: streak, total XP, achievement count, etc.
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonResponse } from "@/lib/api-response";
import { calculateStreak, calculateTotalXP } from "@/lib/streak";
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

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        username: true,
        avatar: true,
      },
    });

    if (!user) {
      return jsonResponse({ error: "User not found" }, 404);
    }

    // Calculate streak
    const { streak, lastSessionDate } = await calculateStreak(userId);

    // Calculate total XP
    const totalXP = await calculateTotalXP(userId);

    // Count achievements
    const achievementCount = await prisma.achievement.count({
      where: { userId },
    });

    // Count total learning sessions
    const sessionCount = await prisma.learningSession.count({
      where: {
        userId,
        completedAt: { not: null },
      },
    });

    // Energy system (max 5 per day, resets at UTC midnight)
    // For now, implement simple system: max 5 energy, -1 per session, resets daily
    const today = new Date();
    const startOfDay = new Date(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate()
    );
    const endOfDay = new Date(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate() + 1
    );

    const sessionsToday = await prisma.learningSession.count({
      where: {
        userId,
        completedAt: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
    });

    const maxEnergy = 5;
    const currentEnergy = Math.max(0, maxEnergy - sessionsToday);

    return jsonResponse(
      {
        success: true,
        stats: {
          userId,
          streak,
          totalXP,
          achievementCount,
          sessionCount,
          energy: {
            current: currentEnergy,
            max: maxEnergy,
          },
          lastSessionDate,
          user: {
            name: user.name,
            username: user.username,
            avatar: user.avatar,
          },
        },
      },
      200,
      "User stats retrieved"
    );
  } catch (error) {
    apiLogger.error("Error getting user stats:", {
      error: error.message,
      stack: error.stack,
    });
    return jsonResponse({ error: error.message }, 500);
  }
}
