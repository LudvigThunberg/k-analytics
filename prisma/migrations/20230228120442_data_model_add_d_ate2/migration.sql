/*
  Warnings:

  - A unique constraint covering the columns `[date]` on the table `GoogleData` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `GoogleData` ADD COLUMN `date` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `GoogleData_date_key` ON `GoogleData`(`date`);
