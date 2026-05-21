import { prisma } from "@/lib/prisma";
import { ApiResponse, jsonResponse } from "@/lib/api-response";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const level = searchParams.get("level") || "A1";
    const take = Math.min(parseInt(searchParams.get("limit") || "5", 10), 5);

    const questions = await prisma.vocabularyQuestion.findMany({
      where: { level },
      orderBy: { createdAt: "asc" },
      take,
    });

    const formatted = questions.map((q) => ({
      id: q.id,
      question: q.question,
      options: q.options,
      answer: q.answer,
      skill: q.skill,
    }));

    return jsonResponse(
      ApiResponse.success({
        level,
        questions: formatted,
      }),
    );
  } catch (err) {
    return jsonResponse(ApiResponse.internalError(err.message), 500);
  }
}
