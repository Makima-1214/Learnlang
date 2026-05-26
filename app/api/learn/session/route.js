import { prisma } from "@/lib/prisma";
import { ApiResponse, jsonResponse } from "@/lib/api-response";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

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

    const userSession = await getServerSession(authOptions);
    const userId = userSession?.user?.id ?? null;

    // Fetch questions based on method. Use randomized selection so repeated sessions
    // don't always return the same earliest rows. We use a raw SQL RAND() ordering
    // which is acceptable for moderate dataset sizes (MySQL). If you need scale,
    // consider reservoir sampling or pre-shuffled pools.
    let questions = [];
    const take = Math.min(parseInt(limit, 10), 5);

    // Map method to DB table name (see prisma schema maps)
    const tableMap = {
      vocabulary: "vocabulary_questions",
      listening: "listening_questions",
      grammar: "grammar_questions",
    };

    const table = tableMap[method];
    if (!table) {
      return jsonResponse(ApiResponse.validationError("Invalid method"), 400);
    }

    try {
      // Use parameterized raw query to select random rows
      // Note: prisma.$queryRawUnsafe is used to interpolate table name; values are
      // passed as parameters to avoid injection for values.
      const raw = `SELECT * FROM ${table} WHERE level = ? ORDER BY RAND() LIMIT ?`;
      // @ts-ignore - $queryRaw may return any
      questions = await prisma.$queryRawUnsafe(raw, level, take);
    } catch (err) {
      console.error(
        "Randomized query failed, falling back to deterministic fetch:",
        err,
      );
      // Fallback: deterministic selection (existing behavior)
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
    }

    if (questions.length === 0) {
      return jsonResponse(
        ApiResponse.notFound(`No questions found for ${method}`),
        404,
      );
    }

    // Create session with userId if authenticated
    const session = await prisma.learningSession.create({
      data: {
        userId,
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
        questions: sessionQuestions.map((sq) => {
          let snapshot = sq.snapshot;
          if (typeof snapshot === "string") {
            try {
              snapshot = JSON.parse(snapshot);
            } catch (e) {}
          }
          return {
            sessionQuestionId: sq.id,
            questionId: sq.questionId,
            ...snapshot,
          };
        }),
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
        questions: session.questions.map((sq) => {
          let snapshot = sq.snapshot;
          if (typeof snapshot === "string") {
            try {
              snapshot = JSON.parse(snapshot);
            } catch (e) {}
          }
          return {
            sessionQuestionId: sq.id,
            questionId: sq.questionId,
            userAnswer: sq.userAnswer,
            isCorrect: sq.isCorrect,
            ...snapshot,
          };
        }),
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
