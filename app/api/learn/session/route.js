import { prisma } from "@/lib/prisma";
import { ApiResponse, jsonResponse } from "@/lib/api-response";

/**
 * POST /api/learn/session - Create a new learning session with questions
 */
export async function POST(req) {
  try {
    const body = await req.json();
    const { method, level = "A1", limit = 5 } = body;

    if (!method || !["vocabulary", "listening", "grammar"].includes(method)) {
      return jsonResponse(ApiResponse.validationError("Invalid method"), 400);
    }

    // Fetch questions based on method
    let questions = [];
    const take = Math.min(parseInt(limit, 10), 5);

    if (method === "vocabulary") {
      questions = await prisma.vocabularyQuestion.findMany({
        where: { level },
        orderBy: { createdAt: "asc" },
        take,
      });
    } else if (method === "listening") {
      questions = await prisma.listeningQuestion.findMany({
        where: { level },
        orderBy: { createdAt: "asc" },
        take,
      });
    } else if (method === "grammar") {
      questions = await prisma.grammarQuestion.findMany({
        where: { level },
        orderBy: { createdAt: "asc" },
        take,
      });
    }

    if (questions.length === 0) {
      return jsonResponse(
        ApiResponse.notFound(`No questions found for ${method}`),
        404,
      );
    }

    // Create session
    const session = await prisma.learningSession.create({
      data: {
        method,
        level,
        total: questions.length,
        status: "IN_PROGRESS",
      },
    });

    // Add questions to session
    const sessionQuestions = await Promise.all(
      questions.map((q, index) =>
        prisma.sessionQuestion.create({
          data: {
            sessionId: session.id,
            questionId: q.id,
            questionType: method,
            snapshot: q, // Store full question snapshot
            order: index,
          },
        }),
      ),
    );

    return jsonResponse(
      ApiResponse.success({
        session: {
          id: session.id,
          method,
          level,
          total: questions.length,
          status: "IN_PROGRESS",
        },
        questions: sessionQuestions.map((sq) => ({
          sessionQuestionId: sq.id,
          questionId: sq.questionId,
          ...sq.snapshot,
        })),
      }),
      201,
    );
  } catch (err) {
    console.error("Error creating session:", err);
    return jsonResponse(
      ApiResponse.internalError(err.message || "Failed to create session"),
      500,
    );
  }
}

/**
 * GET /api/learn/session?sessionId=xxx - Fetch session details
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return jsonResponse(
        ApiResponse.validationError("sessionId required"),
        400,
      );
    }

    const session = await prisma.learningSession.findUnique({
      where: { id: sessionId },
      include: {
        questions: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!session) {
      return jsonResponse(ApiResponse.notFound("Session not found"), 404);
    }

    return jsonResponse(
      ApiResponse.success({
        session: {
          id: session.id,
          method: session.method,
          level: session.level,
          total: session.total,
          status: session.status,
          score: session.score,
          createdAt: session.createdAt,
          completedAt: session.completedAt,
        },
        questions: session.questions.map((sq) => ({
          sessionQuestionId: sq.id,
          questionId: sq.questionId,
          userAnswer: sq.userAnswer,
          isCorrect: sq.isCorrect,
          ...sq.snapshot,
        })),
      }),
    );
  } catch (err) {
    console.error("Error fetching session:", err);
    return jsonResponse(
      ApiResponse.internalError(err.message || "Failed to fetch session"),
      500,
    );
  }
}
