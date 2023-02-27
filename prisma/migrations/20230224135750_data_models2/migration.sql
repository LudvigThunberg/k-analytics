/*
  Warnings:

  - You are about to drop the column `dimensionHeadersId` on the `MetricHeaders` table. All the data in the column will be lost.
  - You are about to drop the column `dimensionHeadersId` on the `Rows` table. All the data in the column will be lost.
  - Added the required column `testDataId` to the `DimensionHeaders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `testDataId` to the `MetricHeaders` table without a default value. This is not possible if the table is not empty.
  - Added the required column `testDataId` to the `Rows` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `MetricHeaders` DROP FOREIGN KEY `MetricHeaders_dimensionHeadersId_fkey`;

-- DropForeignKey
ALTER TABLE `Rows` DROP FOREIGN KEY `Rows_dimensionHeadersId_fkey`;

-- AlterTable
ALTER TABLE `DimensionHeaders` ADD COLUMN `testDataId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `MetricHeaders` DROP COLUMN `dimensionHeadersId`,
    ADD COLUMN `testDataId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Rows` DROP COLUMN `dimensionHeadersId`,
    ADD COLUMN `testDataId` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `DimensionHeaders` ADD CONSTRAINT `DimensionHeaders_testDataId_fkey` FOREIGN KEY (`testDataId`) REFERENCES `TestData`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MetricHeaders` ADD CONSTRAINT `MetricHeaders_testDataId_fkey` FOREIGN KEY (`testDataId`) REFERENCES `TestData`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Rows` ADD CONSTRAINT `Rows_testDataId_fkey` FOREIGN KEY (`testDataId`) REFERENCES `TestData`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
