/**
 * Universal Achievement System
 *
 * Provides reusable functions for awarding achievements across all features
 * (quizzes, learning, friends, blog, etc.)
 *
 * Usage:
 *   import { awardAchievement, checkAndAwardAchievement } from '@/lib/achievements';
 *
 *   // Award directly
 *   await awardAchievement(userId, 'FIRST_QUIZ');
 *
 *   // Check condition then award if unlocked
 *   const friendCount = await getFriendCount(userId);
 *   await checkAndAwardAchievement(userId, 'FRIEND_MASTER', friendCount >= 10);
 */

import { prisma } from "@/lib/prisma";
import { createNotification, NotificationType } from "@/lib/notifications";
import { apiLogger } from "@/lib/logger";

/**
 * Achievement definitions with metadata
 */
export const AchievementDefinitions = {
  // Social Achievements
  FIRST_FRIEND: {
    title: "Teman Pertama",
    description: "Menambahkan teman pertama Anda",
    icon: "👥",
    badgeColor: "blue",
    points: 10,
  },
  FRIEND_MASTER: {
    title: "Master Pertemanan",
    description: "Memiliki 10+ teman",
    icon: "👫",
    badgeColor: "purple",
    points: 50,
  },
  SOCIAL_BUTTERFLY: {
    title: "Kupu-kupu Sosial",
    description: "Memiliki 50+ pengikut",
    icon: "🦋",
    badgeColor: "pink",
    points: 100,
  },

  // Learning Achievements
  FIRST_LESSON: {
    title: "Pelajaran Pertama",
    description: "Menyelesaikan pelajaran pertama",
    icon: "📚",
    badgeColor: "green",
    points: 10,
  },
  LEARNING_STREAK_7: {
    title: "Giat Belajar",
    description: "Belajar selama 7 hari berturut-turut",
    icon: "🔥",
    badgeColor: "orange",
    points: 50,
  },
  LEARNING_STREAK_30: {
    title: "Pelajar Konsisten",
    description: "Belajar selama 30 hari berturut-turut",
    icon: "⭐",
    badgeColor: "gold",
    points: 200,
  },
  POLYGLOT: {
    title: "Poliglot",
    description: "Menyelesaikan 100 pelajaran",
    icon: "🌍",
    badgeColor: "blue",
    points: 100,
  },
  LANGUAGE_EXPERT: {
    title: "Ahli Bahasa",
    description: "Menyelesaikan 500 pelajaran",
    icon: "🎓",
    badgeColor: "gold",
    points: 500,
  },

  // Quiz Achievements
  FIRST_QUIZ: {
    title: "Kuis Pertama",
    description: "Menyelesaikan kuis pertama",
    icon: "❓",
    badgeColor: "blue",
    points: 10,
  },
  QUIZ_MASTER: {
    title: "Master Kuis",
    description: "Mendapatkan skor sempurna di 5 kuis",
    icon: "🏆",
    badgeColor: "gold",
    points: 100,
  },
  QUIZ_WIZARD: {
    title: "Penyihir Kuis",
    description: "Menyelesaikan 50 kuis",
    icon: "🧙",
    badgeColor: "purple",
    points: 150,
  },
  PERFECT_SCORE: {
    title: "Skor Sempurna",
    description: "Mendapatkan skor sempurna (100%) pada kuis",
    icon: "💯",
    badgeColor: "red",
    points: 50,
  },

  // Blogging Achievements
  FIRST_BLOG: {
    title: "Blogger Pemula",
    description: "Mempublikasikan blog pertama",
    icon: "✍️",
    badgeColor: "blue",
    points: 10,
  },
  BLOGGER: {
    title: "Blogger Aktif",
    description: "Mempublikasikan 5 blog post",
    icon: "📝",
    badgeColor: "orange",
    points: 50,
  },
  VIRAL_POST: {
    title: "Viral!",
    description: "Mendapatkan 100+ reaksi pada sebuah postingan",
    icon: "🚀",
    badgeColor: "red",
    points: 100,
  },
  COMMENTATOR: {
    title: "Komentator",
    description: "Meninggalkan 50 komentar",
    icon: "💬",
    badgeColor: "green",
    points: 50,
  },

  // Engagement Achievements
  EARLY_BIRD: {
    title: "Burung Pagi",
    description: "Bergabung dengan ruang diskusi pertama",
    icon: "🐦",
    badgeColor: "yellow",
    points: 10,
  },
  COMMUNITY_HELPER: {
    title: "Pembantu Komunitas",
    description: "Membantu 10 orang (reaksi/komentar)",
    icon: "🤝",
    badgeColor: "green",
    points: 100,
  },
  CONTENT_CREATOR: {
    title: "Pembuat Konten",
    description: "Membuat konten di 3+ fitur berbeda",
    icon: "🎨",
    badgeColor: "purple",
    points: 75,
  },
  ROOM_CREATOR: {
    title: "Pembuka Ruang",
    description: "Membuat room diskusi pertama",
    icon: "🏠",
    badgeColor: "cyan",
    points: 20,
  },
  ROOM_HOST: {
    title: "Tuan Rumah Komunitas",
    description: "Membuat 3 room diskusi",
    icon: "🗣️",
    badgeColor: "blue",
    points: 75,
  },
  DM_STARTER: {
    title: "Pembuka Obrolan",
    description: "Mengirim pesan pribadi pertama",
    icon: "💌",
    badgeColor: "pink",
    points: 20,
  },
  COMMUNITY_VOICE: {
    title: "Suara Komunitas",
    description: "Mengirim 25 pesan di room diskusi",
    icon: "📢",
    badgeColor: "emerald",
    points: 75,
  },
  LEGENDARY: {
    title: "Legenda Komunitas",
    description: "Mencapai 1000 poin pencapaian",
    icon: "👑",
    badgeColor: "gold",
    points: 300,
  },
};

