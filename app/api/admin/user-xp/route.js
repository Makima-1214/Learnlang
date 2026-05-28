import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    const role = session.user.role;
    if (!(role === "ADMIN" || role === "admin" || role === "Admin")) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
      });
    }

    const body = await req.json();
    const { userId, delta, setTo } = body;

    if (!userId) {
      return new Response(JSON.stringify({ error: "userId is required" }), {
        status: 400,
      });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return new Response(JSON.stringify({ error: "User not found" }), {
        status: 404,
      });
    }

    let updated;
    if (typeof setTo === "number") {
      updated = await prisma.user.update({
        where: { id: userId },
        data: { xp: setTo },
      });
    } else if (typeof delta === "number") {
      const newXp = Math.max(0, (user.xp || 0) + delta);
      updated = await prisma.user.update({
        where: { id: userId },
        data: { xp: newXp },
      });
    } else {
      return new Response(
        JSON.stringify({ error: "delta or setTo is required" }),
        {
          status: 400,
        },
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        user: { id: updated.id, xp: updated.xp },
      }),
      {
        status: 200,
      },
    );
  } catch (err) {
    console.error("/api/admin/user-xp error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
    });
  }
}
