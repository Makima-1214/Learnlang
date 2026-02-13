import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET dashboard statistics (Admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get total users
    const totalUsers = await prisma.user.count();

    // Get total admins
    const totalAdmins = await prisma.user.count({
      where: { role: "ADMIN" },
    });

    // Get total exercises/histories
    const totalExercises = await prisma.history.count();

    // Get active users (users who have done exercises in last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activeUsers = await prisma.user.count({
      where: {
        histories: {
          some: {
            createdAt: {
              gte: sevenDaysAgo,
            },
          },
        },
      },
    });

    // Get recent active learners with their exercise count
    const recentLearners = await prisma.user.findMany({
      where: {
        histories: {
          some: {
            createdAt: {
              gte: sevenDaysAgo,
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        _count: {
          select: {
            histories: true,
          },
        },
        histories: {
          where: {
            createdAt: {
              gte: sevenDaysAgo,
            },
          },
          select: {
            createdAt: true,
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        histories: {
          _count: "desc",
        },
      },
      take: 10,
    });

    // Get exercise statistics by mode
    const exercisesByMode = await prisma.history.groupBy({
      by: ["mode"],
      _count: true,
    });

    // Get recent exercises
    const recentExercises = await prisma.history.findMany({
      take: 10,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        sourceSentence: true,
        mode: true,
        score: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      stats: {
        totalUsers,
        totalAdmins,
        totalExercises,
        activeUsers,
      },
      exercisesByMode,
      recentLearners,
      recentExercises,
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 },
    );
  }
}
