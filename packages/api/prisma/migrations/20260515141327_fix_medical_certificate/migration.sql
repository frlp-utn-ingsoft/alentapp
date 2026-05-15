/*
  Warnings:

  - You are about to drop the column `memberId` on the `medical_certificates` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "medical_certificates" DROP CONSTRAINT "medical_certificates_memberId_fkey";

-- AlterTable
ALTER TABLE "medical_certificates" DROP COLUMN "memberId";

-- AddForeignKey
ALTER TABLE "medical_certificates" ADD CONSTRAINT "medical_certificates_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
