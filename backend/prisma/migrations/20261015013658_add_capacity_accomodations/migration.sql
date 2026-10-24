-- AlterTable
ALTER TABLE "accommodation_daily_statistics" ALTER COLUMN "date" SET DATA TYPE DATE;

-- AlterTable
ALTER TABLE "accommodations" ADD COLUMN     "capacity" INTEGER,
ADD COLUMN     "locality" TEXT,
ADD COLUMN     "totalBeds" INTEGER,
ADD COLUMN     "totalRooms" INTEGER;