/**
 * Award an achievement to a user
 *
 * @param {string} userId - User ID to award to
 * @param {string} achievementType - Achievement type key
 * @returns {Promise<Object|null>} Created achievement or null if already unlocked
 *
 * @example
 * const achievement = await awardAchievement(userId, 'FIRST_QUIZ');
 * // Returns achievement object or null
 */
export async function awardAchievement(userId, achievementType) {
  if (!userId || !achievementType) {
    throw new Error(
      "awardAchievement: userId and achievementType are required",
    );
  }

  const definition = AchievementDefinitions[achievementType];
  if (!definition) {
    throw new Error(`Unknown achievement type: ${achievementType}`);
  }

  try {
    // Check if already unlocked
    const existing = await prisma.achievement.findUnique({
      where: {
        userId_type: {
          userId,
          type: achievementType,
        },
      },
    });

    if (existing) {
      return null; // Already unlocked
    }

    // Create achievement
    const achievement = await prisma.achievement.create({
      data: {
        userId,
        type: achievementType,
        title: definition.title,
        description: definition.description,
        icon: definition.icon,
        badgeColor: definition.badgeColor,
        points: definition.points,
      },
    });

    // Send notification
    try {
      await createNotification({
        userId,
        type: NotificationType.SYSTEM,
        title: `🏆 Pencapaian Baru: ${definition.title}`,
        description: definition.description,
        icon: definition.icon,
        link: "/profile?tab=achievements",
        metadata: {
          achievementType,
          points: definition.points,
        },
      });
    } catch (error) {
      apiLogger.warn("Failed to send achievement notification:", {
        userId,
        achievementType,
        error: error.message,
      });
    }

    apiLogger.info("Achievement unlocked:", {
      userId,
      achievementType,
      points: definition.points,
    });

    return achievement;
  } catch (error) {
    apiLogger.error("Failed to award achievement:", {
      userId,
      achievementType,
      error: error.message,
    });
    throw error;
  }
}

/**
 * Check a condition and award achievement if true
 * Useful for milestone-based achievements
 *
 * @param {string} userId - User ID
 * @param {string} achievementType - Achievement type
 * @param {boolean} condition - Whether condition is met
 * @returns {Promise<Object|null>} Achievement or null
 *
 * @example
 * const quizCount = await getUserQuizCount(userId);
 * await checkAndAwardAchievement(userId, 'QUIZ_WIZARD', quizCount >= 50);
 */
