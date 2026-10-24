/*
  Warnings:

  - The values [OTRO] on the enum `AccommodationType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AccommodationType_new" AS ENUM ('HOTEL', 'HOSTEL', 'APART_HOTEL', 'OTHER');
ALTER TABLE "accommodations" ALTER COLUMN "type" TYPE "AccommodationType_new" USING ("type"::text::"AccommodationType_new");
ALTER TYPE "AccommodationType" RENAME TO "AccommodationType_old";
ALTER TYPE "AccommodationType_new" RENAME TO "AccommodationType";
DROP TYPE "public"."AccommodationType_old";
COMMIT;
