import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET - Get single quiz (admin only)
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: id },
      include: {
        questions: {
          include: {
            options: {
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            results: true,
          },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    return NextResponse.json(quiz);
  } catch (error) {
    console.error("Failed to fetch quiz:", error);
    return NextResponse.json(
      { error: "Failed to fetch quiz" },
      { status: 500 },
    );
  }
}

// PUT - Update quiz (admin only)
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
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

    // Delete existing questions and create new ones (simplest approach)
    await prisma.quizQuestion.deleteMany({
      where: { quizId: id },
    });

    const quiz = await prisma.quiz.update({
      where: { id: id },
      data: {
        title,
        description: description || null,
        published: published || false,
        order: Number.isFinite(Number(order)) ? Number(order) : 0,
        timeLimit: timeLimit ? Number(timeLimit) : null,
        rewardXp: Number.isFinite(Number(rewardXp)) ? Number(rewardXp) : 20,
        minXp: Number.isFinite(Number(minXp)) ? Number(minXp) : 0,
        icon: icon || null,
        color: color || "#6366F1",
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

    return NextResponse.json(quiz);
  } catch (error) {
    console.error("Failed to update quiz:", error);
    return NextResponse.json(
      { error: "Failed to update quiz" },
      { status: 500 },
    );
  }
}

// DELETE - Delete quiz (admin only)
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await prisma.quiz.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "Quiz deleted successfully" });
  } catch (error) {
    console.error("Failed to delete quiz:", error);
    return NextResponse.json(
      { error: "Failed to delete quiz" },
      { status: 500 },
    );
  }
}
