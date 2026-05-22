-- CreateTable
CREATE TABLE `achievements` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` ENUM('FIRST_FRIEND', 'FRIEND_MASTER', 'SOCIAL_BUTTERFLY', 'FIRST_LESSON', 'LEARNING_STREAK_7', 'LEARNING_STREAK_30', 'POLYGLOT', 'LANGUAGE_EXPERT', 'FIRST_QUIZ', 'QUIZ_MASTER', 'QUIZ_WIZARD', 'PERFECT_SCORE', 'FIRST_BLOG', 'BLOGGER', 'VIRAL_POST', 'COMMENTATOR', 'EARLY_BIRD', 'COMMUNITY_HELPER', 'CONTENT_CREATOR') NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `icon` TEXT NULL,
    `badgeColor` VARCHAR(191) NULL DEFAULT 'blue',
    `points` INTEGER NOT NULL DEFAULT 10,
    `unlockedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `achievements_userId_idx`(`userId`),
    INDEX `achievements_type_idx`(`type`),
    INDEX `achievements_unlockedAt_idx`(`unlockedAt`),
    UNIQUE INDEX `achievements_userId_type_key`(`userId`, `type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `achievements` ADD CONSTRAINT `achievements_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
