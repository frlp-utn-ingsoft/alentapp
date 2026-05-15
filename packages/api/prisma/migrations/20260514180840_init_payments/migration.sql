-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('Pendiente', 'Pagado', 'Vencido', 'Cancelado');

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "amount" DECIMAL(10, 2) NOT NULL,
    "month" INT NOT NULL,
    "year" INT NOT NULL,
    "due_date" DATE NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'Pendiente',
    "payment_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "payments_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "payments_member_id_month_year_key" ON "payments"("member_id", "month", "year");

