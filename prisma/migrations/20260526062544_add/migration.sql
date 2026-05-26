-- AlterTable
ALTER TABLE `users` ADD COLUMN `energy` INTEGER NOT NULL DEFAULT 5,
    ADD COLUMN `energyNextRefillAt` DATETIME(3) NULL,
    ADD COLUMN `xp` INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX `users_xp_idx` ON `users`(`xp`);

-- CreateIndex
CREATE INDEX `users_energy_idx` ON `users`(`energy`);
