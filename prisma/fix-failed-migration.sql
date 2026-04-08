-- ============================================================================
-- RESOLUÇÃO DA MIGRAÇÃO FALHADA: 20260320120000_notifications
-- Executar no SQL Editor do Supabase
-- ============================================================================

-- Passo 1: Verificar estado atual da migração
SELECT 
  migration_name, 
  applied_at, 
  rolled_back_at,
  started_at
FROM _prisma_migrations 
WHERE migration_name = '20260320120000_notifications';

-- Passo 2: Verificar se as tabelas já existem
SELECT 
  table_name,
  table_schema
FROM information_schema.tables 
WHERE table_name IN ('workspace_smtp_configs', 'notification_jobs')
  AND table_schema = 'public';

-- ============================================================================
-- RESULTADO DO PASSO 2:
-- 
-- CASO A: Ambas tabelas existem → Apenas marque a migração como aplicada
-- CASO B: Tabelas NÃO existem → Execute a migração manualmente + marque
-- ============================================================================

-- ────────────────────────────────────────────────────────────────────────────
-- CASO A: Se as tabelas JÁ existem (migração foi parcialmente aplicada)
-- ────────────────────────────────────────────────────────────────────────────
-- Descomente apenas se as tabelas existem:
--
-- UPDATE _prisma_migrations 
-- SET applied_at = NOW()
-- WHERE migration_name = '20260320120000_notifications';

-- ────────────────────────────────────────────────────────────────────────────
-- CASO B: Se as tabelas NÃO existem (executar manualmente)
-- ────────────────────────────────────────────────────────────────────────────
-- Descomente APENAS se as tabelas NÃO existem:
--
-- BEGIN;
--
-- -- Criar tabela workspace_smtp_configs
-- CREATE TABLE "workspace_smtp_configs" (
--     "id" TEXT NOT NULL,
--     "workspace_id" TEXT NOT NULL,
--     "host" TEXT NOT NULL,
--     "port" INTEGER NOT NULL DEFAULT 587,
--     "secure" BOOLEAN NOT NULL DEFAULT false,
--     "username" TEXT NOT NULL,
--     "password_ciphertext" TEXT NOT NULL,
--     "from_name" TEXT NOT NULL,
--     "from_email" TEXT NOT NULL,
--     "send_reminder_24h" BOOLEAN NOT NULL DEFAULT true,
--     "send_reminder_1h" BOOLEAN NOT NULL DEFAULT true,
--     "send_confirmation" BOOLEAN NOT NULL DEFAULT true,
--     "send_cancellation" BOOLEAN NOT NULL DEFAULT true,
--     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     "updated_at" TIMESTAMP(3) NOT NULL,
--     CONSTRAINT "workspace_smtp_configs_pkey" PRIMARY KEY ("id")
-- );
--
-- -- Criar tabela notification_jobs
-- CREATE TABLE "notification_jobs" (
--     "id" TEXT NOT NULL,
--     "workspace_id" TEXT NOT NULL,
--     "appointment_id" TEXT NOT NULL,
--     "patient_id" TEXT NOT NULL,
--     "recipient_email" TEXT NOT NULL,
--     "type" TEXT NOT NULL,
--     "status" TEXT NOT NULL DEFAULT 'PENDING',
--     "scheduled_for" TIMESTAMP(3) NOT NULL,
--     "sent_at" TIMESTAMP(3),
--     "failed_at" TIMESTAMP(3),
--     "error_note" TEXT,
--     "idempotency_key" TEXT NOT NULL,
--     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
--     "updated_at" TIMESTAMP(3) NOT NULL,
--     CONSTRAINT "notification_jobs_pkey" PRIMARY KEY ("id")
-- );
--
-- -- Criar índices
-- CREATE UNIQUE INDEX "workspace_smtp_configs_workspace_id_key" ON "workspace_smtp_configs"("workspace_id");
-- CREATE UNIQUE INDEX "notification_jobs_idempotency_key_key" ON "notification_jobs"("idempotency_key");
-- CREATE INDEX "notification_jobs_workspace_id_status_scheduled_for_idx" ON "notification_jobs"("workspace_id", "status", "scheduled_for");
-- CREATE INDEX "notification_jobs_appointment_id_type_idx" ON "notification_jobs"("appointment_id", "type");
--
-- -- Criar foreign keys
-- ALTER TABLE "workspace_smtp_configs" 
--   ADD CONSTRAINT "workspace_smtp_configs_workspace_id_fkey" 
--   FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") 
--   ON DELETE CASCADE ON UPDATE CASCADE;
--
-- ALTER TABLE "notification_jobs" 
--   ADD CONSTRAINT "notification_jobs_workspace_id_fkey" 
--   FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") 
--   ON DELETE CASCADE ON UPDATE CASCADE;
--
-- ALTER TABLE "notification_jobs" 
--   ADD CONSTRAINT "notification_jobs_appointment_id_fkey" 
--   FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") 
--   ON DELETE CASCADE ON UPDATE CASCADE;
--
-- ALTER TABLE "notification_jobs" 
--   ADD CONSTRAINT "notification_jobs_patient_id_fkey" 
--   FOREIGN KEY ("patient_id") REFERENCES "patients"("id") 
--   ON DELETE CASCADE ON UPDATE CASCADE;
--
-- -- Marcar migração como aplicada
-- UPDATE _prisma_migrations 
-- SET applied_at = NOW()
-- WHERE migration_name = '20260320120000_notifications';
--
-- COMMIT;

-- ============================================================================
-- Verificação final (executar após a correção)
-- ============================================================================
-- SELECT migration_name, applied_at FROM _prisma_migrations 
-- ORDER BY applied_at DESC LIMIT 10;
