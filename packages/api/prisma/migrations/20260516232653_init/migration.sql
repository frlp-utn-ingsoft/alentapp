-- CreateEnum
CREATE TYPE "MedicalCertificateStatus" AS ENUM ('in_review', 'validated', 'historical');

-- CreateTable
CREATE TABLE "medical_certificates" (
    "id" TEXT NOT NULL,
    "issue_date" DATE NOT NULL,
    "expiry_date" DATE NOT NULL,
    "doctor_license" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "status" "MedicalCertificateStatus" NOT NULL DEFAULT 'in_review',
    "deleted_at" TIMESTAMP(3),
    "member_id" TEXT NOT NULL,

    CONSTRAINT "medical_certificates_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "medical_certificates" ADD CONSTRAINT "medical_certificates_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
