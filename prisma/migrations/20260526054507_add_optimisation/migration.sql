-- AlterTable
ALTER TABLE `quizzes` ADD COLUMN `color` VARCHAR(191) NULL DEFAULT '#6366F1',
    ADD COLUMN `icon` TEXT NULL,
    ADD COLUMN `order` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `timeLimit` INTEGER NULL;

-- CreateTable
CREATE TABLE `daily_missions` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `type` ENUM('LEARN_15_MIN', 'COMPLETE_QUIZ', 'MAKE_FRIEND', 'WRITE_COMMENT', 'STREAK_MAINTAIN') NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `target` INTEGER NOT NULL,
    `progress` INTEGER NOT NULL DEFAULT 0,
    `completed` BOOLEAN NOT NULL DEFAULT false,
    `reward` INTEGER NOT NULL DEFAULT 10,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `completedAt` DATETIME(3) NULL,

    INDEX `daily_missions_userId_idx`(`userId`),
    INDEX `daily_missions_type_idx`(`type`),
    INDEX `daily_missions_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `quizzes_order_idx` ON `quizzes`(`order`);

-- AddForeignKey
ALTER TABLE `daily_missions` ADD CONSTRAINT `daily_missions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
