-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_studyGroupId_fkey";

-- AlterTable
ALTER TABLE "StudyGroup" ADD COLUMN     "profilePic" TEXT;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_studyGroupId_fkey" FOREIGN KEY ("studyGroupId") REFERENCES "StudyGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;
