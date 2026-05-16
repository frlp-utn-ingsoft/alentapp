-- CreateTable
CREATE TABLE "medical_certificates" (
    "id" TEXT NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "doctorLicense" TEXT NOT NULL,
    "isValidated" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "memberId" TEXT NOT NULL,

    CONSTRAINT "medical_certificates_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "medical_certificates" ADD CONSTRAINT "medical_certificates_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
