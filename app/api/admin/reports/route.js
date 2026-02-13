import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Daily activity for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyActivity = await prisma.history.groupBy({
      by: ["createdAt"],
      _count: true,
      where: { createdAt: { gte: thirtyDaysAgo } },
      orderBy: { createdAt: "asc" },
    });

    // Aggregate by day
    const activityByDay = {};
    dailyActivity.forEach((item) => {
      const day = new Date(item.createdAt).toISOString().split("T")[0];
      activityByDay[day] = (activityByDay[day] || 0) + item._count;
    });
    const dailyChartData = Object.entries(activityByDay).map(
      ([date, count]) => ({ date, count }),
    );

    // 2. Score distribution
    const allScores = await prisma.history.findMany({
      select: { score: true },
    });
    const scoreRanges = [
      { range: "0-20", min: 0, max: 20, count: 0 },
      { range: "21-40", min: 21, max: 40, count: 0 },
      { range: "41-60", min: 41, max: 60, count: 0 },
      { range: "61-80", min: 61, max: 80, count: 0 },
      { range: "81-100", min: 81, max: 100, count: 0 },
    ];
    allScores.forEach(({ score }) => {
      const bucket = scoreRanges.find((r) => score >= r.min && score <= r.max);
      if (bucket) bucket.count++;
    });

    // 3. Exercises by mode
    const exercisesByMode = await prisma.history.groupBy({
      by: ["mode"],
      _count: true,
    });

    // 4. Exercises by difficulty
    const exercisesByDifficulty = await prisma.history.groupBy({
      by: ["difficulty"],
      _count: true,
    });

    // 5. Exercises by status
    const exercisesByStatus = await prisma.history.groupBy({
      by: ["status"],
      _count: true,
    });

    // 6. Top 10 users by exercise count
    const topUsers = await prisma.user.findMany({
      select: {
        name: true,
        _count: { select: { histories: true } },
      },
      orderBy: { histories: { _count: "desc" } },
      take: 10,
    });

    // 7. Average score by difficulty
    const avgScoreByDifficulty = await prisma.history.groupBy({
      by: ["difficulty"],
      _avg: { score: true },
      _count: true,
    });

    // 8. User registration over last 30 days
    const usersRegistered = await prisma.user.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
    });
    const registrationByDay = {};
    usersRegistered.forEach((u) => {
      const day = new Date(u.createdAt).toISOString().split("T")[0];
      registrationByDay[day] = (registrationByDay[day] || 0) + 1;
    });
    const registrationChartData = Object.entries(registrationByDay).map(
      ([date, count]) => ({ date, count }),
    );

    // 9. Overall stats
    const totalUsers = await prisma.user.count();
    const totalExercises = await prisma.history.count();
    const avgScore = await prisma.history.aggregate({ _avg: { score: true } });

    return NextResponse.json({
      dailyActivity: dailyChartData,
      scoreDistribution: scoreRanges.map(({ range, count }) => ({
        range,
        count,
      })),
      exercisesByMode: exercisesByMode.map((e) => ({
        mode: e.mode,
        count: e._count,
      })),
      exercisesByDifficulty: exercisesByDifficulty.map((e) => ({
        difficulty: e.difficulty,
        count: e._count,
      })),
      exercisesByStatus: exercisesByStatus.map((e) => ({
        status: e.status,
        count: e._count,
      })),
      topUsers: topUsers.map((u) => ({
        name: u.name,
        count: u._count.histories,
      })),
      avgScoreByDifficulty: avgScoreByDifficulty.map((e) => ({
        difficulty: e.difficulty,
        avgScore: Math.round(e._avg.score || 0),
        count: e._count,
      })),
      registrations: registrationChartData,
      overall: {
        totalUsers,
        totalExercises,
        avgScore: Math.round(avgScore._avg.score || 0),
      },
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 },
    );
  }
}
