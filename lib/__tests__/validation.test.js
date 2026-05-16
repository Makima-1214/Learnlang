/**
 * Unit tests for validation utilities
 */

import {
  schemas,
  validateEmail,
  validatePassword,
  validateString,
} from "@/lib/validation";

describe("Validation Utilities", () => {
  describe("validateEmail", () => {
    it("should accept valid emails", () => {
      expect(validateEmail("user@example.com")).toBe(true);
      expect(validateEmail("test.user@domain.co.uk")).toBe(true);
    });

    it("should reject invalid emails", () => {
      expect(validateEmail("notanemail")).toBe(false);
      expect(validateEmail("@example.com")).toBe(false);
      expect(validateEmail("user@")).toBe(false);
    });
  });

  describe("validatePassword", () => {
    it("should accept passwords >= 6 chars", () => {
      expect(validatePassword("password123")).toBe(true);
      expect(validatePassword("abc123")).toBe(true);
    });

    it("should reject short passwords", () => {
      expect(validatePassword("abc")).toBe(false);
      expect(validatePassword("")).toBeFalsy();
    });
  });

  describe("validateString", () => {
    it("should validate string length", () => {
      expect(validateString("hello", 1, 10)).toBe(true);
      expect(validateString("hello", 5, 10)).toBe(true);
    });

    it("should reject strings outside bounds", () => {
      expect(validateString("hi", 3, 10)).toBe(false);
      expect(validateString("hello world", 1, 5)).toBe(false);
    });
  });

  describe("registerSchema", () => {
    it("should validate correct registration data", () => {
      const result = schemas.registerSchema({
        email: "user@example.com",
        password: "password123",
        name: "John Doe",
        username: "johndoe",
      });
      expect(result.valid).toBe(true);
    });

    it("should reject invalid email", () => {
      const result = schemas.registerSchema({
        email: "notanemail",
        password: "password123",
        name: "John Doe",
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Invalid email");
    });

    it("should reject short password", () => {
      const result = schemas.registerSchema({
        email: "user@example.com",
        password: "abc",
        name: "John Doe",
      });
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain("Password must be at least");
    });
  });

  describe("evaluateSchema", () => {
    it("should validate correct evaluation data", () => {
      const result = schemas.evaluateSchema({
        sourceSentence: "The cat is sleeping",
        userTranslation: "Kucing itu sedang tidur",
        difficulty: "EASY",
        mode: "EN_ID",
      });
      expect(result.valid).toBe(true);
    });

    it("should reject invalid difficulty", () => {
      const result = schemas.evaluateSchema({
        sourceSentence: "The cat is sleeping",
        userTranslation: "Kucing itu sedang tidur",
        difficulty: "INVALID",
        mode: "EN_ID",
      });
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("Invalid difficulty");
    });
  });

  describe("quizAnswerSchema", () => {
    it("should validate correct quiz answers", () => {
      const result = schemas.quizAnswerSchema({
        quizId: "quiz-123",
        answers: ["opt-1", "opt-2", "opt-3"],
      });
      expect(result.valid).toBe(true);
    });

    it("should reject non-array answers", () => {
      const result = schemas.quizAnswerSchema({
        quizId: "quiz-123",
        answers: "not-an-array",
      });
      expect(result.valid).toBe(false);
    });
  });
});
