/*
  Warnings:

  - You are about to drop the `histories` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `histories` DROP FOREIGN KEY `histories_userId_fkey`;

-- DropTable
DROP TABLE `histories`;
