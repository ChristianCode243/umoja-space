-- CreateTable
CREATE TABLE "Designer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "specialty" TEXT,
    "portfolioUrl" TEXT,
    "country" TEXT,
    "bio" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

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
    "designer" TEXT,
    "pricePaperCents" INTEGER NOT NULL,
    "priceEbookCents" INTEGER NOT NULL,
    "authorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Book_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Author" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Book" ("authorId", "createdAt", "description", "designer", "id", "isbn", "language", "pageCount", "priceEbookCents", "pricePaperCents", "publishedAt", "publisher", "title", "updatedAt") SELECT "authorId", "createdAt", "description", "designer", "id", "isbn", "language", "pageCount", "priceEbookCents", "pricePaperCents", "publishedAt", "publisher", "title", "updatedAt" FROM "Book";
DROP TABLE "Book";
ALTER TABLE "new_Book" RENAME TO "Book";
CREATE UNIQUE INDEX "Book_isbn_key" ON "Book"("isbn");
CREATE INDEX "Book_authorId_idx" ON "Book"("authorId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Designer_email_key" ON "Designer"("email");
