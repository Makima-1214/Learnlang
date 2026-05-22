-- CreateTable
CREATE TABLE `learning_sessions` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NULL,
    `method` VARCHAR(191) NOT NULL,
    `level` VARCHAR(191) NOT NULL,
    `total` INTEGER NOT NULL,
    `score` INTEGER NULL,
    `status` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `completedAt` DATETIME(3) NULL,

    INDEX `learning_sessions_userId_idx`(`userId`),
    INDEX `learning_sessions_method_idx`(`method`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `session_questions` (
    `id` VARCHAR(191) NOT NULL,
    `sessionId` VARCHAR(191) NOT NULL,
    `questionId` VARCHAR(191) NOT NULL,
    `questionType` VARCHAR(191) NOT NULL,
    `snapshot` JSON NOT NULL,
    `userAnswer` VARCHAR(191) NULL,
    `isCorrect` BOOLEAN NULL,
    `order` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `session_questions_sessionId_idx`(`sessionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `session_questions` ADD CONSTRAINT `session_questions_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `learning_sessions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
