-- CreateTable
CREATE TABLE `JournalEntry` (
    `id` VARCHAR(191) NOT NULL,
    `side` ENUM('DEBIT', 'CREDIT') NOT NULL,
    `sourceType` ENUM('FINANCE_INCOME', 'FINANCE_EXPENSE', 'CONTRIBUTION', 'ADJUSTMENT') NOT NULL,
    `sourceId` VARCHAR(191) NULL,
    `amountCents` INTEGER NOT NULL,
    `description` VARCHAR(191) NULL,
    `occurredAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `JournalEntry_occurredAt_idx`(`occurredAt`),
    INDEX `JournalEntry_side_occurredAt_idx`(`side`, `occurredAt`),
    INDEX `JournalEntry_sourceType_sourceId_idx`(`sourceType`, `sourceId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `JournalEntry` ADD CONSTRAINT `JournalEntry_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
