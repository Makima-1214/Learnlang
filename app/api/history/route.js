import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const learningSessions = await prisma.learningSession.findMany({
      where: {
        userId: session.user.id,
        status: "COMPLETED",
      },
      orderBy: {
        completedAt: "desc",
      },
      take: 100,
      include: {
        questions: {
          orderBy: { order: "asc" },
        },
      },
    });

    const histories = learningSessions.map((sessionItem) => ({
      id: sessionItem.id,
      method: sessionItem.method,
      level: sessionItem.level,
      total: sessionItem.total,
      score: sessionItem.score,
      status: sessionItem.status,
      createdAt: sessionItem.createdAt,
      completedAt: sessionItem.completedAt,
      questionsCount: sessionItem.questions.length,
      questions: sessionItem.questions.map((question) => ({
        id: question.id,
        questionId: question.questionId,
        questionType: question.questionType,
        userAnswer: question.userAnswer,
        isCorrect: question.isCorrect,
        order: question.order,
      })),
    }));

    return NextResponse.json({
      histories,
      learningSessions: histories,
    });
  } catch (error) {
    console.error("Error fetching history:", error);
    return NextResponse.json(
      { error: "Failed to fetch history" },
      { status: 500 },
    );
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const completedSessions = await prisma.learningSession.findMany({
      where: {
        userId: session.user.id,
        status: "COMPLETED",
      },
      select: { id: true },
    });

    const sessionIds = completedSessions.map((item) => item.id);

    if (sessionIds.length === 0) {
      return NextResponse.json({
        message: "Learning history cleared successfully",
      });
    }

    await prisma.$transaction([
      prisma.sessionQuestion.deleteMany({
        where: {
          sessionId: { in: sessionIds },
        },
      }),
      prisma.learningSession.deleteMany({
        where: {
          id: { in: sessionIds },
        },
      }),
    ]);

    return NextResponse.json({
      message: "Learning history cleared successfully",
    });
  } catch (error) {
    console.error("Error clearing history:", error);
    return NextResponse.json(
      { error: "Failed to clear learning history" },
      { status: 500 },
    );
  }
}
