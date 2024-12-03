/*
  Warnings:

  - The `studyHabitTags` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "StudyTags" AS ENUM ('Quiet', 'Background_Noise', 'Music_Allowed', 'Solo_Study', 'Group_Discussion', 'Pair_Work', 'Morning', 'Afternoon', 'Evening', 'Night', 'Visual_Learner', 'Auditory_Learner');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "studyHabitTags",
ADD COLUMN     "studyHabitTags" "StudyTags"[];
