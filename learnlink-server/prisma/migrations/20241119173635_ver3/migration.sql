-- CreateEnum
CREATE TYPE "Grade" AS ENUM ('Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate_Student');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('Woman', 'Man', 'Nonbinary', 'Other', 'Prefer_not_to_say');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "age" INTEGER,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "college" TEXT,
ADD COLUMN     "gender" "Gender",
ADD COLUMN     "grade" "Grade",
ADD COLUMN     "major" TEXT,
ADD COLUMN     "profilePic" TEXT,
ADD COLUMN     "relevant_courses" TEXT[],
ADD COLUMN     "study_method" TEXT;
