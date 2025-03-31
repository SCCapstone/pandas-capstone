-- AlterTable
ALTER TABLE "StudyGroup" ADD COLUMN     "scheduleDays" TEXT[] DEFAULT ARRAY['Sun', 'Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat']::TEXT[],
ADD COLUMN     "scheduleEndTime" TEXT NOT NULL DEFAULT '5:00 PM',
ADD COLUMN     "scheduleStartTime" TEXT NOT NULL DEFAULT '9:00 AM';
