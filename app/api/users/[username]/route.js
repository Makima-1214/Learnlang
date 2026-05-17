import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Get public user profile by username
export async function GET(request, { params }) {
  try {
    const { username } = await params;
    const session = await getServerSession(authOptions);

    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        name: true,
        username: true,
        avatar: true,
        bio: true,
        createdAt: true,
        _count: {
          select: {
            histories: true,
            comments: true,
            reactions: true,
          },
        },
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

    // Get learning stats
    const stats = await prisma.history.aggregate({
      where: { userId: user.id },
      _avg: { score: true },
      _count: { id: true },
    });

    const correctCount = await prisma.history.count({
      where: { userId: user.id, status: "BENAR" },
    });

    const almostCorrectCount = await prisma.history.count({
      where: { userId: user.id, status: "HAMPIR_BENAR" },
    });

    // Get difficulty breakdown
    const difficultyStats = await prisma.history.groupBy({
      by: ["difficulty"],
      where: { userId: user.id },
      _count: { id: true },
    });

    // Get mode breakdown (EN_ID vs ID_EN)
    const modeStats = await prisma.history.groupBy({
      by: ["mode"],
      where: { userId: user.id },
      _count: { id: true },
    });

    // Get recent activity (last 5)
    const recentActivity = await prisma.history.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        mode: true,
        score: true,
        status: true,
        difficulty: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      ...user,
      followersCount,
      followingCount,
      friendshipCount,
      viewerRelationship,
      stats: {
        totalExercises: stats._count.id,
        averageScore: Math.round(stats._avg.score || 0),
        correctCount,
        almostCorrectCount,
        difficultyBreakdown: difficultyStats.reduce((acc, d) => {
          acc[d.difficulty] = d._count.id;
          return acc;
        }, {}),
        modeBreakdown: modeStats.reduce((acc, m) => {
          acc[m.mode] = m._count.id;
          return acc;
        }, {}),
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
