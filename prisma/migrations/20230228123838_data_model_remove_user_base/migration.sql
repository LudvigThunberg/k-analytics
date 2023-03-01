/*
  Warnings:

  - You are about to drop the column `userBaseId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `UserBase` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `User` DROP FOREIGN KEY `User_userBaseId_fkey`;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `userBaseId`;

-- DropTable
DROP TABLE `UserBase`;
