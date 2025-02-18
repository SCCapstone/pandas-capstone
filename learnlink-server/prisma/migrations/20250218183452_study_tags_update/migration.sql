/*
  Warnings:

  - The `ideal_match_factor` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "StudyGroup" ADD COLUMN     "ideal_match_factor" "StudyTags";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "ideal_match_factor",
ADD COLUMN     "ideal_match_factor" "StudyTags";
