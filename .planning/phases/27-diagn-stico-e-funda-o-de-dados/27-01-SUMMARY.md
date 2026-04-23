---
phase: 27-diagn-stico-e-funda-o-de-dados
plan: "01"
subsystem: database
tags:
  - schema
  - performance
  - prisma
  - indexing
dependency_graph:
  requires: []
  provides:
    - PerformanceMetric table
    - Composite indexes on Appointment and SessionCharge
  affects:
    - 27-02-PLAN.md
    - 27-03-PLAN.md
tech_stack:
  added:
    - PerformanceMetric model
  patterns:
    - Composite indexes for query performance
key_files:
  created: []
  modified:
    - prisma/schema.prisma
    - .env.example
decisions:
  - Added composite index [workspaceId, status, startsAt] on Appointment to optimize filtered date-range queries
  - Added composite index [workspaceId, status, createdAt] on SessionCharge to optimize status-based financial queries
  - Documented prepareThreshold=0 as mandatory for Prisma + Supavisor transaction mode
metrics:
  duration: "15 min"
  completed_date: "2026-04-23"
---

# Phase 27 Plan 01: Schema Foundation Summary

**One-liner:** Foundation schema for Phase 27 with PerformanceMetric model, composite indexes, and Supavisor configuration documentation.

## What Was Built

- **PerformanceMetric model** in `prisma/schema.prisma` with fields: id, metricName, value, rating, pagePath, workspaceId, sessionId, createdAt — plus indexes on [workspaceId, metricName, createdAt] and [createdAt].
- **Composite index** `[workspaceId, status, startsAt]` on `Appointment` model for optimized filtered list queries.
- **Composite index** `[workspaceId, status, createdAt]` on `SessionCharge` model for optimized financial status queries.
- **Supavisor documentation** in `.env.example` explaining `prepareThreshold=0` as mandatory for Prisma + Supavisor transaction mode.

## Deviations from Plan

None — plan executed exactly as written.

## Auth Gates

None.

## Known Stubs

None.

## Threat Flags

None.

## Self-Check: PASSED

- [x] `prisma/schema.prisma` contains `model PerformanceMetric`
- [x] `prisma/schema.prisma` contains `@@index([workspaceId, status, startsAt])` in Appointment
- [x] `prisma/schema.prisma` contains `@@index([workspaceId, status, createdAt])` in SessionCharge
- [x] `.env.example` contains `prepareThreshold=0`
- [x] `npx prisma generate` completed without errors
- [x] `npx prisma db push --accept-data-loss` completed without errors

## Commits

- `62458c8`: feat(27-01): add PerformanceMetric model and composite indexes
- `20a3622`: docs(27-01): document Supavisor transaction pooler with prepareThreshold=0
- `d587e5d`: chore(27-01): push schema to database and regenerate client
