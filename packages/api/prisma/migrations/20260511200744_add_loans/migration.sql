-- CreateEnum
CREATE TYPE "LoanStatus" AS ENUM ('Loaned', 'Returned', 'Damaged');

-- CreateTable
CREATE TABLE "equipment_loans" (
    "id" UUID NOT NULL,
    "member_id" UUID NOT NULL,
    "item_name" TEXT NOT NULL,
    "loan_date" TIMESTAMP(3) NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "status" "LoanStatus" NOT NULL DEFAULT 'Loaned',

    CONSTRAINT "equipment_loans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "equipment_loans_member_id_idx" ON "equipment_loans"("member_id");

-- AddForeignKey
ALTER TABLE "equipment_loans" ADD CONSTRAINT "equipment_loans_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;
