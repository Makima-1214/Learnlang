/**
 * Streak calculation utility
 * Calculates learning streaks based on consecutive days with completed sessions
 */

import { prisma } from "@/lib/prisma";
import { apiLogger } from "@/lib/logger";

/**
 * Calculate current learning streak for a user
 * A streak is consecutive days (based on completedAt) with at least one completed session
 * 
 * @param {string} userId - User ID
 * @returns {Promise<{streak: number, lastSessionDate: Date|null}>}
 */
export async function calculateStreak(userId) {
  if (!userId) {
    throw new Error("userId is required");
  }

  try {
    // Get all completed sessions ordered by date (newest first)
    const sessions = await prisma.learningSession.findMany({
      where: {
        userId,
        completedAt: {
          not: null,
        },
      },
      select: {
        completedAt: true,
      },
      orderBy: {
        completedAt: "desc",
      },
    });

    if (sessions.length === 0) {
      return { streak: 0, lastSessionDate: null };
    }

    // Get dates (normalize to UTC date only)
    const dates = sessions.map((s) => {
      const date = new Date(s.completedAt);
      return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
    });

    // Remove duplicates from same day
    const uniqueDates = [];
    const seen = new Set();
    for (const date of dates) {
      const key = date.toISOString().split("T")[0];
      if (!seen.has(key)) {
        seen.add(key);
        uniqueDates.push(date);
      }
    }

    // Calculate streak from most recent date
    let streak = 0;
    let currentDate = new Date();
    currentDate = new Date(
      currentDate.getUTCFullYear(),
      currentDate.getUTCMonth(),
      currentDate.getUTCDate()
    );

    for (const date of uniqueDates) {
      // Calculate difference in days
      const diffMs = currentDate.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      // If the difference is exactly the streak number, add to streak
      if (diffDays === streak) {
        streak++;
      } else {
        // Streak broken
        break;
      }
    }

    // If streak is 0, check if there was a session today
    if (streak === 0 && uniqueDates.length > 0) {
      const diffMs = currentDate.getTime() - uniqueDates[0].getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays === 0) {
        streak = 1;
      }
    }

    return {
      streak,
      lastSessionDate: sessions[0].completedAt,
    };
  } catch (error) {
    apiLogger.error("Error calculating streak:", {
      userId,
      error: error.message,
    });
    throw error;
  }
}

/**
 * Calculate total XP for a user from achievements
 * 
 * @param {string} userId - User ID
 * @returns {Promise<number>}
 */
export async function calculateTotalXP(userId) {
  if (!userId) {
    throw new Error("userId is required");
  }

  try {
    const result = await prisma.achievement.aggregate({
      where: { userId },
      _sum: {
        points: true,
      },
    });

    return result._sum.points || 0;
  } catch (error) {
    apiLogger.error("Error calculating total XP:", {
      userId,
      error: error.message,
    });
    throw error;
  }
}

/**
 * Check if user maintained streak today
 * 
 * @param {string} userId - User ID
 * @returns {Promise<boolean>}
 */
export async function hasSessionToday(userId) {
  if (!userId) {
    throw new Error("userId is required");
  }

  try {
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

    const session = await prisma.learningSession.findFirst({
      where: {
        userId,
        completedAt: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
    });

    return !!session;
  } catch (error) {
    apiLogger.error("Error checking session today:", {
      userId,
      error: error.message,
    });
    throw error;
  }
}
