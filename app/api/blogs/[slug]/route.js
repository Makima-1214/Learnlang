import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET single blog by slug
export async function GET(request, { params }) {
  try {
    const { slug } = await params;
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.role === "ADMIN";

    const blog = await prisma.blog.findUnique({
      where: { slug },
      include: {
        author: { select: { name: true, email: true } },
      },
    });

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    // Non-admin can only see published blogs
    if (!blog.published && !isAdmin) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json(blog);
  } catch (error) {
    console.error("Error fetching blog:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog" },
      { status: 500 },
    );
  }
}

// PUT update blog (Admin only)
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const body = await request.json();
    const { title, content, excerpt, coverImage, published } = body;

    const blog = await prisma.blog.findUnique({ where: { slug } });
    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    // Generate new slug if title changed
    let newSlug = slug;
    if (title && title !== blog.title) {
      newSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      const existing = await prisma.blog.findUnique({
        where: { slug: newSlug },
      });
      if (existing && existing.id !== blog.id) {
        newSlug = `${newSlug}-${Date.now()}`;
      }
    }

    const updated = await prisma.blog.update({
      where: { slug },
      data: {
        ...(title && { title }),
        slug: newSlug,
        ...(content && { content }),
        ...(excerpt !== undefined && { excerpt }),
        ...(coverImage !== undefined && { coverImage }),
        ...(published !== undefined && { published }),
      },
      include: {
        author: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating blog:", error);
    return NextResponse.json(
      { error: "Failed to update blog" },
      { status: 500 },
    );
  }
}

// DELETE blog (Admin only)
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { slug } = await params;
    const blog = await prisma.blog.findUnique({ where: { slug } });
    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    await prisma.blog.delete({ where: { slug } });
    return NextResponse.json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Error deleting blog:", error);
    return NextResponse.json(
      { error: "Failed to delete blog" },
      { status: 500 },
    );
  }
}
