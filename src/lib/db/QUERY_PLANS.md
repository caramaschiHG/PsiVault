# Query Plans — Phase 27 Index Impact

Run these queries in Prisma Studio or psql to verify index usage:

## 1. Appointment list by workspace + status + date
```sql
EXPLAIN ANALYZE
SELECT * FROM appointments
WHERE workspace_id = '<workspace-id>'
  AND status = 'SCHEDULED'
  AND starts_at > NOW()
ORDER BY starts_at;
```
Expected: Index Scan using `appointments_workspaceId_status_startsAt_idx`

## 2. SessionCharge list by workspace + status + createdAt
```sql
EXPLAIN ANALYZE
SELECT * FROM session_charges
WHERE workspace_id = '<workspace-id>'
  AND status = 'pendente'
  AND created_at > NOW() - INTERVAL '30 days'
ORDER BY created_at;
```
Expected: Index Scan using `session_charges_workspaceId_status_createdAt_idx`

## 3. Patient search by name (case-insensitive)
```sql
EXPLAIN ANALYZE
SELECT id, workspace_id, full_name, social_name, email, phone,
       session_price_in_cents, guardian_name, guardian_phone,
       emergency_contact_name, emergency_contact_phone,
       deleted_at, deleted_by_account_id, created_at, updated_at
FROM patients
WHERE workspace_id = '<workspace-id>'
  AND deleted_at IS NULL
  AND (
    full_name ILIKE '%query%'
    OR social_name ILIKE '%query%'
    OR email ILIKE '%query%'
    OR phone ILIKE '%query%'
  )
ORDER BY full_name;
```
Expected: Index Scan using `patients_workspaceId_deletedAt_idx` (existing) with BitmapOr on text search

Nota: Como o executor pode não ter acesso direto ao banco de produção, este arquivo serve como documentação das queries a serem verificadas manualmente pelo desenvolvedor.
