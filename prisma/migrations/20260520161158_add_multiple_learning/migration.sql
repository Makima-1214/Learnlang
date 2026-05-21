/*
  Warnings:

  - You are about to drop the `questions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `questions`;

-- CreateTable
CREATE TABLE `vocabulary_questions` (
    `id` VARCHAR(191) NOT NULL,
    `level` VARCHAR(191) NOT NULL,
    `question` TEXT NOT NULL,
    `options` JSON NOT NULL,
    `answer` VARCHAR(191) NOT NULL,
    `skill` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `vocabulary_questions_level_idx`(`level`),
    INDEX `vocabulary_questions_skill_idx`(`skill`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
