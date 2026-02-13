import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get total users
    const totalUsers = await prisma.user.count({
      where: { role: "USER" },
    });

    // Get total admins
    const totalAdmins = await prisma.user.count({
      where: { role: "ADMIN" },
    });

    // Get total exercises
    const totalExercises = await prisma.history.count();

    // Get average score
    const scoreAggregate = await prisma.history.aggregate({
      _avg: {
        score: true,
      },
    });

    // Get mode distribution
    const modeDistribution = await prisma.history.groupBy({
      by: ["mode"],
      _count: {
        mode: true,
      },
    });

    // Get difficulty distribution
    const difficultyDistribution = await prisma.history.groupBy({
      by: ["difficulty"],
      _count: {
        difficulty: true,
      },
    });

    // Get status distribution
    const statusDistribution = await prisma.history.groupBy({
      by: ["status"],
      _count: {
        status: true,
      },
    });

    return NextResponse.json({
      totalUsers,
      totalAdmins,
      totalExercises,
      averageScore: Math.round(scoreAggregate._avg.score || 0),
      modeDistribution: {
        EN_ID:
          modeDistribution.find((m) => m.mode === "EN_ID")?._count.mode || 0,
        ID_EN:
          modeDistribution.find((m) => m.mode === "ID_EN")?._count.mode || 0,
      },
      difficultyDistribution: {
        EASY:
          difficultyDistribution.find((d) => d.difficulty === "EASY")?._count
            .difficulty || 0,
        MEDIUM:
          difficultyDistribution.find((d) => d.difficulty === "MEDIUM")?._count
            .difficulty || 0,
        HARD:
          difficultyDistribution.find((d) => d.difficulty === "HARD")?._count
            .difficulty || 0,
      },
      statusDistribution: {
        BENAR:
          statusDistribution.find((s) => s.status === "BENAR")?._count.status ||
          0,
        HAMPIR_BENAR:
          statusDistribution.find((s) => s.status === "HAMPIR_BENAR")?._count
            .status || 0,
        SALAH:
          statusDistribution.find((s) => s.status === "SALAH")?._count.status ||
          0,
      },
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 },
    );
  }
}
