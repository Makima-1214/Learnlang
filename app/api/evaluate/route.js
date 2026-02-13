import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sourceSentence, userTranslation, mode, difficulty } =
      await request.json();

    if (!sourceSentence || !userTranslation || !mode || !difficulty) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const isEnglishSource = mode === "EN_ID";
    const sourceLanguage = isEnglishSource ? "en" : "id";
    const targetLanguage = isEnglishSource ? "id" : "en";

    const prompt = `You are a language learning evaluator. Evaluate the ${isEnglishSource ? "Indonesian translation of an English" : "English translation of an Indonesian"} sentence.

${isEnglishSource ? "English" : "Indonesian"} sentence: "${sourceSentence}"
User's ${isEnglishSource ? "Indonesian" : "English"} translation: "${userTranslation}"

Evaluate the translation and provide:
1. A score from 0-100 (where 100 is perfect)
2. A status: "BENAR" (90-100), "HAMPIR_BENAR" (60-89), or "SALAH" (<60)
3. The correct ${isEnglishSource ? "Indonesian" : "English"} translation
4. Brief feedback in ${isEnglishSource ? "Indonesian" : "English"} (max 2 sentences)

Respond in this EXACT JSON format:
{
  "score": <number 0-100>,
  "status": "<BENAR|HAMPIR_BENAR|SALAH>",
  "correctTranslation": "<correct ${isEnglishSource ? "Indonesian" : "English"} translation>",
  "feedback": "<brief feedback>"
}

Only return the JSON, nothing else.`;

    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemma2:2b",
        prompt: prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to evaluate from Ollama");
    }

    const data = await response.json();
    let evaluation;

    try {
      const jsonMatch = data.response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        evaluation = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Error parsing Ollama response:", parseError);
      evaluation = {
        score: 50,
        status: "HAMPIR_BENAR",
        correctTranslation: "Translation could not be evaluated",
        feedback: "System is having difficulty evaluating. Please try again.",
      };
    }

    // Ensure score is within bounds
    evaluation.score = Math.max(0, Math.min(100, evaluation.score));

    // Normalize status to enum values
    const statusMap = {
      benar: "BENAR",
      BENAR: "BENAR",
      "hampir benar": "HAMPIR_BENAR",
      hampir_benar: "HAMPIR_BENAR",
      HAMPIR_BENAR: "HAMPIR_BENAR",
      salah: "SALAH",
      SALAH: "SALAH",
    };
    evaluation.status = statusMap[evaluation.status] || "HAMPIR_BENAR";

    // Save to database
    try {
      await prisma.history.create({
        data: {
          userId: session.user.id,
          mode: mode,
          sourceLanguage: sourceLanguage,
          targetLanguage: targetLanguage,
          sourceSentence: sourceSentence,
          userTranslation: userTranslation,
          correctTranslation: evaluation.correctTranslation,
          score: evaluation.score,
          status: evaluation.status,
          feedback: evaluation.feedback,
          difficulty: difficulty,
        },
      });
    } catch (dbError) {
      console.error("Error saving to database:", dbError);
      // Continue even if database save fails
    }

    return NextResponse.json(evaluation);
  } catch (error) {
    console.error("Error evaluating translation:", error);
    return NextResponse.json(
      { error: "Failed to evaluate translation. Make sure Ollama is running." },
      { status: 500 },
    );
  }
}
