-- CreateEnum
CREATE TYPE "SwipeStatus" AS ENUM ('Pending', 'Accepted', 'Denied');

-- AlterTable
ALTER TABLE "Swipe" ADD COLUMN     "status" "SwipeStatus" NOT NULL DEFAULT 'Pending';
