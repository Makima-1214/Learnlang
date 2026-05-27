import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Get all published quizzes for users
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const quizzes = await prisma.quiz.findMany({
      where: {
        published: true,
      },
      include: {
        _count: {
          select: {
            questions: true,
            results: true,
          },
        },
        results: {
          where: {
            userId: session.user.id,
          },
          orderBy: {
            completedAt: "desc",
          },
          take: 1,
        },
      },
      orderBy: [{ minXp: "asc" }, { order: "asc" }, { createdAt: "asc" }],
    });

    return NextResponse.json(quizzes);
  } catch (error) {
    console.error("Failed to fetch quizzes:", error);
    return NextResponse.json(
      { error: "Failed to fetch quizzes" },
      { status: 500 },
    );
  }
}
