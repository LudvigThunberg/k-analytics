/*
  Warnings:

  - You are about to drop the `Data` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DimensionHeaders` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DimensionHeadersValue` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DimensionValues` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MetricHeaders` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MetricHeadersValue` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MetricValues` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PropertySummaries` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Rows` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TestData` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Data` DROP FOREIGN KEY `Data_rowsId_fkey`;

-- DropForeignKey
ALTER TABLE `DimensionHeaders` DROP FOREIGN KEY `DimensionHeaders_testDataId_fkey`;

-- DropForeignKey
ALTER TABLE `DimensionHeadersValue` DROP FOREIGN KEY `DimensionHeadersValue_dimensionHeadersId_fkey`;

-- DropForeignKey
ALTER TABLE `DimensionValues` DROP FOREIGN KEY `DimensionValues_dataId_fkey`;

-- DropForeignKey
ALTER TABLE `MetricHeaders` DROP FOREIGN KEY `MetricHeaders_testDataId_fkey`;

-- DropForeignKey
ALTER TABLE `MetricHeadersValue` DROP FOREIGN KEY `MetricHeadersValue_metricHeadersId_fkey`;

-- DropForeignKey
ALTER TABLE `MetricValues` DROP FOREIGN KEY `MetricValues_dataId_fkey`;

-- DropForeignKey
ALTER TABLE `PropertySummaries` DROP FOREIGN KEY `PropertySummaries_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Rows` DROP FOREIGN KEY `Rows_testDataId_fkey`;

-- DropForeignKey
ALTER TABLE `TestData` DROP FOREIGN KEY `TestData_userId_fkey`;

-- DropTable
DROP TABLE `Data`;

-- DropTable
DROP TABLE `DimensionHeaders`;

-- DropTable
DROP TABLE `DimensionHeadersValue`;

-- DropTable
DROP TABLE `DimensionValues`;

-- DropTable
DROP TABLE `MetricHeaders`;

-- DropTable
DROP TABLE `MetricHeadersValue`;

-- DropTable
DROP TABLE `MetricValues`;

-- DropTable
DROP TABLE `PropertySummaries`;

-- DropTable
DROP TABLE `Rows`;

-- DropTable
DROP TABLE `TestData`;

-- CreateTable
CREATE TABLE `PropertySummary` (
    `id` VARCHAR(191) NOT NULL,
    `property` VARCHAR(191) NOT NULL,
    `displayName` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GoogleData` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DimensionHeader` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `googleDataId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MetricHeader` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `type` VARCHAR(191) NULL,
    `googleDataId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Row` (
    `id` VARCHAR(191) NOT NULL,
    `googleDataId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DimensionValue` (
    `id` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NULL,
    `rowId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MetricValue` (
    `id` VARCHAR(191) NOT NULL,
    `value` VARCHAR(191) NULL,
    `rowId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PropertySummary` ADD CONSTRAINT `PropertySummary_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `UserData`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GoogleData` ADD CONSTRAINT `GoogleData_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `UserData`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DimensionHeader` ADD CONSTRAINT `DimensionHeader_googleDataId_fkey` FOREIGN KEY (`googleDataId`) REFERENCES `GoogleData`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MetricHeader` ADD CONSTRAINT `MetricHeader_googleDataId_fkey` FOREIGN KEY (`googleDataId`) REFERENCES `GoogleData`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Row` ADD CONSTRAINT `Row_googleDataId_fkey` FOREIGN KEY (`googleDataId`) REFERENCES `GoogleData`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DimensionValue` ADD CONSTRAINT `DimensionValue_rowId_fkey` FOREIGN KEY (`rowId`) REFERENCES `Row`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MetricValue` ADD CONSTRAINT `MetricValue_rowId_fkey` FOREIGN KEY (`rowId`) REFERENCES `Row`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
