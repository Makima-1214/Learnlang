import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { emitReactionUpdate } from "@/lib/socket";

// GET all reactions for a blog
export async function GET(request, { params }) {
  try {
    const { slug } = await params;

    const blog = await prisma.blog.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    const reactions = await prisma.reaction.findMany({
      where: { blogId: blog.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Group reactions by emoji with counts
    const reactionSummary = reactions.reduce((acc, reaction) => {
      if (!acc[reaction.emoji]) {
        acc[reaction.emoji] = {
          emoji: reaction.emoji,
          count: 0,
          users: [],
          hasReacted: false,
        };
      }
      acc[reaction.emoji].count++;
      acc[reaction.emoji].users.push({
        id: reaction.user.id,
        name: reaction.user.name,
      });
      return acc;
    }, {});

    // Check if current user has reacted
    const session = await getServerSession(authOptions);
    if (session) {
      Object.values(reactionSummary).forEach((summary) => {
        summary.hasReacted = summary.users.some(
          (u) => u.id === session.user.id,
        );
      });
    }

    return NextResponse.json({
      summary: Object.values(reactionSummary),
      total: reactions.length,
    });
  } catch (error) {
    console.error("Error fetching reactions:", error);
    return NextResponse.json(
      { error: "Failed to fetch reactions" },
      { status: 500 },
    );
  }
}

// POST toggle a reaction
export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const body = await request.json();
    const { emoji } = body;

    if (!emoji) {
      return NextResponse.json({ error: "Emoji is required" }, { status: 400 });
    }

    const blog = await prisma.blog.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    // Check if user already reacted with this emoji
    const existingReaction = await prisma.reaction.findUnique({
      where: {
        blogId_userId_emoji: {
          blogId: blog.id,
          userId: session.user.id,
          emoji: emoji,
        },
      },
    });

    if (existingReaction) {
      // Remove reaction (toggle off)
      await prisma.reaction.delete({
        where: { id: existingReaction.id },
      });
      
      // Emit real-time event
      emitReactionUpdate(slug, { action: "removed", emoji });
      
      return NextResponse.json({ action: "removed", emoji });
    } else {
      // Add reaction (toggle on)
      const reaction = await prisma.reaction.create({
        data: {
          emoji,
          blogId: blog.id,
          userId: session.user.id,
        },
      });
      
      // Emit real-time event
      emitReactionUpdate(slug, { action: "added", emoji });
      
      return NextResponse.json({ action: "added", emoji, reaction });
    }
  } catch (error) {
    console.error("Error toggling reaction:", error);
    return NextResponse.json(
      { error: "Failed to toggle reaction" },
      { status: 500 },
    );
  }
}
