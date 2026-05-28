/**
 * GET /api/daily-missions
 * Returns today's daily missions for the user
 * Initializes missions if they don't exist for today
 */

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { jsonResponse } from "@/lib/api-response";
import { apiLogger } from "@/lib/logger";

const DAILY_MISSIONS = [
  {
    type: "LEARN_15_MIN",
    title: "Belajar 15 Menit",
    description: "Selesaikan 15 menit pembelajaran",
    target: 15,
    reward: 10,
  },
  {
    type: "COMPLETE_QUIZ",
    title: "Kuis Hari Ini",
    description: "Selesaikan minimal 1 kuis",
    target: 1,
    reward: 15,
  },
  {
    type: "STREAK_MAINTAIN",
    title: "Jaga Streak",
    description: "Pertahankan streak belajar harimu",
    target: 1,
    reward: 20,
  },
];

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const userId = session.user.id;

    // Get today's date (UTC)
    const today = new Date();
    const startOfDay = new Date(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate(),
    );
    const endOfDay = new Date(
      today.getUTCFullYear(),
      today.getUTCMonth(),
      today.getUTCDate() + 1,
    );

    // Get or create today's missions
    let missions = await prisma.dailyMission.findMany({
      where: {
        userId,
        createdAt: {
          gte: startOfDay,
          lt: endOfDay,
        },
      },
    });

    // If no missions exist for today, create them
    if (missions.length === 0) {
      missions = await Promise.all(
        DAILY_MISSIONS.map((mission) =>
          prisma.dailyMission.create({
            data: {
              userId,
              type: mission.type,
              title: mission.title,
              description: mission.description,
              target: mission.target,
              reward: mission.reward,
              progress: 0,
            },
          }),
        ),
      );
    }

    // Calculate progress for each mission
    const missionsWithProgress = await Promise.all(
      missions.map(async (mission) => {
        let progress = mission.progress;

        // Update progress based on type
        if (mission.type === "LEARN_15_MIN") {
          // Count total minutes from learning sessions today
          const sessions = await prisma.learningSession.findMany({
            where: {
              userId,
              completedAt: {
                gte: startOfDay,
                lt: endOfDay,
              },
            },
            select: {
              total: true, // Assuming total is duration in minutes
            },
          });

          progress = sessions.reduce((sum, s) => sum + (s.total || 0), 0);
        } else if (mission.type === "COMPLETE_QUIZ") {
          // Count quiz results today
          const quizCount = await prisma.quizResult.count({
            where: {
              userId,
              completedAt: {
                gte: startOfDay,
                lt: endOfDay,
              },
            },
          });
          progress = quizCount;
        } else if (mission.type === "STREAK_MAINTAIN") {
          // Check if user has a session today
          const hasSession = await prisma.learningSession.findFirst({
            where: {
              userId,
              completedAt: {
                gte: startOfDay,
                lt: endOfDay,
              },
            },
          });
          progress = hasSession ? 1 : 0;
        }

        // Check if mission is completed
        const isCompleted = progress >= mission.target;

        // Update mission if progress or completion status changed
        if (
          progress !== mission.progress ||
          isCompleted !== mission.completed
        ) {
          return prisma.dailyMission.update({
            where: { id: mission.id },
            data: {
              progress,
              completed: isCompleted,
              completedAt:
                isCompleted && !mission.completed
                  ? new Date()
                  : mission.completedAt,
            },
          });
        }

        return mission;
      }),
    );

    return jsonResponse(
      {
        success: true,
        missions: missionsWithProgress.map((m) => ({
          id: m.id,
          type: m.type,
          title: m.title,
          description: m.description,
          target: m.target,
          progress: m.progress,
          completed: m.completed,
          reward: m.reward,
          completedAt: m.completedAt,
        })),
      },
      200,
      "Daily missions retrieved",
    );
  } catch (error) {
    apiLogger.error("Error getting daily missions:", {
      error: error.message,
      stack: error.stack,
    });
    return jsonResponse({ error: error.message }, 500);
  }
}
