import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const totalUsers = await prisma.user.count({
      where: { role: "USER" },
    });

    const totalAdmins = await prisma.user.count({
      where: { role: "ADMIN" },
    });

    const totalExercises = await prisma.learningSession.count({
      where: {
        completedAt: {
          not: null,
        },
      },
    });

    const scoreAggregate = await prisma.learningSession.aggregate({
      _avg: {
        score: true,
      },
      where: {
        completedAt: {
          not: null,
        },
      },
    });

    const methodDistribution = await prisma.learningSession.groupBy({
      by: ["method"],
      _count: {
        _all: true,
      },
      where: {
        completedAt: {
          not: null,
        },
      },
    });

    const levelDistribution = await prisma.learningSession.groupBy({
      by: ["level"],
      _count: {
        _all: true,
      },
      where: {
        completedAt: {
          not: null,
        },
      },
    });

    const correctCount = await prisma.sessionQuestion.count({
      where: {
        isCorrect: true,
        session: {
          completedAt: {
            not: null,
          },
        },
      },
    });

    const incorrectCount = await prisma.sessionQuestion.count({
      where: {
        isCorrect: false,
        session: {
          completedAt: {
            not: null,
          },
        },
      },
    });

    return NextResponse.json({
      totalUsers,
      totalAdmins,
      totalExercises,
      averageScore: Math.round(scoreAggregate._avg.score || 0),
      modeDistribution: {
        vocabulary:
          methodDistribution.find((m) => m.method === "vocabulary")?._count
            ._all || 0,
        grammar:
          methodDistribution.find((m) => m.method === "grammar")?._count._all ||
          0,
        listening:
          methodDistribution.find((m) => m.method === "listening")?._count
            ._all || 0,
      },
      difficultyDistribution: {
        EASY:
          levelDistribution.find((d) => d.level === "EASY")?._count._all || 0,
        MEDIUM:
          levelDistribution.find((d) => d.level === "MEDIUM")?._count._all || 0,
        HARD:
          levelDistribution.find((d) => d.level === "HARD")?._count._all || 0,
      },
      statusDistribution: {
        BENAR: correctCount,
        HAMPIR_BENAR: 0,
        SALAH: incorrectCount,
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
