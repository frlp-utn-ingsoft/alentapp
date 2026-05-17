-- CreateTable
CREATE TABLE "equipment_loans" (
    "id" TEXT NOT NULL,
    "item_name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Loaned',
    "loan_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "due_date" TIMESTAMP(3) NOT NULL,
    "member_id" TEXT NOT NULL,

    CONSTRAINT "equipment_loans_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "equipment_loans" ADD CONSTRAINT "equipment_loans_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
