import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { awardQuizAchievements } from "@/lib/achievements";

// POST - Submit quiz answers and get score
export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { xp: true },
    });

    const body = await request.json();
    const { answers } = body; // answers: { questionId: optionId }

    // Fetch quiz with correct answers
    const quiz = await prisma.quiz.findUnique({
      where: { id: id },
      include: {
        questions: {
          include: {
            options: true,
          },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    const currentUserXp = user?.xp || 0;
    const minXp = quiz.minXp || 0;
    if (currentUserXp < minXp) {
      return NextResponse.json(
        { error: `Minimum XP untuk quiz ini adalah ${minXp}` },
        { status: 403 },
      );
    }

    const previousResult = await prisma.quizResult.findFirst({
      where: {
        quizId: quiz.id,
        userId: session.user.id,
      },
      select: {
        id: true,
      },
    });

    // Calculate score
    let correctCount = 0;
    const totalQuestions = quiz.questions.length;
    const detailedResults = [];

    quiz.questions.forEach((question) => {
      const userAnswerId = answers[question.id];
      const correctOption = question.options.find((opt) => opt.isCorrect);
      const userOption = question.options.find(
        (opt) => opt.id === userAnswerId,
      );

      const isCorrect = userAnswerId === correctOption?.id;
      if (isCorrect) correctCount++;

      detailedResults.push({
        questionId: question.id,
        question: question.question,
        userAnswer: userOption?.option || null,
        correctAnswer: correctOption?.option,
        isCorrect,
      });
    });

    // Save result
    const result = await prisma.quizResult.create({
      data: {
        quizId: quiz.id,
        userId: session.user.id,
        score: correctCount,
        totalQuestions,
        answers: JSON.stringify(answers),
      },
    });

    try {
      const rewardGranted = !previousResult && (quiz.rewardXp || 0) > 0;

      if (rewardGranted) {
        await prisma.user.update({
          where: { id: session.user.id },
          data: { xp: { increment: quiz.rewardXp || 0 } },
        });
      }

      await awardQuizAchievements(session.user.id);
    } catch (achievementError) {
      console.error("Failed to award quiz achievements:", achievementError);
    }

    return NextResponse.json({
      resultId: result.id,
      score: correctCount,
      totalQuestions,
      percentage: Math.round((correctCount / totalQuestions) * 100),
      rewardXp: quiz.rewardXp || 0,
      rewardGranted: !previousResult && (quiz.rewardXp || 0) > 0,
      detailedResults,
    });
  } catch (error) {
    console.error("Failed to submit quiz:", error);
    return NextResponse.json(
      { error: "Failed to submit quiz" },
      { status: 500 },
    );
  }
}
