/*
  Warnings:

  - A unique constraint covering the columns `[chatID]` on the table `StudyGroup` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "StudyGroup_chatID_key" ON "StudyGroup"("chatID");
