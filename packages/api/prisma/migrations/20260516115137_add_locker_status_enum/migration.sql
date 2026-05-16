/*
  Warnings:

  - The `status` column on the `lockers` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "LockerStatus" AS ENUM ('Available', 'Occupied', 'Maintenance');

-- AlterTable
ALTER TABLE "lockers" DROP COLUMN "status",
ADD COLUMN     "status" "LockerStatus" NOT NULL DEFAULT 'Available';