export async function checkAndAwardAchievement(
  userId,
  achievementType,
  condition,
) {
  if (!condition) {
    return null;
  }

  return awardAchievement(userId, achievementType);
}

/**
 * Award multiple achievements at once
 *
 * @param {string} userId - User ID
 * @param {Array<string>} achievementTypes - Array of achievement type keys
 * @returns {Promise<Array>} Array of awarded achievements (excluding already unlocked)
 */
export async function awardMultipleAchievements(userId, achievementTypes) {
  if (!Array.isArray(achievementTypes)) {
    throw new Error("achievementTypes must be an array");
  }

  const results = await Promise.allSettled(
    achievementTypes.map((type) => awardAchievement(userId, type)),
  );

  return results
    .filter((r) => r.status === "fulfilled" && r.value !== null)
    .map((r) => r.value);
}

/**
 * Get all achievements for a user
 *
 * @param {string} userId - User ID
 * @returns {Promise<Array>} User's achievements with totals
 */
export async function getUserAchievements(userId) {
  try {
    const achievements = await prisma.achievement.findMany({
      where: { userId },
      orderBy: { unlockedAt: "desc" },
    });

    const totalPoints = achievements.reduce((sum, a) => sum + a.points, 0);

    return {
      achievements,
      totalPoints,
      count: achievements.length,
    };
  } catch (error) {
    apiLogger.error("Failed to get user achievements:", {
      userId,
      error: error.message,
    });
    throw error;
  }
}

/**
 * Get achievement progress
 * Calculates how many achievements user has unlocked vs total available
 *
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Progress data
 */
export async function getAchievementProgress(userId) {
  try {
    const achievements = await prisma.achievement.findMany({
      where: { userId },
    });

    const totalAvailable = Object.keys(AchievementDefinitions).length;
    const unlocked = achievements.length;
    const percentage = Math.round((unlocked / totalAvailable) * 100);

    return {
      unlocked,
      total: totalAvailable,
      percentage,
      nextAchievements: getNextAchievementSuggestions(achievements),
    };
  } catch (error) {
    apiLogger.error("Failed to get achievement progress:", {
      userId,
      error: error.message,
    });
    throw error;
  }
}

/**
 * Get suggestions for next achievements to unlock
 * Internal helper function
 */
function getNextAchievementSuggestions(unlockedAchievements) {
  const unlockedTypes = unlockedAchievements.map((a) => a.type);
  const available = Object.entries(AchievementDefinitions)
    .filter(([type]) => !unlockedTypes.includes(type))
    .slice(0, 3); // Return next 3 suggestions

  return available.map(([type, def]) => ({
    type,
    title: def.title,
    description: def.description,
    points: def.points,
  }));
}

/**
 * Get leaderboard of top users by achievement points
 *
 * @param {number} limit - Number of top users to return (default: 10)
 * @returns {Promise<Array>} Top users sorted by total points
 */
export async function getAchievementLeaderboard(limit = 10) {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        avatar: true,
        achievements: true,
      },
      orderBy: {
        achievements: {
          _count: "desc",
        },
      },
      take: limit,
    });

    return users.map((user) => {
      const totalPoints = user.achievements.reduce(
        (sum, a) => sum + a.points,
        0,
      );
      return {
        ...user,
        achievements: undefined, // Remove detailed achievements from leaderboard
        achievementCount: user.achievements.length,
        totalPoints,
      };
    });
  } catch (error) {
    apiLogger.error("Failed to get achievement leaderboard:", {
      error: error.message,
    });
    throw error;
  }
}

/**
 * Check if user has specific achievement
 *
 * @param {string} userId - User ID
 * @param {string} achievementType - Achievement type to check
 * @returns {Promise<boolean>} Whether user has the achievement
 */
export async function hasAchievement(userId, achievementType) {
  try {
    const achievement = await prisma.achievement.findUnique({
      where: {
        userId_type: {
          userId,
          type: achievementType,
        },
      },
    });

    return !!achievement;
  } catch (error) {
    apiLogger.error("Failed to check achievement:", {
      userId,
      achievementType,
      error: error.message,
    });
    return false;
  }
}

