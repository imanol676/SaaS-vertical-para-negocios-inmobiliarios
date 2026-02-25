/*
  Warnings:

  - You are about to drop the column `email` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[clerk_org_id]` on the table `organizations` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[clerk_user_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updated_at` to the `leads` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clerk_org_id` to the `organizations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `organizations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `properties` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clerk_user_id` to the `users` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `users` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "leads" DROP CONSTRAINT "leads_property_id_fkey";

-- AlterTable
ALTER TABLE "leads" ADD COLUMN     "assigned_user_id" UUID,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "property_id" DROP NOT NULL,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "phone" DROP NOT NULL,
ALTER COLUMN "budget" DROP NOT NULL,
ALTER COLUMN "zone" DROP NOT NULL,
ALTER COLUMN "timeframe" DROP NOT NULL;

-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "clerk_org_id" TEXT NOT NULL,
ADD COLUMN     "plan_status" TEXT NOT NULL DEFAULT 'active',
ADD COLUMN     "trial_ends_at" TIMESTAMP(3),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "properties" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "email",
DROP COLUMN "role",
ADD COLUMN     "clerk_user_id" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE INDEX "events_organization_id_idx" ON "events"("organization_id");

-- CreateIndex
CREATE INDEX "lead_scores_lead_id_idx" ON "lead_scores"("lead_id");

-- CreateIndex
CREATE INDEX "leads_organization_id_idx" ON "leads"("organization_id");

-- CreateIndex
CREATE INDEX "leads_assigned_user_id_idx" ON "leads"("assigned_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_clerk_org_id_key" ON "organizations"("clerk_org_id");

-- CreateIndex
CREATE INDEX "properties_organization_id_idx" ON "properties"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_clerk_user_id_key" ON "users"("clerk_user_id");

-- CreateIndex
CREATE INDEX "users_organization_id_idx" ON "users"("organization_id");

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_property_id_fkey" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_assigned_user_id_fkey" FOREIGN KEY ("assigned_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
