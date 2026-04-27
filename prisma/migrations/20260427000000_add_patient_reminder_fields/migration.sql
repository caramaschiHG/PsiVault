-- Phase 44-01: Add reminder fields to Patient (zero-downtime)
-- Both columns are nullable / have safe defaults so existing rows are preserved.

ALTER TABLE "patients" ADD COLUMN "reminder_phone" TEXT;
ALTER TABLE "patients" ADD COLUMN "preferred_reminder_time" INTEGER DEFAULT 20;
