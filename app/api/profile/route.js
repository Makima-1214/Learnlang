import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    // Get learning stats
    const stats = await prisma.history.aggregate({
      where: { userId: session.user.id },
      _avg: { score: true },
      _count: { id: true },
    });

    const correctCount = await prisma.history.count({
      where: { userId: session.user.id, status: "BENAR" },
    });

    return NextResponse.json({
      ...user,
      followersCount,
      followingCount,
      friendshipCount,
      stats: {
        totalExercises: stats._count.id,
        averageScore: Math.round(stats._avg.score || 0),
        correctCount,
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
