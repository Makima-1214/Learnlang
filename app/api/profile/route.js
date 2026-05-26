import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateStreak, calculateTotalXP } from "@/lib/streak";
import { getUserEnergy } from "@/lib/energy";

// GET - Get current user's profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        avatar: true,
        bio: true,
        role: true,
        xp: true,
        energy: true,
        energyNextRefillAt: true,
        createdAt: true,
        _count: {
          select: {
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
          where: { followingId: session.user.id },
        }),
        prisma.follow.count({
          where: { followerId: session.user.id },
        }),
        prisma.friendship.count({
          where: {
            OR: [
              { initiatorId: session.user.id },
              { friendId: session.user.id },
            ],
          },
        }),
      ],
    );

    const [streakData, totalXP, energy] = await Promise.all([
      calculateStreak(session.user.id),
      calculateTotalXP(session.user.id),
      getUserEnergy(session.user.id, { emit: false }),
    ]);

    // Get learning stats from completed LearningSession records
    const completedSessions = await prisma.learningSession.findMany({
      where: { userId: session.user.id, status: "COMPLETED" },
      select: { id: true, score: true, total: true, method: true },
    });

    const totalExercises = completedSessions.length;
    const averageScore = totalExercises
      ? Math.round(
          completedSessions.reduce((s, cs) => s + (cs.score || 0), 0) /
            totalExercises || 0,
        )
      : 0;

    const correctCount = completedSessions.filter(
      (s) => typeof s.score === "number" && s.score === s.total,
    ).length;

    // Get learning method breakdown from learning sessions (completed)
    const methodStats = await prisma.learningSession.groupBy({
      by: ["method"],
      where: { userId: session.user.id, status: "COMPLETED" },
      _count: { id: true },
    });

    const methodBreakdown = methodStats.reduce((acc, m) => {
      acc[m.method] = m._count.id;
      return acc;
    }, {});

    return NextResponse.json({
      ...user,
      followersCount,
      followingCount,
      friendshipCount,
      stats: {
        streak: streakData.streak,
        lastSessionDate: streakData.lastSessionDate,
        totalXP,
        exp: totalXP,
        totalExercises,
        averageScore,
        correctCount,
        methodBreakdown,
        energy,
      },
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 },
    );
  }
}

// PUT - Update current user's profile
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, username, bio, avatar } = body;

    // Validate username
    if (username !== undefined) {
      if (username && username.trim()) {
        const usernameRegex = /^[a-zA-Z0-9_-]{3,30}$/;
        if (!usernameRegex.test(username.trim())) {
          return NextResponse.json(
            {
              error:
                "Username hanya boleh huruf, angka, underscore, dan dash (3-30 karakter)",
            },
            { status: 400 },
          );
        }

        // Check uniqueness
        const existing = await prisma.user.findUnique({
          where: { username: username.trim() },
        });
        if (existing && existing.id !== session.user.id) {
          return NextResponse.json(
            { error: "Username sudah digunakan" },
            { status: 400 },
          );
        }
      }
    }

    if (name !== undefined && (!name || !name.trim())) {
      return NextResponse.json(
        { error: "Nama tidak boleh kosong" },
        { status: 400 },
      );
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (username !== undefined) updateData.username = username?.trim() || null;
    if (bio !== undefined) updateData.bio = bio?.trim() || null;
    if (avatar !== undefined) updateData.avatar = avatar || null;

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        avatar: true,
        bio: true,
        role: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 },
    );
  }
}
