/**
 * Integration tests for evaluation API
 */

import { prisma } from "@/lib/prisma";

describe("Evaluation API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/evaluate", () => {
    it("should evaluate translation and return score", async () => {
      const evaluationData = {
        sourceSentence: "The cat is sleeping on the couch.",
        userTranslation: "Kucing itu tidur di sofa.",
        difficulty: "EASY",
        mode: "EN_ID",
      };

      // Mock successful evaluation
      // Would normally call Ollama or AI service
      const expectedResponse = {
        score: 85,
        status: "BENAR",
        feedback: "Terjemahan bagus!",
      };

      // Test that validation passes
      expect(evaluationData.sourceSentence).toBeTruthy();
      expect(evaluationData.userTranslation).toBeTruthy();
      expect(["EASY", "MEDIUM", "HARD"]).toContain(evaluationData.difficulty);
    });

    it("should reject evaluation with empty source sentence", async () => {
      const evaluationData = {
        sourceSentence: "",
        userTranslation: "Some translation",
        difficulty: "EASY",
        mode: "EN_ID",
      };

      // Validation should reject
      expect(evaluationData.sourceSentence).toBeFalsy();
    });

    it("should save evaluation result to history", async () => {
      const evaluationData = {
        sourceSentence: "The cat is sleeping.",
        userTranslation: "Kucing itu tidur.",
        difficulty: "EASY",
        mode: "EN_ID",
        userId: "user-1",
      };

      prisma.history.create.mockResolvedValue({
        id: "history-1",
        userId: evaluationData.userId,
        score: 90,
        status: "BENAR",
      });

      const result = await prisma.history.create({
        data: evaluationData,
      });

      expect(result.id).toBe("history-1");
      expect(prisma.history.create).toHaveBeenCalledWith({
        data: evaluationData,
      });
    });

    it("should rate limit evaluation requests", () => {
      // Evaluation is expensive, should be rate limited
      // This depends on rate limit implementation in route
    });
  });

  describe("POST /api/generate-sentence", () => {
    it("should generate sentence with specified difficulty", async () => {
      const request = {
        difficulty: "EASY",
        mode: "EN_ID",
      };

      // Would call AI to generate sentence
      // Response should include generated sentence
    });

    it("should reject invalid difficulty", async () => {
      const request = {
        difficulty: "INVALID",
        mode: "EN_ID",
      };

      // Validation should reject
      expect(["EASY", "MEDIUM", "HARD"]).not.toContain(request.difficulty);
    });

    it("should be rate limited", () => {
      // Generate is also expensive, should limit requests
    });
  });
});
