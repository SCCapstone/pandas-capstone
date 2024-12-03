-- DropForeignKey
ALTER TABLE "Match" DROP CONSTRAINT "Match_user2Id_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "studyHabitTags" TEXT[];

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_user2Id_fkey" FOREIGN KEY ("user2Id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
