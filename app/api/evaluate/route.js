import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

IMPORTANT EVALUATION RULES:
1. If the user's translation is completely off-topic, irrelevant, or doesn't make sense in context, give score 0-20 with status "SALAH"
2. If the translation is in the wrong language, give score 0 with status "SALAH"
3. If the translation is contextually far from the original meaning, give score 0-30 with status "SALAH"
4. Only give higher scores if the translation actually attempts to convey the meaning, even if imperfect

Evaluate the translation and provide:
1. A score from 0-100 (where 100 is perfect)
2. A status: "BENAR" (90-100), "HAMPIR_BENAR" (60-89), or "SALAH" (<60)
3. The correct ${isEnglishSource ? "Indonesian" : "English"} translation
4. Brief feedback in Indonesian language (max 2 sentences)

Respond in this EXACT JSON format:
{
  "score": <number 0-100>,
  "status": "<BENAR|HAMPIR_BENAR|SALAH>",
  "correctTranslation": "<correct ${isEnglishSource ? "Indonesian" : "English"} translation>",
  "feedback": "<brief feedback in Indonesian>"
}

Only return the JSON, nothing else.`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let evaluation;

    try {
      // Clean the response and extract JSON
      let responseText = response.text().trim();

      // Try to find JSON object with balanced braces
      const firstBrace = responseText.indexOf("{");
      if (firstBrace === -1) {
        throw new Error("No JSON found in response");
      }

      // Find matching closing brace
      let braceCount = 0;
      let endIndex = -1;
      for (let i = firstBrace; i < responseText.length; i++) {
        if (responseText[i] === "{") braceCount++;
        if (responseText[i] === "}") braceCount--;
        if (braceCount === 0) {
          endIndex = i + 1;
          break;
        }
      }

      if (endIndex === -1) {
        throw new Error("Malformed JSON in response");
      }

      const jsonStr = responseText.substring(firstBrace, endIndex);
      evaluation = JSON.parse(jsonStr);

      // Validate required fields
      if (
        !evaluation.score ||
        !evaluation.status ||
        !evaluation.correctTranslation ||
        !evaluation.feedback
      ) {
        throw new Error("Missing required fields in evaluation");
      }
    } catch (parseError) {
      console.error("Error parsing Gemini response:", parseError);
      console.error("Raw response:", response.text());
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
      {
        error:
          "Failed to evaluate translation. Make sure your Gemini API key is configured.",
      },
      { status: 500 },
    );
  }
}
