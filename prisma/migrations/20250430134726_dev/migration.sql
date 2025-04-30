/*
  Warnings:

  - You are about to drop the column `name` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `Site` table. All the data in the column will be lost.
  - Added the required column `displayName` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `displayName` to the `Site` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Category" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "displayName" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_Category" ("id", "displayName", "order") SELECT "id", "name", "order" FROM "Category";
DROP TABLE "Category";
ALTER TABLE "new_Category" RENAME TO "Category";
CREATE TABLE "new_Site" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,
    "imageUrl" TEXT,
    "imageMode" TEXT NOT NULL DEFAULT 'auto-fetch',
    "order" INTEGER NOT NULL DEFAULT 0,
    "categoryId" INTEGER NOT NULL,
    "hided" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Site_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Site" ("categoryId", "description", "hided", "id", "displayName", "imageMode", "imageUrl", "order", "url") SELECT "categoryId", "description", "hided", "id", "title", "imageMode", "imageUrl", "order", "url" FROM "Site";
DROP TABLE "Site";
ALTER TABLE "new_Site" RENAME TO "Site";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
