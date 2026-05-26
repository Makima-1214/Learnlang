import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { ApiResponse, jsonResponse } from "@/lib/api-response";
import { apiLogger } from "@/lib/logger";
import { recordApiResponse } from "@/lib/monitoring";
import { consumeUserEnergy } from "@/lib/energy";
import { prisma } from "@/lib/prisma";

export async function POST(req, { params }) {
  try {
    const paramsObj = await params;
    const sessionId = paramsObj.id;
    const body = await req.json().catch(() => ({}));
    const amount = Math.max(1, Number(body?.amount) || 1);

    const userSession = await getServerSession(authOptions);
    const requesterId = userSession?.user?.id ?? null;

    const session = await prisma.learningSession.findUnique({
      where: { id: sessionId },
      select: { id: true, userId: true, status: true },
    });

    if (!session) {
      recordApiResponse(req.url, 404);
      return jsonResponse(ApiResponse.notFound("Session not found"), 404);
    }

    if (session.userId && requesterId && session.userId !== requesterId) {
      recordApiResponse(req.url, 403);
      return jsonResponse(ApiResponse.forbidden("Access denied"), 403);
    }

    if (!session.userId) {
      return jsonResponse(
        ApiResponse.success({
          energy: null,
          message: "Anonymous session does not consume energy",
        }),
        200,
      );
    }

    const energy = await consumeUserEnergy(session.userId, amount, {
      emit: true,
      xpPenalty: amount * 2,
    });

    recordApiResponse(req.url, 200);
    return jsonResponse(
      ApiResponse.success({
        energy,
      }),
      200,
    );
  } catch (error) {
    apiLogger.error("Energy consume failed", error, { endpoint: req.url });
    recordApiResponse(req.url, 500);
    return jsonResponse(
      ApiResponse.internalError(error.message || "Failed to consume energy"),
      500,
    );
  }
}
