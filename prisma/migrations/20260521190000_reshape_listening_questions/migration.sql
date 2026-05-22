-- Recreate listening_questions with the new listening format
DROP TABLE IF EXISTS `listening_questions`;

CREATE TABLE `listening_questions` (
    `id` VARCHAR(191) NOT NULL,
    `level` VARCHAR(191) NOT NULL,
    `chunks` JSON NOT NULL,
    `answer` JSON NOT NULL,
    `sentences` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `listening_questions_level_idx`(`level`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;