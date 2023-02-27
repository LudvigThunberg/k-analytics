/*
  Warnings:

  - You are about to drop the column `rowsId` on the `DimensionValues` table. All the data in the column will be lost.
  - You are about to drop the column `rowsId` on the `MetricValues` table. All the data in the column will be lost.
  - You are about to drop the `MetricHedersValue` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `dataId` to the `DimensionValues` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dataId` to the `MetricValues` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `DimensionValues` DROP FOREIGN KEY `DimensionValues_rowsId_fkey`;

-- DropForeignKey
ALTER TABLE `MetricHedersValue` DROP FOREIGN KEY `MetricHedersValue_metricHeadersId_fkey`;

-- DropForeignKey
ALTER TABLE `MetricValues` DROP FOREIGN KEY `MetricValues_rowsId_fkey`;

-- AlterTable
ALTER TABLE `DimensionValues` DROP COLUMN `rowsId`,
    ADD COLUMN `dataId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `MetricValues` DROP COLUMN `rowsId`,
    ADD COLUMN `dataId` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `MetricHedersValue`;

-- CreateTable
CREATE TABLE `MetricHeadersValue` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `type` VARCHAR(191) NULL,
    `metricHeadersId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Data` (
    `id` VARCHAR(191) NOT NULL,
    `rowsId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MetricHeadersValue` ADD CONSTRAINT `MetricHeadersValue_metricHeadersId_fkey` FOREIGN KEY (`metricHeadersId`) REFERENCES `MetricHeaders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Data` ADD CONSTRAINT `Data_rowsId_fkey` FOREIGN KEY (`rowsId`) REFERENCES `Rows`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DimensionValues` ADD CONSTRAINT `DimensionValues_dataId_fkey` FOREIGN KEY (`dataId`) REFERENCES `Data`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MetricValues` ADD CONSTRAINT `MetricValues_dataId_fkey` FOREIGN KEY (`dataId`) REFERENCES `Data`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
