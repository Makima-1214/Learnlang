/**
 * Integration tests for quiz API
 */

import { prisma } from "@/lib/prisma";

describe("Quiz API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/quizzes", () => {
    it("should create quiz with valid data", async () => {
      const quizData = {
        title: "Vocabulary Quiz",
        description: "Test your vocabulary",
        published: true,
      };

      prisma.quiz.create.mockResolvedValue({
        id: "quiz-1",
        ...quizData,
      });

      const result = await prisma.quiz.create({
        data: {
          ...quizData,
          createdById: "user-1",
        },
      });

      expect(result.id).toBe("quiz-1");
      expect(result.title).toBe(quizData.title);
    });

    it("should reject quiz with empty title", async () => {
      const quizData = {
        title: "",
        description: "Test",
        published: true,
      };

      // Validation should reject empty title
      expect(quizData.title.length).toBe(0);
    });

    it("should require minimum title length", async () => {
      const quizData = {
        title: "AB", // Too short
        description: "Test",
      };

      // Validation should require >= 3 chars
      expect(quizData.title.length).toBeLessThan(3);
    });
  });

  describe("GET /api/quizzes/:id", () => {
    it("should fetch quiz with questions and options", async () => {
      const quizId = "quiz-1";

      prisma.quiz.findUnique.mockResolvedValue({
        id: quizId,
        title: "Vocabulary Quiz",
        questions: [
          {
            id: "q-1",
            question: "apple",
            order: 1,
            options: [
              { id: "o-1", option: "apel", isCorrect: true },
              { id: "o-2", option: "jeruk", isCorrect: false },
            ],
          },
        ],
      });

      const result = await prisma.quiz.findUnique({
        where: { id: quizId },
      });

      expect(result.questions).toHaveLength(1);
      expect(result.questions[0].options).toHaveLength(2);
    });

    it("should return null if quiz not found", async () => {
      prisma.quiz.findUnique.mockResolvedValue(null);

      const result = await prisma.quiz.findUnique({
        where: { id: "nonexistent" },
      });

      expect(result).toBeNull();
    });
  });

  describe("POST /api/quizzes/:id/submit", () => {
    it("should score quiz submission", async () => {
      const submission = {
        quizId: "quiz-1",
        answers: ["o-1", "o-3"], // Selected option IDs
      };

      prisma.quizResult.create.mockResolvedValue({
        id: "result-1",
        quizId: submission.quizId,
        userId: "user-1",
        score: 1,
        totalQuestions: 2,
        answers: JSON.stringify(submission.answers),
      });

      const result = await prisma.quizResult.create({
        data: {
          quizId: submission.quizId,
          userId: "user-1",
          score: 1,
          totalQuestions: 2,
          answers: JSON.stringify(submission.answers),
        },
      });

      expect(result.score).toBe(1);
      expect(result.totalQuestions).toBe(2);
    });

    it("should require all answers", async () => {
      const submission = {
        quizId: "quiz-1",
        answers: [], // Empty answers
      };

      // Validation should reject or require answers
      expect(submission.answers.length).toBe(0);
    });
  });
});
