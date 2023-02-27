-- CreateTable
CREATE TABLE `UserData` (
    `id` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `accessKey` VARCHAR(191) NOT NULL,
    `refreshKey` VARCHAR(191) NOT NULL,
    `expiresIn` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PropertySummaries` (
    `id` VARCHAR(191) NOT NULL,
    `property` VARCHAR(191) NOT NULL,
    `displayName` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PropertySummaries` ADD CONSTRAINT `PropertySummaries_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `UserData`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
