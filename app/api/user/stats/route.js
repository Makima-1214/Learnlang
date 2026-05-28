/**
 * GET /api/user/stats
 * Returns current user's stats: streak, total XP, achievement count, etc.
 */

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonResponse } from "@/lib/api-response";
import { calculateStreak, calculateTotalXP } from "@/lib/streak";
import { getUserEnergy } from "@/lib/energy";
import { apiLogger } from "@/lib/logger";
import {
  computeLevelFromXP,
  computeTierLabelFromXP,
  getNextTierProgress,
} from "@/lib/tiers";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return jsonResponse(
        { error: "Unauthorized" },
        401,
        "User not authenticated",
      );
    }

    const userId = session.user.id;

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

    // Calculate energy state from persistent storage
    const energy = await getUserEnergy(userId, { emit: false });

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

    // Compute user tier/league info from XP
    const currentLevel = computeLevelFromXP(totalXP);
    const currentTier = computeTierLabelFromXP(totalXP);
    const tierProgress = getNextTierProgress(totalXP);

    return jsonResponse(
      {
        success: true,
        stats: {
          userId,
          streak,
          totalXP,
          exp: totalXP,
          achievementCount,
          sessionCount,
          currentLevel,
          currentTier,
          tierProgress,
          primaryTier: `${currentLevel} • ${currentTier}`,
          energy,
          lastSessionDate,
          user: {
            name: user.name,
            username: user.username,
            avatar: user.avatar,
          },
        },
      },
      200,
      "User stats retrieved",
    );
  } catch (error) {
    apiLogger.error("Error getting user stats:", {
      error: error.message,
      stack: error.stack,
    });
    return jsonResponse({ error: error.message }, 500);
  }
}
