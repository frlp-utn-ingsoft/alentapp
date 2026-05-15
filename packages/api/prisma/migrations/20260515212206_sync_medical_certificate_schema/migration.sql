/*
  Warnings:

  - A unique constraint covering the columns `[member_id,month,year]` on the table `payments` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updated_at` to the `medical_certificates` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "payments_member_id_month_year_key";

-- AlterTable
ALTER TABLE "medical_certificates" ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "issue_date" SET DATA TYPE DATE,
ALTER COLUMN "expiry_date" SET DATA TYPE DATE;

-- AlterTable
ALTER TABLE "payments" ALTER COLUMN "payment_date" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "updated_at" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "payments_member_id_month_year_key" ON "payments"("member_id", "month", "year");
