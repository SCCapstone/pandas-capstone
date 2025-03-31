/*
  Warnings:

  - You are about to drop the column `button` on the `Message` table. All the data in the column will be lost.
  - You are about to drop the column `buttonData` on the `Message` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[buttonDataId]` on the table `Message` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Message" DROP COLUMN "button",
DROP COLUMN "buttonData",
ADD COLUMN     "buttonDataId" INTEGER,
ADD COLUMN     "isButton" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Button" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "studyGroupId" INTEGER,

    CONSTRAINT "Button_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Message_buttonDataId_key" ON "Message"("buttonDataId");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_buttonDataId_fkey" FOREIGN KEY ("buttonDataId") REFERENCES "Button"("id") ON DELETE CASCADE ON UPDATE CASCADE;
