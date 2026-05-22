-- AddForeignKey
ALTER TABLE `learning_sessions` ADD CONSTRAINT `learning_sessions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
