/*
  Warnings:

  - You are about to drop the `UserData` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `date` on table `GoogleData` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `GoogleData` DROP FOREIGN KEY `GoogleData_userId_fkey`;

-- DropForeignKey
ALTER TABLE `PropertySummary` DROP FOREIGN KEY `PropertySummary_userId_fkey`;

-- AlterTable
ALTER TABLE `GoogleData` MODIFY `date` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `UserData`;

-- CreateTable
CREATE TABLE `UserBase` (
    `id` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `accessToken` TEXT NOT NULL,
    `refreshToken` VARCHAR(191) NOT NULL,
    `expiresIn` VARCHAR(191) NOT NULL,
    `googleId` VARCHAR(191) NOT NULL,
    `userBaseId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `User_googleId_key`(`googleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_userBaseId_fkey` FOREIGN KEY (`userBaseId`) REFERENCES `UserBase`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PropertySummary` ADD CONSTRAINT `PropertySummary_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GoogleData` ADD CONSTRAINT `GoogleData_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
