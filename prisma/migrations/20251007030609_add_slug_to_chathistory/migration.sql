/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `ChatHistory` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ChatHistory" ADD COLUMN     "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ChatHistory_slug_key" ON "ChatHistory"("slug");
