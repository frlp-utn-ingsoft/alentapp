/*
  Warnings:

  - The `status` column on the `equipment_loans` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "EquipmentLoanStatusEnum" AS ENUM ('Loaned', 'Returned', 'Damaged');

-- AlterTable
ALTER TABLE "equipment_loans" DROP COLUMN "status",
ADD COLUMN     "status" "EquipmentLoanStatusEnum" NOT NULL DEFAULT 'Loaned';
