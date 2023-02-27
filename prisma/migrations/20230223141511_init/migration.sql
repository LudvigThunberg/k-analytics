/*
  Warnings:

  - You are about to drop the column `accessKey` on the `UserData` table. All the data in the column will be lost.
  - You are about to drop the column `refreshKey` on the `UserData` table. All the data in the column will be lost.
  - Added the required column `accessToken` to the `UserData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `refreshToken` to the `UserData` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `UserData` DROP COLUMN `accessKey`,
    DROP COLUMN `refreshKey`,
    ADD COLUMN `accessToken` VARCHAR(191) NOT NULL,
    ADD COLUMN `refreshToken` VARCHAR(191) NOT NULL;
