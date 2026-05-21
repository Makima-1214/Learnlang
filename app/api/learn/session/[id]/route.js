import { prisma } from "@/lib/prisma";
import { ApiResponse, jsonResponse } from "@/lib/api-response";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { apiLogger } from "@/lib/logger";
import { recordApiResponse } from "@/lib/monitoring";

function normalizeListeningAnswer(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return value
      .split("|")
      .map((part) => part.trim())
      .filter(Boolean);
  }
}

function arraysEqual(left, right) {
  if (!Array.isArray(left) || !Array.isArray(right)) return false;
  if (left.length !== right.length) return false;

  return left.every((item, index) => item === right[index]);
}

/**
 * GET /api/learn/session/[id] - Get session details
 */
export async function GET(req, { params }) {
  try {
    const paramsObj = await params;
    const sessionId = paramsObj.id;

    // resolve server session for ownership check (may be null for anonymous)
    const userSession = await getServerSession(authOptions);
    const requesterId = userSession?.user?.id ?? null;

    const session = await prisma.learningSession.findUnique({
      where: { id: sessionId },
      include: {
        questions: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!session) {
      apiLogger.warn("Session not found on GET", { sessionId });
      recordApiResponse(req.url, 404);
      return jsonResponse(ApiResponse.notFound("Session not found"), 404);
    }

    // If session is owned by a user, ensure the requester is the same user
    if (session.userId && requesterId && session.userId !== requesterId) {
      apiLogger.warn("Unauthorized session access attempt", {
        sessionId,
        requesterId,
        ownerId: session.userId,
        endpoint: req.url,
      });
      recordApiResponse(req.url, 403);
      return jsonResponse(ApiResponse.forbidden("Access denied"), 403);
    }

    apiLogger.info("Fetched learning session", { sessionId, requesterId });
    recordApiResponse(req.url, 200);
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
    apiLogger.error("Error fetching session", err, { endpoint: req.url });
    recordApiResponse(req.url, 500);
    return jsonResponse(
      ApiResponse.internalError(err.message || "Failed to fetch session"),
      500,
    );
  }
}

/**
 * POST /api/learn/session/[id]/submit - Submit answers and get scoring
 */
export async function POST(req, { params }) {
  try {
    const paramsObj = await params;
    const sessionId = paramsObj.id;
    const body = await req.json();
    const { answers } = body; // { sessionQuestionId: userAnswer }

    const userSession = await getServerSession(authOptions);
    const requesterId = userSession?.user?.id ?? null;

    const session = await prisma.learningSession.findUnique({
      where: { id: sessionId },
      include: { questions: true },
    });

    if (!session) {
      apiLogger.warn("Session not found on POST submit", { sessionId });
      recordApiResponse(req.url, 404);
      return jsonResponse(ApiResponse.notFound("Session not found"), 404);
    }

    if (session.userId && requesterId && session.userId !== requesterId) {
      apiLogger.warn("Unauthorized session submit attempt", {
        sessionId,
        requesterId,
        ownerId: session.userId,
        endpoint: req.url,
      });
      recordApiResponse(req.url, 403);
      return jsonResponse(ApiResponse.forbidden("Access denied"), 403);
    }
    if (session.status === "COMPLETED") {
      return jsonResponse(
        ApiResponse.validationError("Session already completed"),
        400,
      );
    }

    let correctCount = 0;
    const detailedResults = [];

    // Process each answer
    for (const sq of session.questions) {
      const userAnswer = answers[sq.id];
      const isListening = session.method === "listening";
      const expectedAnswer = isListening
        ? normalizeListeningAnswer(sq.snapshot.answer)
        : sq.snapshot.answer;
      const submittedAnswer = isListening
        ? normalizeListeningAnswer(userAnswer)
        : userAnswer;
      const isCorrect = isListening
        ? arraysEqual(submittedAnswer, expectedAnswer)
        : submittedAnswer === expectedAnswer;

      if (isCorrect) correctCount++;

      detailedResults.push({
        sessionQuestionId: sq.id,
        questionId: sq.questionId,
        userAnswer,
        correctAnswer: sq.snapshot.answer,
        isCorrect,
      });

      // Update session question with user answer
      await prisma.sessionQuestion.update({
        where: { id: sq.id },
        data: {
          userAnswer,
          isCorrect,
        },
      });
    }

    // Update session status and score
    const updatedSession = await prisma.learningSession.update({
      where: { id: sessionId },
      data: {
        status: "COMPLETED",
        score: correctCount,
        completedAt: new Date(),
      },
    });

    // Optionally save to History if userId is present
    if (session.userId) {
      try {
        await prisma.history.create({
          data: {
            userId: session.userId,
            mode: "EN_ID", // Default mode for learning sessions
            sourceLanguage: "en",
            targetLanguage: "id",
            sourceSentence: `${session.method} session (${session.level})`,
            userTranslation: `Score: ${correctCount}/${session.total}`,
            correctTranslation: `Completed learning session`,
            score: Math.round((correctCount / session.total) * 100),
            status: correctCount === session.total ? "BENAR" : "HAMPIR_BENAR",
            feedback: `You got ${correctCount} out of ${session.total} correct`,
            difficulty: session.level,
          },
        });
      } catch (historyErr) {
        apiLogger.error("Error saving to history", historyErr, {
          sessionId,
          userId: session.userId,
        });
        // Don't fail the request if history save fails
      }
    }

    recordApiResponse(req.url, 200);
    return jsonResponse(
      ApiResponse.success({
        session: {
          id: updatedSession.id,
          status: "COMPLETED",
          score: correctCount,
          total: session.total,
          percentage: Math.round((correctCount / session.total) * 100),
        },
        results: detailedResults,
      }),
    );
  } catch (err) {
    apiLogger.error("Error submitting session", err, { endpoint: req.url });
    recordApiResponse(req.url, 500);
    return jsonResponse(
      ApiResponse.internalError(err.message || "Failed to submit session"),
      500,
    );
  }
}
/**
 * DELETE /api/learn/session/[id] - Delete/discard session and progress
 */
export async function DELETE(req, { params }) {
  try {
    const paramsObj = await params;
    const sessionId = paramsObj.id;

    const userSession = await getServerSession(authOptions);
    const requesterId = userSession?.user?.id ?? null;

    const session = await prisma.learningSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      apiLogger.warn("Session not found on DELETE", { sessionId });
      recordApiResponse(req.url, 404);
      return jsonResponse(ApiResponse.notFound("Session not found"), 404);
    }

    if (session.userId && requesterId && session.userId !== requesterId) {
      apiLogger.warn("Unauthorized session delete attempt", {
        sessionId,
        requesterId,
        ownerId: session.userId,
        endpoint: req.url,
      });
      recordApiResponse(req.url, 403);
      return jsonResponse(ApiResponse.forbidden("Access denied"), 403);
    }
    // Delete all session questions first (due to foreign key constraint)
    await prisma.sessionQuestion.deleteMany({
      where: { sessionId },
    });

    // Delete the session
    await prisma.learningSession.delete({
      where: { id: sessionId },
    });

    recordApiResponse(req.url, 200);
    return jsonResponse(
      ApiResponse.success({
        message: "Session deleted successfully",
      }),
    );
  } catch (err) {
    apiLogger.error("Error deleting session", err, { endpoint: req.url });
    recordApiResponse(req.url, 500);
    return jsonResponse(
      ApiResponse.internalError(err.message || "Failed to delete session"),
      500,
    );
  }
}
