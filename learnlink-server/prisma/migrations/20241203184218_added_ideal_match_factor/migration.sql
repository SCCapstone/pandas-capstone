/*
  Warnings:

  - You are about to drop the column `profile_preferences` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "profile_preferences",
ADD COLUMN     "ideal_match_factor" TEXT;
