-- CreateEnum
CREATE TYPE "LockerStatus" AS ENUM ('Disponible', 'Ocupado', 'Mantenimiento');

-- CreateTable
CREATE TABLE "lockers" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "location" TEXT NOT NULL,
    "status" "LockerStatus" NOT NULL DEFAULT 'Disponible',
    "member_id" TEXT,

    CONSTRAINT "lockers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "lockers_number_key" ON "lockers"("number");

-- AddForeignKey
ALTER TABLE "lockers" ADD CONSTRAINT "lockers_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;
