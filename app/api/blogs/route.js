import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { awardBlogAuthorAchievements } from "@/lib/achievements";

// GET all blogs (public: published only, admin: all)
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all") === "true";
    const isAdmin = session?.user?.role === "ADMIN";

    const blogs = await prisma.blog.findMany({
      where: all && isAdmin ? {} : { published: true },
      include: {
        author: { select: { name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(blogs);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return NextResponse.json(
      { error: "Failed to fetch blogs" },
      { status: 500 },
    );
  }
}

// POST create a new blog (Admin only)
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, content, excerpt, coverImage, published } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 },
      );
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    // Check for existing slug
    const existing = await prisma.blog.findUnique({ where: { slug } });
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    const blog = await prisma.blog.create({
      data: {
        title,
        slug: finalSlug,
        content,
        excerpt: excerpt || content.substring(0, 150) + "...",
        coverImage: coverImage || null,
        published: published || false,
        authorId: session.user.id,
      },
      include: {
        author: { select: { name: true, email: true } },
      },
    });

    try {
      await awardBlogAuthorAchievements(session.user.id);
    } catch (achievementError) {
      console.error("Failed to award blog achievements:", achievementError);
    }

    return NextResponse.json(blog, { status: 201 });
  } catch (error) {
    console.error("Error creating blog:", error);
    return NextResponse.json(
      { error: "Failed to create blog" },
      { status: 500 },
    );
  }
}
