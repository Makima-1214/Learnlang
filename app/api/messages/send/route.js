import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiResponse, jsonResponse } from "@/lib/api-response";
import { apiLogger } from "@/lib/logger";
import { limiters, getRateLimitKey } from "@/lib/ratelimit";
import { emitNewPrivateMessage } from "@/lib/socket";

/**
 * POST /api/messages/send
 * Send a private message to a friend
 */
export async function POST(req) {
  const startTime = Date.now();
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return jsonResponse(ApiResponse.unauthorized(), 401);
    }

    const key = getRateLimitKey(session.user.id);
    if (!limiters.general.isAllowed(key)) {
      return jsonResponse(ApiResponse.rateLimit(), 429);
    }
    limiters.general.increment(key);

    const data = await req.json();
    const {
      receiverId,
      content,
      attachmentUrl,
      attachmentName,
      attachmentType,
      attachmentSize,
      attachmentCaption,
    } = data;
    const userId = session.user.id;

    // Validate input
    if (!receiverId || typeof receiverId !== "string") {
      return jsonResponse(
        ApiResponse.validationError(["receiverId is required"]),
        400,
      );
    }

    const hasAttachment = Boolean(attachmentUrl);

    if (
      (!content ||
        typeof content !== "string" ||
        content.trim().length === 0) &&
      !hasAttachment
    ) {
      return jsonResponse(
        ApiResponse.validationError([
          "Message content or attachment is required",
        ]),
        400,
      );
    }

    if (content.length > 5000) {
      return jsonResponse(
        ApiResponse.validationError(["Message too long (max 5000 chars)"]),
        400,
      );
    }

    if (userId === receiverId) {
      return jsonResponse(ApiResponse.error("Cannot message yourself"), 400);
    }

    // Check if receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      return jsonResponse(ApiResponse.notFound("Receiver not found"), 404);
    }

    // Check if users are friends
    const [id1, id2] =
      userId < receiverId ? [userId, receiverId] : [receiverId, userId];

    const friendship = await prisma.friendship.findUnique({
      where: {
        initiatorId_friendId: {
          initiatorId: id1,
          friendId: id2,
        },
      },
    });

    if (!friendship) {
      return jsonResponse(
        ApiResponse.error("You can only message friends"),
        403,
      );
    }

    // Check if either user blocked the other
    const [blockedByReceiver, blockedBySender] = await Promise.all([
      prisma.blockedUser.findUnique({
        where: {
          blockerId_blockedId: {
            blockerId: receiverId,
            blockedId: userId,
          },
        },
      }),
      prisma.blockedUser.findUnique({
        where: {
          blockerId_blockedId: {
            blockerId: userId,
            blockedId: receiverId,
          },
        },
      }),
    ]);

    if (blockedByReceiver || blockedBySender) {
      return jsonResponse(ApiResponse.error("This user has blocked you"), 403);
    }

    // Send message
    const message = await prisma.privateMessage.create({
      data: {
        senderId: userId,
        receiverId: receiverId,
        content: content?.trim() || "",
        attachmentUrl: attachmentUrl || null,
        attachmentName: attachmentName || null,
        attachmentType: attachmentType || null,
        attachmentSize: attachmentSize ? Number(attachmentSize) : null,
        attachmentCaption: attachmentCaption || null,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    emitNewPrivateMessage(userId, receiverId, message);

    const duration = Date.now() - startTime;
    apiLogger.logApiRequest("POST", "/api/messages/send", 200, duration);

    return jsonResponse(
      ApiResponse.success({
        message,
      }),
      200,
    );
  } catch (error) {
    console.error("Send message error:", error);
    apiLogger.logApiRequest(
      "POST",
      "/api/messages/send",
      500,
      Date.now() - startTime,
    );
    return jsonResponse(ApiResponse.internalError(), 500);
  }
}
