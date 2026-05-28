import { prisma } from "@/lib/prisma";
import { ApiResponse, jsonResponse } from "@/lib/api-response";

const methodMap = {
  listening: {
    model: "listeningQuestion",
    shape: (item) => ({
      id: item.id,
      level: item.level,
      audioUrl: item.audioUrl,
      sentence: item.sentence,
      clozeText: item.clozeText,
      options: item.options,
      answer: item.answer,
    }),
  },
  vocabulary: {
    model: "vocabularyQuestion",
    shape: (item) => ({
      id: item.id,
      level: item.level,
      question: item.question,
      options: item.options,
      answer: item.answer,
      skill: item.skill,
    }),
  },
  grammar: {
    model: "grammarQuestion",
    shape: (item) => ({
      id: item.id,
      level: item.level,
      sentence: item.sentence,
      words: item.words,
      wrongIndex: item.wrongIndex,
      choices: item.choices,
      answer: item.answer,
    }),
  },
};

export async function GET(req, { params }) {
  const paramsObj = await params;
  const method = String(paramsObj.method || "").toLowerCase();
  const config = methodMap[method];

  if (!config) {
    return jsonResponse(ApiResponse.notFound("Unknown learning method"), 404);
  }

  const { searchParams } = new URL(req.url);
  const level = searchParams.get("level") || "A1";
  const limit = Math.min(parseInt(searchParams.get("limit") || "5", 10), 5);

  let records = [];
  try {
    const tableMap = {
      listening: "listening_questions",
      vocabulary: "vocabulary_questions",
      grammar: "grammar_questions",
    };
    const table = tableMap[method];
    if (!table)
      return jsonResponse(ApiResponse.notFound("Unknown learning method"), 404);

    const raw = `SELECT * FROM ${table} WHERE level = ? ORDER BY RAND() LIMIT ?`;
    // @ts-ignore
    records = await prisma.$queryRawUnsafe(raw, level, limit);
  } catch (err) {
    return jsonResponse(
      ApiResponse.internalError(err.message || "DB error"),
      500,
    );
  }

  return jsonResponse(
    ApiResponse.success({
      method,
      level,
      total: records.length,
      questions: records.map(config.shape),
    }),
  );
}
