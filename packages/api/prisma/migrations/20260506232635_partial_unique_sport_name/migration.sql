-- DropIndex
DROP INDEX "sports_name_key";

-- Create partial unique index
CREATE UNIQUE INDEX "sports_name_active_key" ON "sports"("name") WHERE "deleted_at" IS NULL;
