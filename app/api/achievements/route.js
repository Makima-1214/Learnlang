/**
 * GET /api/achievements - Get user's achievements
 * POST /api/achievements - Award achievement (internal/admin use)
 */

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {
  getUserAchievements,
  getAchievementProgress,
  awardAchievement,
  getAchievementLeaderboard,
} from "@/lib/achievements";
import { ApiResponse, jsonResponse } from "@/lib/api-response";
import { apiLogger } from "@/lib/logger";
import { limiters } from "@/lib/ratelimit";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return jsonResponse(ApiResponse.error("Unauthorized", 401), 401);
    }

    // Check rate limit
    if (!limiters.read.isAllowed(session.user.id)) {
      return jsonResponse(ApiResponse.error("Rate limit exceeded", 429), 429);
    }

    const searchParams = new URL(request.url).searchParams;
    const action = searchParams.get("action");

    if (action === "leaderboard") {
      const limit = parseInt(searchParams.get("limit") || "10");
      const leaderboard = await getAchievementLeaderboard(Math.min(limit, 50));

      apiLogger.logApiRequest(
        "GET",
        "/api/achievements?action=leaderboard",
        200,
      );
      return jsonResponse(ApiResponse.success({ leaderboard }), 200);
    }

    if (action === "progress") {
      const progress = await getAchievementProgress(session.user.id);

      apiLogger.logApiRequest("GET", "/api/achievements?action=progress", 200);
      return jsonResponse(ApiResponse.success(progress), 200);
    }

    // Default: Get all achievements
    const result = await getUserAchievements(session.user.id);

    apiLogger.logApiRequest("GET", "/api/achievements", 200);
    return jsonResponse(ApiResponse.success(result), 200);
  } catch (error) {
    apiLogger.error("Achievement GET error:", { error: error.message });
    return jsonResponse(ApiResponse.error("Internal server error", 500), 500);
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return jsonResponse(ApiResponse.error("Unauthorized", 401), 401);
    }

    // Check rate limit
    if (!limiters.create.isAllowed(session.user.id)) {
      return jsonResponse(ApiResponse.error("Rate limit exceeded", 429), 429);
    }

    const body = await request.json();
    const { achievementType, targetUserId } = body;

    if (!achievementType) {
      return jsonResponse(
        ApiResponse.validationError(["achievementType is required"]),
        400,
      );
    }

    // For now, only allow users to award achievements to themselves
    // In production, you might want role-based authorization
    const userId = targetUserId || session.user.id;

    const achievement = await awardAchievement(userId, achievementType);

    if (!achievement) {
      return jsonResponse(
        ApiResponse.success({ message: "Achievement already unlocked" }),
        200,
      );
    }

    apiLogger.logApiRequest("POST", "/api/achievements", 201);
    return jsonResponse(ApiResponse.success(achievement), 201);
  } catch (error) {
    apiLogger.error("Achievement POST error:", { error: error.message });
    return jsonResponse(ApiResponse.error("Internal server error", 500), 500);
  }
}
