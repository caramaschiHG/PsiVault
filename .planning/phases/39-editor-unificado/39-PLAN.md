# Phase 39: Editor Unificado e Preview A4 — Plan

**Status:** Draft
**Phase:** 39
**Name:** Editor Unificado e Preview A4
**Depends on:** Phase 37, Phase 38
**Context:** Requires domain model with status and draft flow stable.

---

## Goal

Experiência de escrita e visualização de documentos é premium: um único editor que se adapta ao tipo de documento, visualização em layout A4 simulado, e PDF universal para todos os documentos finalizados.

---

## Wave 1: Editor Contextual Unificado (Day 1-2)

### Plan 39-01: DocumentEditor Component

**Objective:** Substituir `DocumentComposerForm` e editores divergentes por um único componente inteligente.

**Tasks:**
1. **Create `DocumentEditor`** (`src/app/(vault)/patients/[patientId]/documents/components/document-editor.tsx`):
   - Props: `mode: "free" | "structured"`, `documentType`, `defaultContent`, `patientId`, `appointmentId?`
   - Modo `free`: rich text completo (para `session_record`) — mesmo `RichTextEditor` existente, mas melhorado
   - Modo `structured`: rich text com seções pré-definidas pelo template
     - Ex: Laudo → [Identificação], [Encaminhamento], [Objetivo], [Procedimentos], [Considerações Finais]
     - Cada seção é um bloco editável
     - Template define quais seções são obrigatórias

2. **Template structure in domain** (`src/lib/documents/templates.ts`):
   - Refactor templates from "pre-filled string" to "structured template"
   - Each template has: `type`, `mode`, `sections[]`, `preFill(context)`
   - `session_record` template has mode `free`, empty sections
   - Formal document templates have mode `structured`, defined sections

3. **Variable substitution**:
   - Safe substitution of `{{patientName}}`, `{{date}}`, `{{professionalName}}`, `{{crp}}`
   - Sanitize before rendering to prevent injection

**Success Criteria:**
- Editor único funciona para todos os tipos
- Modo estruturado guia o psicólogo sem ser restrictivo
- Variáveis são substituídas corretamente

---

## Wave 2: Visualização A4 (Day 2-3)

### Plan 39-02: Document A4 Preview

**Objective:** Página de visualização renderiza documento como se fosse um papel A4.

**Tasks:**
1. **Create `DocumentPaperView`** (`src/app/(vault)/patients/[patientId]/documents/[documentId]/components/document-paper-view.tsx`):
   - Server Component (or Client if needs interactivity)
   - CSS layout simulating A4: `width: 210mm`, `min-height: 297mm`, margins, box-shadow
   - Typography: serif font for body (times-like), sans-serif for headers
   - Header block: título do documento, dados do paciente, dados do profissional (CRP)
   - Content block: rendered HTML for `session_record` (sanitized), or structured sections for formal docs
   - Signature block: if `signed`, shows signature image with date and professional name

2. **Styles** (`globals.css` ou module):
   - `.document-paper`: A4 dimensions, white background, subtle shadow
   - `.document-paper header`: professional info
   - `.document-paper content`: proper paragraph spacing, line-height
   - `.document-paper signature`: signature image + line + name/date

3. **Read-only rendering**:
   - For `session_record`: `dangerouslySetInnerHTML` with `sanitizeRichTextHtml` (existing)
   - For structured docs: map sections to `<section>` elements with headings

**Success Criteria:**
- Visualização parece um documento real, não um bloco de notas
- Layout responsivo (escala em mobile)
- Assinatura aparece apenas em documentos `signed`

---

## Wave 3: PDF Universal (Day 3-4)

### Plan 39-03: Universal PDF Generation

**Objective:** Todo documento `finalized` ou `signed` pode gerar PDF. Preview embutido.

**Tasks:**
1. **Generalize PDF generation** (`src/lib/documents/pdf.tsx`):
   - Remove hardcoded `patient_record_summary` only restriction
   - Support rich text: convert HTML to `@react-pdf` nodes
     - Option A: Use `react-pdf-html` library (if compatible with react-pdf v3)
     - Option B: Custom HTML→PDF mapper (h1→Text, p→Text, ul→View with bullets, etc.)
   - Support structured sections: each section becomes a `<View>` with `<Text>` heading
   - Header: title, patient name, professional name, CRP
   - Signature block: image (base64 from Supabase), line, name, date

2. **Update PDF route** (`src/app/api/patients/[patientId]/documents/[documentId]/pdf/route.ts`):
   - Remove `canExportDocumentAsPdf` hardcoded check
   - Allow any document with status `finalized`, `signed`, or `delivered`
   - Block `draft` (não faz sentido PDF de rascunho)

3. **PDF Preview Modal** (`src/components/document-pdf-preview-modal.tsx`):
   - Lazy-loaded via `next/dynamic`
   - Iframe or object tag showing `/api/.../pdf` URL
   - Buttons: "Fechar", "Baixar PDF"
   - Does NOT load in initial bundle

**Success Criteria:**
- PDF generates for all finalized+ document types
- Rich text renders correctly in PDF (lists, bold, paragraphs)
- Preview modal opens without page navigation
- Lazy loading keeps route bundle lean

---

## Wave 4: Assinatura como Ritual (Day 4)

### Plan 39-04: Signature Finalization Flow

**Objective:** Assinatura é requisito apenas para `sign`, não para criar/editar.

**Tasks:**
1. **Remove signature gate from creation** (`new/page.tsx`):
   - Não redireciona para settings se falta assinatura
   - Mostra aviso sutil: "Para assinar documentos, configure sua assinatura em Configurações"

2. **Add signature gate to `signDocumentAction`**:
   - Se não há `signatureAsset`, retorna erro com link para `/settings/profile`
   - Mensagem: "Configure sua assinatura em Perfil para finalizar este documento"

3. **Update view page**:
   - Botão "Assinar" visível apenas em documentos `finalized`
   - Botão "Assinar" desabilitado/redirect se sem assinatura configurada

**Success Criteria:**
- Usuário pode criar e editar documentos sem assinatura
- Assinatura só é requisito no momento de `sign`
- Mensagem de erro é útil e direciona para configuração

---

## Verification Plan

- [ ] Editor estruturado injeta seções corretamente
- [ ] Visualização A4 renderiza assinatura em documentos signed
- [ ] PDF contém todo o conteúdo formatado
- [ ] PDF preview modal abre sem reload
- [ ] Documento pode ser criado sem assinatura configurada
- [ ] Lazy loading: pdf component não está no bundle inicial da rota

---

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| react-pdf-html incompatível | Testar antes; fallback para plain text com markdown-like parsing |
| A4 layout quebra em mobile | Usar scale/transform CSS para miniatura em telas pequenas |
| PDF de rich text complexo | Limitar tags suportadas (p, br, strong, em, ul, ol, li) |

---

*Phase: 39-editor-unificado*
*Plan created: 2026-04-25*
