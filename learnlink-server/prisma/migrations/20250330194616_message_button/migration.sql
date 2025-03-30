-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "button" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "buttonData" JSONB;
