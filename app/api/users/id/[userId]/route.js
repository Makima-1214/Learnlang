import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  getAchievementProgress,
  getUserAchievements,
} from "@/lib/achievements";

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    const { userId } = await params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
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
        prisma.follow.count({ where: { followingId: user.id } }),
        prisma.follow.count({ where: { followerId: user.id } }),
        prisma.friendship.count({
          where: { OR: [{ initiatorId: user.id }, { friendId: user.id }] },
        }),
      ],
    );

    const [achievementData, achievementProgress] = await Promise.all([
      getUserAchievements(user.id),
      getAchievementProgress(user.id),
    ]);

    let viewerRelationship = { isFollowing: false, isFriend: false };

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
              { initiatorId: session.user.id, friendId: user.id },
              { initiatorId: user.id, friendId: session.user.id },
            ],
          },
        }),
      ]);

      viewerRelationship = {
        isFollowing: !!followRecord,
        isFriend: !!friendRecord,
      };
    }

    return NextResponse.json({
      ...user,
      followersCount,
      followingCount,
      friendshipCount,
      viewerRelationship,
      achievements: achievementData.achievements,
      achievementSummary: {
        count: achievementData.count,
        totalPoints: achievementData.totalPoints,
        unlocked: achievementProgress.unlocked,
        total: achievementProgress.total,
        percentage: achievementProgress.percentage,
        nextAchievements: achievementProgress.nextAchievements,
      },
    });
  } catch (error) {
    console.error("Error fetching user by id:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 },
    );
  }
}
