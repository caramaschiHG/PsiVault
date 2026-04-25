-- Phase 37: Add document lifecycle fields (zero-downtime migration)
-- All new columns are nullable or have safe defaults.
-- Existing documents are preserved and mapped to correct status.

-- 1. Add lifecycle status with safe default
ALTER TABLE "practice_documents" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'finalized';

-- 2. Add optional appointment linkage
ALTER TABLE "practice_documents" ADD COLUMN "appointment_id" TEXT;

-- 3. Add signing snapshot columns (all nullable)
ALTER TABLE "practice_documents" ADD COLUMN "signed_at" TIMESTAMP(3);
ALTER TABLE "practice_documents" ADD COLUMN "signed_by_account_id" TEXT;

-- 4. Add delivery record columns (all nullable)
ALTER TABLE "practice_documents" ADD COLUMN "delivered_at" TIMESTAMP(3);
ALTER TABLE "practice_documents" ADD COLUMN "delivered_to" TEXT;
ALTER TABLE "practice_documents" ADD COLUMN "delivered_via" TEXT;

-- 5. Map existing archived documents to status='archived'
UPDATE "practice_documents" SET "status" = 'archived' WHERE "archived_at" IS NOT NULL;

-- 6. Add composite indexes for workspace-level queries
CREATE INDEX "practice_documents_workspace_id_patient_id_status_idx" ON "practice_documents"("workspace_id", "patient_id", "status");
CREATE INDEX "practice_documents_workspace_id_patient_id_created_at_idx" ON "practice_documents"("workspace_id", "patient_id", "created_at");
CREATE INDEX "practice_documents_appointment_id_idx" ON "practice_documents"("appointment_id");
