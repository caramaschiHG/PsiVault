# Phase 39: Editor Unificado e Preview A4 - Context

**Gathered:** 2026-04-25
**Status:** Ready for planning
**Source:** Existing draft plan (39-PLAN.md) + ROADMAP.md

<domain>
## Phase Boundary

Esta fase entrega a experiência de escrita e visualização de documentos em nível premium: um único editor contextual que se adapta ao tipo de documento, visualização em layout A4 simulado na tela, e geração de PDF universal para todos os documentos finalizados. Depende do schema e domain model da Phase 37 e do ciclo de vida draft→finalized→signed→delivered da Phase 38.

</domain>

<decisions>
## Implementation Decisions

### Editor Unificado
- D-01: Criar `DocumentEditor` único com props `mode: "free" | "structured"`, `documentType`, `defaultContent`, `patientId`, `appointmentId?`
- D-02: Modo `free`: rich text completo (para `session_record`) — reutilizar/melhorar `RichTextEditor` existente
- D-03: Modo `structured`: rich text com seções pré-definidas pelo template (ex: Laudo → [Identificação], [Encaminhamento], [Objetivo], [Procedimentos], [Considerações Finais])
- D-04: Cada seção em modo estruturado é um bloco editável; template define seções obrigatórias
- D-05: Refatorar templates de "pre-filled string" para "structured template" com `type`, `mode`, `sections[]`, `preFill(context)`
- D-06: Template `session_record` tem modo `free`, seções vazias
- D-07: Templates de documentos formais têm modo `structured`, seções definidas

### Visualização A4
- D-08: Criar `DocumentPaperView` com layout CSS simulando A4: `width: 210mm`, `min-height: 297mm`, margens, box-shadow
- D-09: Tipografia: serif para body (times-like), sans-serif para headers
- D-10: Cabeçalho com título do documento, dados do paciente, dados do profissional (CRP)
- D-11: Bloco de assinatura aparece apenas se `signed`, com imagem da assinatura + linha + nome/data
- D-12: Layout responsivo: scale/transform CSS para miniatura em mobile

### PDF Universal
- D-13: Generalizar geração de PDF em `src/lib/documents/pdf.tsx` — remover restrição hardcoded `patient_record_summary`
- D-14: Suportar rich text em PDF convertendo HTML para nodes do `@react-pdf` (usar `react-pdf-html` se compatível com v3, senão mapper custom)
- D-15: Suportar seções estruturadas em PDF: cada seção vira `<View>` com `<Text>` heading
- D-16: Cabeçalho do PDF: título, nome do paciente, nome do profissional, CRP
- D-17: Bloco de assinatura no PDF: imagem base64 (do Supabase), linha, nome, data
- D-18: Rota `/api/.../pdf` permite qualquer documento com status `finalized`, `signed`, ou `delivered`; bloqueia `draft`
- D-19: Criar `DocumentPdfPreviewModal` lazy-loaded via `next/dynamic` — iframe/object com URL da API PDF, botões "Fechar" e "Baixar PDF"
- D-20: Limitar tags suportadas em rich text para PDF: `p`, `br`, `strong`, `em`, `ul`, `ol`, `li`

### Assinatura como Ritual
- D-21: Remover gate de assinatura da criação/edição — não redirecionar para settings se falta assinatura
- D-22: Mostrar aviso sutil na criação: "Para assinar documentos, configure sua assinatura em Configurações"
- D-23: Gate de assinatura apenas no `signDocumentAction` — se não há `signatureAsset`, retorna erro com link para `/settings/profile`
- D-24: Botão "Assinar" visível apenas em documentos `finalized`; desabilitado/redirect se sem assinatura configurada

### Variáveis e Segurança
- D-25: Substituição segura de variáveis: `{{patientName}}`, `{{date}}`, `{{professionalName}}`, `{{crp}}`
- D-26: Sanitizar antes de renderizar para prevenir injection
- D-27: Para `session_record`: usar `dangerouslySetInnerHTML` com `sanitizeRichTextHtml` existente
- D-28: Para documentos estruturados: mapear seções para `<section>` elements com headings

### the agent's Discretion
- Biblioteca específica para conversão HTML→PDF nodes (react-pdf-html vs custom mapper) — testar compatibilidade
- Estratégia exata de lazy loading do preview modal (iframe vs object vs PDF.js)
- Organização exata dos subdiretórios em `src/app/(vault)/patients/[patientId]/documents/`
- Detalhes de estilo CSS específicos do A4 (font sizes, margins exatos)
- Como lidar com quebra de página no PDF (page break hints)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Domain Model & Schema
- `src/lib/documents/model.ts` — Document domain model, DocumentStatus enum, funções de transição
- `src/lib/documents/repository.ts` — Document repository interface
- `src/lib/documents/repository.prisma.ts` — Implementação Prisma do repository
- `prisma/schema.prisma` — Schema Document com status, appointmentId, signedAt, etc.

### Editor Existente
- Componentes atuais de rich text no projeto (localizar via grep)
- `src/lib/documents/templates.ts` — Templates atuais (se existir)

### PDF Existente
- `src/lib/documents/pdf.tsx` — Geração atual de PDF
- `src/app/api/patients/[patientId]/documents/[documentId]/pdf/route.ts` — Rota atual de PDF
- Lógica `canExportDocumentAsPdf` existente

### UI/UX Patterns
- `src/styles/motion.css` — Tokens de motion (se aplicável a modais)
- `CLAUDE.md` — Regras de vocabulário, anti-padrões visuais, direção de marca

</canonical_refs>

<specifics>
## Specific Ideas

- DocumentEditor localizado em `src/app/(vault)/patients/[patientId]/documents/components/document-editor.tsx`
- DocumentPaperView localizado em `src/app/(vault)/patients/[patientId]/documents/[documentId]/components/document-paper-view.tsx`
- DocumentPdfPreviewModal em `src/components/document-pdf-preview-modal.tsx` (shared)
- Template structure em `src/lib/documents/templates.ts`
- PDF generalizado em `src/lib/documents/pdf.tsx`

</specifics>

<deferred>
## Deferred Ideas

- Integração direta com atendimentos (pre-fill profundo) — Phase 40
- Dashboard global de documentos — Phase 41
- Templates visuais avançados por tipo — pode ser expandido na Phase 42

</deferred>

---

*Phase: 39-editor-unificado*
*Context gathered: 2026-04-25 via draft plan conversion*
