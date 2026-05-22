/**
 * Achievement system unit tests
 * Tests achievement awards, progress tracking, and leaderboards
 */

import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import {
  awardAchievement,
  checkAndAwardAchievement,
  awardMultipleAchievements,
  getUserAchievements,
  getAchievementProgress,
  hasAchievement,
  getAchievementLeaderboard,
  AchievementDefinitions,
} from "@/lib/achievements";
import { prisma } from "@/lib/prisma";

// Mock createNotification
jest.mock("@/lib/notifications", () => ({
  createNotification: jest.fn().mockResolvedValue({}),
  NotificationType: {
    SYSTEM: "SYSTEM",
  },
}));

jest.mock("@/lib/logger", () => ({
  apiLogger: {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

describe("Achievement System", () => {
  const testUserId = "test-user-1";
  const testUserId2 = "test-user-2";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("awardAchievement", () => {
    it("should award achievement successfully", async () => {
      prisma.achievement.findUnique.mockResolvedValue(null);
      const mockAchievement = {
        id: "ach-1",
        userId: testUserId,
        type: "FIRST_QUIZ",
        title: "Kuis Pertama",
        points: 10,
        unlockedAt: new Date(),
      };
      prisma.achievement.create.mockResolvedValue(mockAchievement);

      const result = await awardAchievement(testUserId, "FIRST_QUIZ");

      expect(result).toEqual(mockAchievement);
      expect(prisma.achievement.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: testUserId,
          type: "FIRST_QUIZ",
          points: 10,
        }),
      });
    });

    it("should return null if achievement already exists", async () => {
      const existingAchievement = {
        id: "ach-1",
        userId: testUserId,
        type: "FIRST_QUIZ",
      };
      prisma.achievement.findUnique.mockResolvedValue(existingAchievement);

      const result = await awardAchievement(testUserId, "FIRST_QUIZ");

      expect(result).toBeNull();
      expect(prisma.achievement.create).not.toHaveBeenCalled();
    });

    it("should throw error for invalid achievement type", async () => {
      await expect(
        awardAchievement(testUserId, "INVALID_TYPE"),
      ).rejects.toThrow("Unknown achievement type");
    });

    it("should throw error if userId is missing", async () => {
      await expect(awardAchievement(null, "FIRST_QUIZ")).rejects.toThrow(
        "userId and achievementType are required",
      );
    });

    it("should award all 20 achievement types", async () => {
      prisma.achievement.findUnique.mockResolvedValue(null);
      prisma.achievement.create.mockImplementation(({ data }) =>
        Promise.resolve({
          id: `ach-${data.type}`,
          ...data,
          unlockedAt: new Date(),
        }),
      );

      const types = Object.keys(AchievementDefinitions);
      expect(types.length).toBe(24);

      for (const type of types) {
        const result = await awardAchievement(testUserId, type);
        expect(result.type).toBe(type);
        expect(result.title).toBe(AchievementDefinitions[type].title);
      }
    });
  });

  describe("checkAndAwardAchievement", () => {
    it("should award achievement when condition is true", async () => {
      prisma.achievement.findUnique.mockResolvedValue(null);
      const mockAchievement = {
        id: "ach-1",
        type: "FRIEND_MASTER",
        points: 50,
      };
      prisma.achievement.create.mockResolvedValue(mockAchievement);

      const result = await checkAndAwardAchievement(
        testUserId,
        "FRIEND_MASTER",
        true,
      );

      expect(result).toEqual(mockAchievement);
    });

    it("should not award achievement when condition is false", async () => {
      const result = await checkAndAwardAchievement(
        testUserId,
        "FRIEND_MASTER",
        false,
      );

      expect(result).toBeNull();
      expect(prisma.achievement.create).not.toHaveBeenCalled();
    });
  });

  describe("awardMultipleAchievements", () => {
    it("should award multiple achievements", async () => {
      prisma.achievement.findUnique.mockResolvedValue(null);
      prisma.achievement.create.mockImplementation(({ data }) =>
        Promise.resolve({
          id: `ach-${data.type}`,
          ...data,
        }),
      );

      const types = ["FIRST_QUIZ", "FIRST_LESSON", "FIRST_FRIEND"];
      const results = await awardMultipleAchievements(testUserId, types);

      expect(results.length).toBe(3);
      expect(results[0].type).toBe("FIRST_QUIZ");
      expect(results[1].type).toBe("FIRST_LESSON");
      expect(results[2].type).toBe("FIRST_FRIEND");
    });

    it("should skip already unlocked achievements", async () => {
      prisma.achievement.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ type: "FIRST_LESSON", userId: testUserId })
        .mockResolvedValueOnce(null);

      prisma.achievement.create
        .mockResolvedValueOnce({ type: "FIRST_QUIZ", id: "ach-1" })
        .mockResolvedValueOnce({ type: "FIRST_FRIEND", id: "ach-2" });

      const results = await awardMultipleAchievements(testUserId, [
        "FIRST_QUIZ",
        "FIRST_LESSON",
        "FIRST_FRIEND",
      ]);

      expect(results.length).toBe(2);
      expect(results[0].type).toBe("FIRST_QUIZ");
      expect(results[1].type).toBe("FIRST_FRIEND");
    });
  });

  describe("getUserAchievements", () => {
    it("should get user achievements with totals", async () => {
      const mockAchievements = [
        {
          id: "ach-1",
          type: "FIRST_QUIZ",
          points: 10,
          unlockedAt: new Date(),
        },
        {
          id: "ach-2",
          type: "QUIZ_MASTER",
          points: 100,
          unlockedAt: new Date(),
        },
      ];
      prisma.achievement.findMany.mockResolvedValue(mockAchievements);

      const result = await getUserAchievements(testUserId);

      expect(result.achievements).toEqual(mockAchievements);
      expect(result.totalPoints).toBe(110);
      expect(result.count).toBe(2);
    });

    it("should handle user with no achievements", async () => {
      prisma.achievement.findMany.mockResolvedValue([]);

      const result = await getUserAchievements(testUserId);

      expect(result.achievements).toEqual([]);
      expect(result.totalPoints).toBe(0);
      expect(result.count).toBe(0);
    });
  });

  describe("getAchievementProgress", () => {
    it("should calculate progress correctly", async () => {
      const achievements = Array(10)
        .fill(null)
        .map((_, i) => ({
          type: Object.keys(AchievementDefinitions)[i],
          points: 10,
        }));

      prisma.achievement.findMany.mockResolvedValue(achievements);

      const result = await getAchievementProgress(testUserId);

      expect(result.unlocked).toBe(10);
      expect(result.total).toBe(24);
      expect(result.percentage).toBe(42);
      expect(result.nextAchievements).toBeDefined();
      expect(result.nextAchievements.length).toBeLessThanOrEqual(3);
    });

    it("should show 100% progress when all achievements unlocked", async () => {
      const allTypes = Object.keys(AchievementDefinitions);
      const achievements = allTypes.map((type, i) => ({
        type,
        points: 10 + i,
      }));

      prisma.achievement.findMany.mockResolvedValue(achievements);

      const result = await getAchievementProgress(testUserId);

      expect(result.percentage).toBe(100);
      expect(result.nextAchievements).toEqual([]);
    });
  });

  describe("hasAchievement", () => {
    it("should return true if achievement exists", async () => {
      const achievement = { id: "ach-1", type: "FIRST_QUIZ" };
      prisma.achievement.findUnique.mockResolvedValue(achievement);

      const result = await hasAchievement(testUserId, "FIRST_QUIZ");

      expect(result).toBe(true);
    });

    it("should return false if achievement does not exist", async () => {
      prisma.achievement.findUnique.mockResolvedValue(null);

      const result = await hasAchievement(testUserId, "FIRST_QUIZ");

      expect(result).toBe(false);
    });

    it("should return false on error", async () => {
      prisma.achievement.findUnique.mockRejectedValue(new Error("DB error"));

      const result = await hasAchievement(testUserId, "FIRST_QUIZ");

      expect(result).toBe(false);
    });
  });

  describe("getAchievementLeaderboard", () => {
    it("should return top users by achievement count", async () => {
      const mockUsers = [
        {
          id: testUserId,
          name: "User 1",
          username: "user1",
          avatar: "avatar1.jpg",
          achievements: Array(15).fill({ points: 10 }),
        },
        {
          id: testUserId2,
          name: "User 2",
          username: "user2",
          avatar: "avatar2.jpg",
          achievements: Array(10).fill({ points: 10 }),
        },
      ];

      prisma.user.findMany.mockResolvedValue(mockUsers);

      const result = await getAchievementLeaderboard(10);

      expect(result.length).toBe(2);
      expect(result[0].id).toBe(testUserId);
      expect(result[0].achievementCount).toBe(15);
      expect(result[0].totalPoints).toBe(150);
    });

    it("should respect limit parameter", async () => {
      const mockUsers = Array(5)
        .fill(null)
        .map((_, i) => ({
          id: `user-${i}`,
          achievements: Array(10 - i).fill({ points: 10 }),
        }));

      prisma.user.findMany.mockResolvedValue(mockUsers);

      await getAchievementLeaderboard(5);

      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ take: 5 }),
      );
    });
  });

  describe("Achievement Definitions", () => {
    it("should have exactly 24 achievement types", () => {
      expect(Object.keys(AchievementDefinitions).length).toBe(24);
    });

    it("should have all required properties for each achievement", () => {
      Object.entries(AchievementDefinitions).forEach(([type, def]) => {
        expect(def.title).toBeDefined();
        expect(def.description).toBeDefined();
        expect(def.icon).toBeDefined();
        expect(def.badgeColor).toBeDefined();
        expect(def.points).toBeGreaterThan(0);
        expect(typeof def.title).toBe("string");
        expect(typeof def.description).toBe("string");
        expect(typeof def.icon).toBe("string");
      });
    });

    it("should have correct categorization of achievements", () => {
      const socialAchievements = [
        "FIRST_FRIEND",
        "FRIEND_MASTER",
        "SOCIAL_BUTTERFLY",
      ];
      const learningAchievements = [
        "FIRST_LESSON",
        "LEARNING_STREAK_7",
        "POLYGLOT",
      ];
      const quizAchievements = ["FIRST_QUIZ", "QUIZ_MASTER", "PERFECT_SCORE"];

      socialAchievements.forEach((type) => {
        expect(AchievementDefinitions[type]).toBeDefined();
      });
      learningAchievements.forEach((type) => {
        expect(AchievementDefinitions[type]).toBeDefined();
      });
      quizAchievements.forEach((type) => {
        expect(AchievementDefinitions[type]).toBeDefined();
      });
    });
  });

  describe("Integration scenarios", () => {
    it("should handle quest completion flow", async () => {
      // Simulate: User takes quiz, gets perfect score, takes 5 more
      prisma.achievement.findUnique.mockResolvedValue(null);
      prisma.achievement.create.mockImplementation(({ data }) =>
        Promise.resolve({
          id: `ach-${data.type}`,
          ...data,
        }),
      );

      // First quiz attempt
      const perfect1 = await awardAchievement(testUserId, "FIRST_QUIZ");
      expect(perfect1.type).toBe("FIRST_QUIZ");

      // Perfect score
      const perfect2 = await awardAchievement(testUserId, "PERFECT_SCORE");
      expect(perfect2.type).toBe("PERFECT_SCORE");

      // 5 quiz attempts triggers QUIZ_MASTER
      const quizMaster = await checkAndAwardAchievement(
        testUserId,
        "QUIZ_WIZARD",
        true,
      );
      expect(quizMaster.type).toBe("QUIZ_WIZARD");
    });

    it("should prevent duplicate achievement awards", async () => {
      const achievement = { type: "FIRST_FRIEND", points: 10 };
      prisma.achievement.findUnique.mockResolvedValue(achievement);

      const result1 = await awardAchievement(testUserId, "FIRST_FRIEND");
      expect(result1).toBeNull();

      const result2 = await awardAchievement(testUserId, "FIRST_FRIEND");
      expect(result2).toBeNull();

      expect(prisma.achievement.create).not.toHaveBeenCalled();
    });
  });
});
