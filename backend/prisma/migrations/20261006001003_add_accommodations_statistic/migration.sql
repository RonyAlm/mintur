-- CreateEnum
CREATE TYPE "AccommodationAgeRange" AS ENUM ('AGE_0_12', 'AGE_13_17', 'AGE_18_30', 'AGE_31_45', 'AGE_46_60', 'AGE_61_PLUS');

-- CreateEnum
CREATE TYPE "AccommodationTravelPurpose" AS ENUM ('TOURISM', 'WORK', 'BUSINESS', 'VISIT_FAMILY', 'STUDIES', 'HEALTH', 'EVENTS', 'OTHER');

-- CreateEnum
CREATE TYPE "AccommodationOriginType" AS ENUM ('PROVINCE', 'COUNTRY');

-- CreateTable
CREATE TABLE "accommodation_daily_statistics" (
    "id" TEXT NOT NULL,
    "accommodationId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "totalGuests" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accommodation_daily_statistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accommodation_statistic_age_ranges" (
    "statisticId" TEXT NOT NULL,
    "ageRange" "AccommodationAgeRange" NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "accommodation_statistic_age_ranges_pkey" PRIMARY KEY ("statisticId","ageRange")
);

-- CreateTable
CREATE TABLE "accommodation_statistic_travel_purposes" (
    "statisticId" TEXT NOT NULL,
    "purpose" "AccommodationTravelPurpose" NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "accommodation_statistic_travel_purposes_pkey" PRIMARY KEY ("statisticId","purpose")
);

-- CreateTable
CREATE TABLE "accommodation_statistic_origins" (
    "statisticId" TEXT NOT NULL,
    "type" "AccommodationOriginType" NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "accommodation_statistic_origins_pkey" PRIMARY KEY ("statisticId","type","name")
);

-- CreateIndex
CREATE INDEX "accommodation_daily_statistics_accommodationId_date_idx" ON "accommodation_daily_statistics"("accommodationId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "accommodation_daily_statistics_accommodationId_date_key" ON "accommodation_daily_statistics"("accommodationId", "date");

-- AddForeignKey
ALTER TABLE "accommodation_daily_statistics" ADD CONSTRAINT "accommodation_daily_statistics_accommodationId_fkey" FOREIGN KEY ("accommodationId") REFERENCES "accommodations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accommodation_statistic_age_ranges" ADD CONSTRAINT "accommodation_statistic_age_ranges_statisticId_fkey" FOREIGN KEY ("statisticId") REFERENCES "accommodation_daily_statistics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accommodation_statistic_travel_purposes" ADD CONSTRAINT "accommodation_statistic_travel_purposes_statisticId_fkey" FOREIGN KEY ("statisticId") REFERENCES "accommodation_daily_statistics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "accommodation_statistic_origins" ADD CONSTRAINT "accommodation_statistic_origins_statisticId_fkey" FOREIGN KEY ("statisticId") REFERENCES "accommodation_daily_statistics"("id") ON DELETE CASCADE ON UPDATE CASCADE;
