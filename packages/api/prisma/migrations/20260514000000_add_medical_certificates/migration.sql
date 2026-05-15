-- CreateTable
CREATE TABLE "medical_certificates" (
    "id" TEXT NOT NULL,
    "issue_date" TIMESTAMP(3) NOT NULL,
    "expiry_date" TIMESTAMP(3) NOT NULL,
    "doctor_license" TEXT NOT NULL,
    "is_validated" BOOLEAN NOT NULL DEFAULT true,
    "member_id" TEXT NOT NULL,

    CONSTRAINT "medical_certificates_pkey" PRIMARY KEY ("id")
);
