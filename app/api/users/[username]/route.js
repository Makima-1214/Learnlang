import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getAchievementProgress,
  getUserAchievements,
} from "@/lib/achievements";

// GET - Get public user profile by username
export async function GET(request, { params }) {
  try {
    const { username } = await params;
    const session = await getServerSession(authOptions);

    const methodLabelMap = {
      vocabulary: "Vocabulary",
      listening: "Listening",
      grammar: "Grammar",
    };

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        name: true,
        username: true,
        avatar: true,
        bio: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const [followersCount, followingCount, friendshipCount] = await Promise.all(
      [
        prisma.follow.count({
          where: { followingId: user.id },
        }),
        prisma.follow.count({
          where: { followerId: user.id },
        }),
        prisma.friendship.count({
          where: {
            OR: [{ initiatorId: user.id }, { friendId: user.id }],
          },
        }),
      ],
    );

    let viewerRelationship = {
      isFollowing: false,
      isFriend: false,
    };

    if (session?.user?.id && session.user.id !== user.id) {
      const [followRecord, friendRecord] = await Promise.all([
        prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: session.user.id,
              followingId: user.id,
            },
          },
        }),
        prisma.friendship.findFirst({
          where: {
            OR: [
              {
                initiatorId: session.user.id,
                friendId: user.id,
              },
              {
                initiatorId: user.id,
                friendId: session.user.id,
              },
            ],
          },
        }),
      ]);

      viewerRelationship = {
        isFollowing: !!followRecord,
        isFriend: !!friendRecord,
      };
    }

    // Get learning stats from LearningSession (completed)
    const completedSessions = await prisma.learningSession.findMany({
      where: { userId: user.id, status: "COMPLETED" },
      select: {
        id: true,
        score: true,
        total: true,
        method: true,
        createdAt: true,
        level: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const totalExercises = completedSessions.length;
    const totalCorrectAnswers = completedSessions.reduce(
      (sum, item) => sum + (Number(item.score) || 0),
      0,
    );
    const totalQuestionsAnswered = completedSessions.reduce(
      (sum, item) => sum + (Number(item.total) || 0),
      0,
    );

    const averageScore = totalExercises
      ? Math.round(
          completedSessions.reduce((s, cs) => s + (cs.score || 0), 0) /
            totalExercises || 0,
        )
      : 0;

    const correctCount = totalCorrectAnswers;
    const accuracy = totalQuestionsAnswered
      ? Math.round((totalCorrectAnswers / totalQuestionsAnswered) * 100)
      : 0;

    // Define 'almost correct' as >=60% and <100%
    const almostCorrectCount = completedSessions.filter((s) => {
      if (typeof s.score !== "number" || !s.total) return false;
      const pct = (s.score / s.total) * 100;
      return pct >= 60 && pct < 100;
    }).length;

    // Difficulty breakdown - use 'level' as proxy
    const difficultyStats = await prisma.learningSession.groupBy({
      by: ["level"],
      where: { userId: user.id, status: "COMPLETED" },
      _count: { id: true },
    });

    // Mode breakdown no longer applicable (old EN_ID/ID_EN), return empty
    const modeStats = [];

    // Get learning method breakdown from learning sessions
    const methodStats = await prisma.learningSession.groupBy({
      by: ["method"],
      where: { userId: user.id, status: "COMPLETED" },
      _count: { id: true },
    });

    const methodBreakdown = methodStats.reduce((acc, m) => {
      acc[m.method] = m._count.id;
      return acc;
    }, {});

    // Get recent activity (last 5) from learning sessions
    const recentActivity = completedSessions.slice(0, 5).map((s) => ({
      id: s.id,
      method: s.method,
      methodLabel: methodLabelMap[s.method] || s.method,
      score: s.score,
      total: s.total,
      level: s.level,
      createdAt: s.createdAt,
      accuracy: s.total ? Math.round(((s.score || 0) / s.total) * 100) : 0,
    }));

    const [achievementData, achievementProgress] = await Promise.all([
      getUserAchievements(user.id),
      getAchievementProgress(user.id),
    ]);

    return NextResponse.json({
      ...user,
      followersCount,
      followingCount,
      friendshipCount,
      viewerRelationship,
      stats: {
        totalExercises,
        averageScore,
        correctCount,
        totalCorrectAnswers,
        accuracy,
        almostCorrectCount,
        difficultyBreakdown: difficultyStats.reduce((acc, d) => {
          acc[d.level] = d._count.id;
          return acc;
        }, {}),
        modeBreakdown: {},
        methodBreakdown,
      },
      achievements: achievementData.achievements,
      achievementSummary: {
        count: achievementData.count,
        totalPoints: achievementData.totalPoints,
        unlocked: achievementProgress.unlocked,
        total: achievementProgress.total,
        percentage: achievementProgress.percentage,
        nextAchievements: achievementProgress.nextAchievements,
      },
      recentActivity,
    });
  } catch (error) {
    console.error("Error fetching public profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 },
    );
  }
}
