import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const { difficulty, mode } = await request.json();

    const isEnglishSource = mode === "EN_ID";
    const difficultyLevel = difficulty || "MEDIUM";

    const languageInstruction = isEnglishSource
      ? "English sentence"
      : "Indonesian sentence (kalimat bahasa Indonesia)";

    const complexityGuide = {
      EASY: isEnglishSource
        ? "Simple with common words (5-8 words)"
        : "Sederhana dengan kata-kata umum (5-8 kata)",
      MEDIUM: isEnglishSource
        ? "Moderate complexity (8-12 words)"
        : "Kompleksitas sedang (8-12 kata)",
      HARD: isEnglishSource
        ? "Complex with varied vocabulary (12-20 words)"
        : "Kompleks dengan kosa kata beragam (12-20 kata)",
    };

    const prompt = `Generate one random ${languageInstruction} for language learning practice.
Difficulty level: ${difficultyLevel}
The sentence should be:
- Clear and grammatically correct
- Suitable for translation practice
- ${complexityGuide[difficultyLevel]}
${!isEnglishSource ? "- Use proper Indonesian grammar and vocabulary" : ""}

Only return the ${isEnglishSource ? "English" : "Indonesian"} sentence, nothing else. No explanations.`;

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const sentence = response.text().trim();

    return NextResponse.json({ sentence });
  } catch (error) {
    console.error("Error generating sentence:", error);
    return NextResponse.json(
      {
        error:
          "Failed to generate sentence. Make sure your Gemini API key is configured.",
      },
      { status: 500 },
    );
  }
}
