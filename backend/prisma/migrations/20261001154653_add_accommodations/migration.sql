/*
  Warnings:

  - The values [HOTEL] on the enum `OrganizationType` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "AccommodationType" AS ENUM ('HOTEL', 'HOSTEL', 'APART_HOTEL', 'OTRO');

-- AlterEnum
BEGIN;
CREATE TYPE "OrganizationType_new" AS ENUM ('MINISTRY', 'ACCOMMODATION', 'AGENCY', 'TOURISM_PROVIDER', 'GASTRONOMY', 'TRANSPORTATION', 'OTHER');
ALTER TABLE "organizations" ALTER COLUMN "type" TYPE "OrganizationType_new" USING ("type"::text::"OrganizationType_new");
ALTER TYPE "OrganizationType" RENAME TO "OrganizationType_old";
ALTER TYPE "OrganizationType_new" RENAME TO "OrganizationType";
DROP TYPE "public"."OrganizationType_old";
COMMIT;

-- CreateTable
CREATE TABLE "accommodations" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "type" "AccommodationType" NOT NULL,
    "image" TEXT,
    "address" TEXT,
    "addressMap" TEXT,
    "phoneOne" TEXT,
    "phoneTwo" TEXT,
    "email" TEXT,
    "website" TEXT,
    "instagram" TEXT,
    "facebook" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accommodations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accommodations_organizationId_key" ON "accommodations"("organizationId");

-- AddForeignKey
ALTER TABLE "accommodations" ADD CONSTRAINT "accommodations_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
