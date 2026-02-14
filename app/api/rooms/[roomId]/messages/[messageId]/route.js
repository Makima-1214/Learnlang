import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { emitMessageDeleted } from "@/lib/socket";

// DELETE - Delete a message
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { roomId, messageId } = await params;

    // Fetch the message
    const message = await prisma.message.findUnique({
      where: { id: messageId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    if (!message) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    // Check if message belongs to this room
    if (message.roomId !== roomId) {
      return NextResponse.json(
        { error: "Message not in this room" },
        { status: 400 },
      );
    }

    // Check permissions
    const isMessageOwner = message.userId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";
    const messageAgeInMs = Date.now() - new Date(message.createdAt).getTime();
    const messageAgeInMinutes = messageAgeInMs / (1000 * 60);
    const canDeleteAgeLimit = messageAgeInMinutes < 1;

    // Determine if user can delete
    let canDelete = false;
    let deletionReason = null;

    if (isAdmin) {
      canDelete = true;
      deletionReason = "admin";
    } else if (isMessageOwner && canDeleteAgeLimit) {
      canDelete = true;
      deletionReason = "user";
    }

    if (!canDelete) {
      return NextResponse.json(
        {
          error: isMessageOwner
            ? "Pesan hanya bisa dihapus dalam 1 menit pertama"
            : "Anda tidak bisa menghapus pesan ini",
        },
        { status: 403 },
      );
    }

    // Mark message as deleted
    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: session.user.id,
        deletionReason: deletionReason,
        content:
          deletionReason === "admin"
            ? "Pesan telah dihapus oleh admin"
            : "Pesan telah dihapus.",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    // Emit real-time event
    emitMessageDeleted(roomId, updatedMessage);

    return NextResponse.json(updatedMessage);
  } catch (error) {
    console.error("Error deleting message:", error);
    return NextResponse.json(
      { error: "Failed to delete message" },
      { status: 500 },
    );
  }
}