function getDayKey(date) {
  return new Date(date).toISOString().slice(0, 10);
}

function calculateCurrentStreak(dates) {
  const uniqueDays = [...new Set(dates.map(getDayKey))].sort().reverse();

  if (uniqueDays.length === 0) {
    return 0;
  }

  let streak = 1;
  let currentDay = new Date(uniqueDays[0]);

  for (let index = 1; index < uniqueDays.length; index += 1) {
    const previousDay = new Date(currentDay);
    previousDay.setDate(previousDay.getDate() - 1);

    if (uniqueDays[index] === getDayKey(previousDay)) {
      streak += 1;
      currentDay = new Date(uniqueDays[index]);
      continue;
    }

    break;
  }

  return streak;
}

async function awardLegendaryAchievement(userId) {
  const { totalPoints } = await getUserAchievements(userId);
  return checkAndAwardAchievement(userId, "LEGENDARY", totalPoints >= 1000);
}

export async function awardQuizAchievements(userId) {
  try {
    const quizResults = await prisma.quizResult.findMany({
      where: { userId },
      select: {
        score: true,
        totalQuestions: true,
        completedAt: true,
      },
      orderBy: { completedAt: "desc" },
    });

    const totalQuizzes = quizResults.length;
    const perfectScores = quizResults.filter(
      (result) =>
        result.totalQuestions > 0 && result.score === result.totalQuestions,
    ).length;
    const latestResult = quizResults[0];

    const achievementTypes = [];

    if (totalQuizzes >= 1) achievementTypes.push("FIRST_QUIZ");
    if (perfectScores >= 5) achievementTypes.push("QUIZ_MASTER");
    if (totalQuizzes >= 50) achievementTypes.push("QUIZ_WIZARD");
    if (
      latestResult &&
      latestResult.totalQuestions > 0 &&
      latestResult.score === latestResult.totalQuestions
    ) {
      achievementTypes.push("PERFECT_SCORE");
    }

    const achievements = await awardMultipleAchievements(
      userId,
      achievementTypes,
    );
    await awardLegendaryAchievement(userId);

    return achievements;
  } catch (error) {
    apiLogger.error("Failed to award quiz achievements:", {
      userId,
      error: error.message,
    });
    throw error;
  }
}

export async function awardFriendAchievements(userId) {
  try {
    const [friendshipCount, followerCount] = await Promise.all([
      prisma.friendship.count({
        where: {
          OR: [{ initiatorId: userId }, { friendId: userId }],
        },
      }),
      prisma.follow.count({
        where: { followingId: userId },
      }),
    ]);

    const achievementTypes = [];

    if (friendshipCount >= 1) achievementTypes.push("FIRST_FRIEND");
    if (friendshipCount >= 10) achievementTypes.push("FRIEND_MASTER");
    if (followerCount >= 50) achievementTypes.push("SOCIAL_BUTTERFLY");

    const achievements = await awardMultipleAchievements(
      userId,
      achievementTypes,
    );
    await awardLegendaryAchievement(userId);

    return achievements;
  } catch (error) {
    apiLogger.error("Failed to award friend achievements:", {
      userId,
      error: error.message,
    });
    throw error;
  }
}

