/*
  Warnings:

  - A unique constraint covering the columns `[studyGroupId]` on the table `Chat` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Chat" ADD COLUMN     "studyGroupId" INTEGER;

-- AlterTable
ALTER TABLE "StudyGroup" ADD COLUMN     "chatID" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Chat_studyGroupId_key" ON "Chat"("studyGroupId");

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_studyGroupId_fkey" FOREIGN KEY ("studyGroupId") REFERENCES "StudyGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
