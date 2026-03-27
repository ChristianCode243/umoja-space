/*
  Warnings:

  - You are about to drop the column `designer` on the `Book` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Book" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "isbn" TEXT,
    "description" TEXT,
    "publisher" TEXT DEFAULT 'Umoja Editions',
    "publishedAt" DATETIME,
    "language" TEXT,
    "pageCount" INTEGER,
    "pricePaperCents" INTEGER NOT NULL,
    "priceEbookCents" INTEGER NOT NULL,
    "authorId" TEXT NOT NULL,
    "designerId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Book_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Book_designerId_fkey" FOREIGN KEY ("designerId") REFERENCES "Designer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Book" ("authorId", "createdAt", "description", "id", "isbn", "language", "pageCount", "priceEbookCents", "pricePaperCents", "publishedAt", "publisher", "title", "updatedAt") SELECT "authorId", "createdAt", "description", "id", "isbn", "language", "pageCount", "priceEbookCents", "pricePaperCents", "publishedAt", "publisher", "title", "updatedAt" FROM "Book";
DROP TABLE "Book";
ALTER TABLE "new_Book" RENAME TO "Book";
CREATE UNIQUE INDEX "Book_isbn_key" ON "Book"("isbn");
CREATE INDEX "Book_authorId_idx" ON "Book"("authorId");
CREATE INDEX "Book_designerId_idx" ON "Book"("designerId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
