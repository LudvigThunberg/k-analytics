/*
  Warnings:

  - A unique constraint covering the columns `[googleId]` on the table `UserData` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `googleId` to the `UserData` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `UserData` ADD COLUMN `googleId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `UserData_googleId_key` ON `UserData`(`googleId`);
