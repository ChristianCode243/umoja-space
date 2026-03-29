-- CreateTable
CREATE TABLE `FinanceEntry` (
    `id` VARCHAR(191) NOT NULL,
    `type` ENUM('INCOME', 'EXPENSE') NOT NULL,
    `amountCents` INTEGER NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `notes` VARCHAR(191) NULL,
    `occurredAt` DATETIME(3) NOT NULL,
    `createdById` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `FinanceEntry_type_occurredAt_idx`(`type`, `occurredAt`),
    INDEX `FinanceEntry_createdById_idx`(`createdById`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `FinanceEntry` ADD CONSTRAINT `FinanceEntry_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
