-- AlterTable
ALTER TABLE `DimensionHeadersValue` MODIFY `name` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `DimensionValues` MODIFY `value` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `MetricHeaders` MODIFY `name` VARCHAR(191) NULL,
    MODIFY `type` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `MetricValues` MODIFY `value` VARCHAR(191) NULL;
