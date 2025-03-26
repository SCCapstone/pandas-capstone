/*
  Warnings:

  - You are about to drop the column `unReadMessages` on the `Chat` table. All the data in the column will be lost.
  - You are about to drop the column `seen` on the `Message` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "unReadMessages";

-- AlterTable
ALTER TABLE "Message" DROP COLUMN "seen";
