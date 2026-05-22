import { prisma } from "@/lib/prisma";
import { ApiResponse, jsonResponse } from "@/lib/api-response";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { apiLogger } from "@/lib/logger";
import { recordApiResponse } from "@/lib/monitoring";

/**
 * POST /api/learn/session/[id]/progress
 * Body: { updates: [{ sessionQuestionId, userAnswer }] }
 * Lightweight autosave for per-question progress.
 */
export async function POST(req, { params }) {
  try {
    const paramsObj = await params;
    const sessionId = paramsObj.id;
    const body = await req.json();
    const updates = Array.isArray(body?.updates) ? body.updates : [];

    const userSession = await getServerSession(authOptions);
    const requesterId = userSession?.user?.id ?? null;

    const session = await prisma.learningSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      apiLogger.warn("Autosave: session not found", { sessionId, requesterId });
      recordApiResponse(req.url, 404);
      return jsonResponse(ApiResponse.notFound("Session not found"), 404);
    }

    if (session.userId && requesterId && session.userId !== requesterId) {
      apiLogger.warn("Autosave: unauthorized attempt", {
        sessionId,
        requesterId,
        ownerId: session.userId,
      });
      recordApiResponse(req.url, 403);
      return jsonResponse(ApiResponse.forbidden("Access denied"), 403);
    }

    const results = [];
    for (const u of updates) {
      const sqId = u.sessionQuestionId;
      const userAnswer = u.userAnswer;
      if (!sqId) continue;

      try {
        // Update only rows that belong to this session
        const updated = await prisma.sessionQuestion.updateMany({
          where: { id: sqId, sessionId },
          data: {
            userAnswer,
            // Leave isCorrect undefined here; scoring happens on submit.
            // If snapshot.answer is present, we can set isCorrect optimistically.
          },
        });

        results.push({ sessionQuestionId: sqId, updated: updated.count });
      } catch (err) {
        apiLogger.error("Autosave update failed for question", err, {
          sessionId,
          sessionQuestionId: sqId,
          requesterId,
        });
        results.push({
          sessionQuestionId: sqId,
          updated: 0,
          error: String(err),
        });
      }
    }

    apiLogger.debug("Autosave completed", {
      sessionId,
      requesterId,
      count: results.length,
    });
    recordApiResponse(req.url, 200);

    return jsonResponse(ApiResponse.success({ results }));
  } catch (err) {
    apiLogger.error("Autosave failed", err, { endpoint: req.url });
    recordApiResponse(req.url, 500);
    return jsonResponse(
      ApiResponse.internalError(err.message || "Autosave failed"),
      500,
    );
  }
}