export async function awardLearningAchievements(userId) {
  try {
    const sessions = await prisma.learningSession.findMany({
      where: { userId, status: "COMPLETED" },
      select: { createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    const totalLessons = sessions.length;
    const currentStreak = calculateCurrentStreak(
      sessions.map((s) => s.createdAt),
    );

    const achievementTypes = [];

    if (totalLessons >= 1) achievementTypes.push("FIRST_LESSON");
    if (currentStreak >= 7) achievementTypes.push("LEARNING_STREAK_7");
    if (currentStreak >= 30) achievementTypes.push("LEARNING_STREAK_30");
    if (totalLessons >= 100) achievementTypes.push("POLYGLOT");
    if (totalLessons >= 500) achievementTypes.push("LANGUAGE_EXPERT");

    const achievements = await awardMultipleAchievements(
      userId,
      achievementTypes,
    );
    await awardLegendaryAchievement(userId);

    return achievements;
  } catch (error) {
    apiLogger.error("Failed to award learning achievements:", {
      userId,
      error: error.message,
    });
    throw error;
  }
}

export async function awardBlogAuthorAchievements(userId) {
  try {
    const [blogCount, totalCommentCount, totalReactionCount] =
      await Promise.all([
        prisma.blog.count({ where: { authorId: userId } }),
        prisma.comment.count({
          where: {
            blog: { authorId: userId },
          },
        }),
        prisma.reaction.count({
          where: {
            blog: { authorId: userId },
          },
        }),
      ]);

    const achievementTypes = [];

    if (blogCount >= 1) achievementTypes.push("FIRST_BLOG");
    if (blogCount >= 5) achievementTypes.push("BLOGGER");
    if (totalCommentCount + totalReactionCount >= 10) {
      achievementTypes.push("COMMUNITY_HELPER");
    }

    const achievements = await awardMultipleAchievements(
      userId,
      achievementTypes,
    );
    await awardLegendaryAchievement(userId);

    return achievements;
  } catch (error) {
    apiLogger.error("Failed to award blog author achievements:", {
      userId,
      error: error.message,
    });
    throw error;
  }
}

export async function awardCommentAchievements(userId) {
  try {
    const commentCount = await prisma.comment.count({
      where: { userId },
    });

    const achievementTypes = [];

    if (commentCount >= 10) achievementTypes.push("COMMUNITY_HELPER");
    if (commentCount >= 50) achievementTypes.push("COMMENTATOR");

    const achievements = await awardMultipleAchievements(
      userId,
      achievementTypes,
    );
    await awardLegendaryAchievement(userId);

    return achievements;
  } catch (error) {
    apiLogger.error("Failed to award comment achievements:", {
      userId,
      error: error.message,
    });
    throw error;
  }
}

export async function awardRoomAchievements(userId) {
  try {
    const roomCount = await prisma.room.count({
      where: { createdById: userId },
    });

    const achievementTypes = [];

    if (roomCount >= 1) achievementTypes.push("ROOM_CREATOR");
    if (roomCount >= 3) achievementTypes.push("ROOM_HOST");

    const achievements = await awardMultipleAchievements(
      userId,
      achievementTypes,
    );
    await awardLegendaryAchievement(userId);

    return achievements;
  } catch (error) {
    apiLogger.error("Failed to award room achievements:", {
      userId,
      error: error.message,
    });
    throw error;
  }
}

export async function awardDirectMessageAchievements(userId) {
  try {
    const [privateMessageCount, roomMessageCount] = await Promise.all([
      prisma.privateMessage.count({
        where: { senderId: userId },
      }),
      prisma.message.count({
        where: { userId },
      }),
    ]);

    const achievementTypes = [];

    if (privateMessageCount >= 1) achievementTypes.push("DM_STARTER");
    if (roomMessageCount >= 25) achievementTypes.push("COMMUNITY_VOICE");

    const achievements = await awardMultipleAchievements(
      userId,
      achievementTypes,
    );
    await awardLegendaryAchievement(userId);

    return achievements;
  } catch (error) {
    apiLogger.error("Failed to award message achievements:", {
      userId,
      error: error.message,
    });
    throw error;
  }
}

export async function awardViralPostAchievement(blogId) {
  try {
    const blog = await prisma.blog.findUnique({
      where: { id: blogId },
      select: { authorId: true },
    });

    if (!blog) {
      return null;
    }

    const reactionCount = await prisma.reaction.count({
      where: { blogId },
    });

    const achievements = [];

    if (reactionCount >= 100) {
      const achievement = await awardAchievement(blog.authorId, "VIRAL_POST");
      if (achievement) {
        achievements.push(achievement);
      }
    }

    await awardLegendaryAchievement(blog.authorId);

    return achievements;
  } catch (error) {
    apiLogger.error("Failed to award viral post achievement:", {
      blogId,
      error: error.message,
    });
    throw error;
  }
}
