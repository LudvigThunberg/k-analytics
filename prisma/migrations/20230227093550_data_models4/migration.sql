/*
  Warnings:

  - You are about to drop the column `name` on the `MetricHeaders` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `MetricHeaders` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `MetricHeaders` DROP COLUMN `name`,
    DROP COLUMN `type`;

-- CreateTable
CREATE TABLE `MetricHedersValue` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `type` VARCHAR(191) NULL,
    `metricHeadersId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MetricHedersValue` ADD CONSTRAINT `MetricHedersValue_metricHeadersId_fkey` FOREIGN KEY (`metricHeadersId`) REFERENCES `MetricHeaders`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
