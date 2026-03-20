-- CreateEnum
CREATE TYPE "cancellation_actor" AS ENUM ('PATIENT', 'THERAPIST');

-- AlterTable: add canceled_by, series_pattern, series_days_of_week to appointments
ALTER TABLE "appointments"
  ADD COLUMN "canceled_by" "cancellation_actor",
  ADD COLUMN "series_pattern" TEXT,
  ADD COLUMN "series_days_of_week" INTEGER[] NOT NULL DEFAULT '{}';
