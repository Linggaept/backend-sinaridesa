-- AlterTable
ALTER TABLE "Course" ADD COLUMN "slug" TEXT;

-- AlterTable
ALTER TABLE "Event" ADD COLUMN "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Course_slug_key" ON "Course"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");
