import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Get all quizzes (admin only)
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const quizzes = await prisma.quiz.findMany({
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            questions: true,
            results: true,
          },
        },
      },
      orderBy: {
        order: "asc", // Sort by order for learning path
      },
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

// POST - Create new quiz (admin only)
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      published,
      order,
      timeLimit,
      rewardXp,
      minXp,
      icon,
      color,
      questions,
    } = body;

    if (!title || !questions || questions.length === 0) {
      return NextResponse.json(
        { error: "Title and questions are required" },
        { status: 400 },
      );
    }

    // Create quiz with questions and options in a transaction
    const quiz = await prisma.quiz.create({
      data: {
        title,
        description: description || null,
        published: published || false,
        order: order || 0,
        timeLimit: timeLimit || null,
        rewardXp: Number.isFinite(Number(rewardXp)) ? Number(rewardXp) : 20,
        minXp: Number.isFinite(Number(minXp)) ? Number(minXp) : 0,
        icon: icon || null,
        color: color || "#6366F1",
        createdById: session.user.id,
        questions: {
          create: questions.map((q, index) => ({
            question: q.question,
            order: index + 1,
            options: {
              create: q.options.map((opt, optIndex) => ({
                option: opt.option,
                isCorrect: opt.isCorrect,
                order: optIndex + 1,
              })),
            },
          })),
        },
      },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    });

    return NextResponse.json(quiz, { status: 201 });
  } catch (error) {
    console.error("Failed to create quiz:", error);
    return NextResponse.json(
      { error: "Failed to create quiz" },
      { status: 500 },
    );
  }
}
