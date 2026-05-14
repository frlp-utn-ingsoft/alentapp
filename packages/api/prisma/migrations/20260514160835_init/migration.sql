-- CreateTable
CREATE TABLE "_MemberSports" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_MemberSports_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_MemberSports_B_index" ON "_MemberSports"("B");

-- AddForeignKey
ALTER TABLE "_MemberSports" ADD CONSTRAINT "_MemberSports_A_fkey" FOREIGN KEY ("A") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_MemberSports" ADD CONSTRAINT "_MemberSports_B_fkey" FOREIGN KEY ("B") REFERENCES "sports"("id") ON DELETE CASCADE ON UPDATE CASCADE;
