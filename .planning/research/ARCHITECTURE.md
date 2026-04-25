# Architecture Patterns

**Domain:** Clinical documentation workflow (PsiVault v1.6)
**Researched:** 2026-04-25
**Confidence:** HIGH

## Executive Summary

The v1.6 milestone adds clinical documentation workflow improvements to an established Next.js 15 + Prisma repository architecture. Most "foundational" UX work (tabs, timeline redesign, document grouping, auto-save, templates) is already shipped. The remaining architecture work centers on **four genuine integrations**: (1) a workspace-scoped document dashboard at `/documentos`, (2) inline note creation flow from the agenda, (3) PDF preview before document generation, and (4) an expanded keyboard shortcuts system. All four integrate cleanly with the existing repository pattern, server action conventions, and tab-based patient profile structure.

The key architectural decision is whether the new dashboard page should reuse the existing `DocumentsSection` component (with filters injected) or build a separate `DocumentDashboard` view. Given the dashboard needs cross-patient filtering, global date ranges, and pending/recent views that don't exist in the per-patient tab, a separate page-specific component is correct — but it should share the same presentation utilities (`DOCUMENT_TYPE_LABELS`, `groupByType`, `DocumentRow`).

## Recommended Architecture

### New Features & Integration Points

| Feature | Integration Point | New vs Modified | Key File(s) |
|---------|-------------------|-----------------|-------------|
| Document dashboard (`/documentos`) | New route under `(vault)`; reuses doc repo + patient repo | **New page + components** | `src/app/(vault)/documentos/page.tsx`, `src/app/(vault)/documentos/components/document-dashboard.tsx` |
| Dashboard filters (type, date, patient) | Client-side state in dashboard component; server fetches all docs then filters | **New** | Filter bar component + derived state |
| Inline note creation from agenda | `AppointmentQuickActions` → redirect to `/sessions/{id}/note` or drawer | **Modified** | `appointment-quick-actions.tsx` |
| PDF preview before save | `DocumentComposerForm` → client-side PDF preview modal using `@react-pdf/renderer` | **Modified** | `document-composer-form.tsx` + preview modal |
| Breadcrumbs (hierarchical) | Replace simple breadcrumb in patient page; add to document composer | **Modified** | `patient-profile-tabs.tsx` or page wrappers |
| Keyboard shortcuts expansion | Extend `KeyboardShortcutsProvider` + `useGlobalShortcuts` | **Modified** | `keyboard-shortcuts-provider.tsx`, page components |
| Timeline visual connector | Pure CSS enhancement to `ClinicalTimeline` | **Modified** | `clinical-timeline.tsx` + CSS |

### Component Boundaries

| Component | Responsibility | Communicates With |
|-----------|---------------|-------------------|
| `DocumentDashboard` (new) | Workspace-level document list with filters, search, grouping | `DocumentRepository`, `PatientRepository` (for names), filter state |
| `DocumentFilterBar` (new) | Type chips, date range, patient search input | Local state only; callbacks to parent |
| `InlineNoteDrawer` (new) | Drawer/modal for note creation without page navigation | `NoteComposerForm` (extracted), server actions |
| `PdfPreviewModal` (new) | Client-side PDF render preview before saving document | `@react-pdf/renderer`, document content state |
| `BreadcrumbNav` (new) | Reusable breadcrumb with structured segments | URL segments or explicit trail prop |
| `ClinicalTimeline` (mod) | Timeline with visual connector line, grouped by month | Existing: receives `TimelineEntry[]` |
| `KeyboardShortcutsProvider` (mod) | Global shortcut registration, context-aware bindings | `useGlobalShortcuts` hook, modal |
| `AppointmentQuickActions` (mod) | Add "Criar nota" action after COMPLETED status | `router.push()` to note page or drawer trigger |

### Data Flow

#### Document Dashboard Flow

```
Server Component (/documentos/page.tsx)
  ├── resolveSession() → workspaceId
  ├── Promise.all([
  │     docRepo.listActiveByWorkspace(workspaceId),   // NEW repo method
  │     patientRepo.listActive(workspaceId)           // for name resolution
  │   ])
  └── <DocumentDashboard documents={docs} patients={patients} />

Client Component (DocumentDashboard)
  ├── Local state: filters { type, dateFrom, dateTo, patientQuery }
  ├── Derived: filteredDocs = applyFilters(docs, filters)
  ├── Group by type (reuses groupByType logic)
  └── Render DocumentRow cards with patient names
```

**Repository addition required:**

```typescript
// src/lib/documents/repository.ts
interface PracticeDocumentRepository {
  // ...existing methods...
  listActiveByWorkspace(workspaceId: string): Promise<PracticeDocument[]>;
}
```

This follows the exact pattern of `listActiveByPatient` but workspace-scoped. The Prisma implementation adds `where: { workspaceId, archivedAt: null }` with `orderBy: { createdAt: "desc" }`. An index `[workspaceId, archivedAt, createdAt]` is recommended for performance.

#### Inline Note Creation Flow (Agenda → Note)

```
AppointmentCard (agenda)
  └── AppointmentQuickActions
        └── "Concluir" → completeAppointmentAction
              └── onSuccess: router.push(`/sessions/${id}/note?from=agenda`)
```

Alternative (drawer mode, higher effort):
```
AppointmentQuickActions
  └── "Registrar prontuário" → setShowNoteDrawer(true)
        └── InlineNoteDrawer
              └── NoteComposerForm (extracted shared component)
                    └── createNoteAction → router.refresh() → close drawer
```

**Recommendation:** Start with redirect flow (1 line change). Drawer mode can be a later enhancement — it requires extracting `NoteComposerForm` into a shared component that works both in-page and in-drawer, plus managing drawer state in the agenda which is already complex.

#### PDF Preview Flow

```
DocumentComposerForm
  ├── contentValue state (already exists)
  ├── "Preview PDF" button
  │     └── setShowPreview(true)
  └── PdfPreviewModal (lazy loaded)
        └── Suspense → renderPracticeDocumentPdf({ content, ...profile })
              └── Blob URL → <iframe> or <object> embed
```

The existing `renderPracticeDocumentPdf` in `src/lib/documents/pdf.tsx` already lazy-loads `@react-pdf/renderer` and returns a `Buffer`. For preview, we can reuse this function but render client-side:

```typescript
// In preview modal (client component)
const [pdfUrl, setPdfUrl] = useState<string | null>(null);
useEffect(() => {
  renderPracticeDocumentPdf({ ...input }).then(buffer => {
    const blob = new Blob([buffer], { type: "application/pdf" });
    setPdfUrl(URL.createObjectURL(blob));
  });
}, [input]);
```

Because `@react-pdf/renderer` is already dynamically imported, this adds no bundle cost to routes that don't use preview.

## Patterns to Follow

### Pattern 1: Repository Extension for New Queries
**What:** When a new page needs data not covered by existing repository methods, add a narrowly-scoped method to the interface and both implementations (Prisma + in-memory).
**When:** Dashboard needs workspace-level document listing; no existing method covers this.
**Example:**
```typescript
// Interface
listActiveByWorkspace(workspaceId: string): Promise<PracticeDocument[]>;

// Prisma impl
async listActiveByWorkspace(workspaceId: string) {
  const docs = await db.practiceDocument.findMany({
    where: { workspaceId, archivedAt: null },
    orderBy: { createdAt: "desc" },
  });
  return docs.map(mapToDomain);
}

// In-memory impl
async listActiveByWorkspace(workspaceId: string) {
  return Array.from(store.values())
    .filter(d => d.workspaceId === workspaceId && d.archivedAt === null)
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}
```

### Pattern 2: Component Extraction for Shared UI
**What:** When the same composer form needs to work in-page and in-drawer, extract the pure form into a shared component.
**When:** If implementing inline note drawer from agenda.
**Example:**
```typescript
// Extract from note-composer-form.tsx
export function NoteComposerForm({
  existingNote, appointmentId, patientId,
  createAction, updateAction, onSuccess
}: NoteComposerFormProps & { onSuccess?: () => void }) {
  // ...pure form logic, no page-level concerns...
}
```

### Pattern 3: Client-Side Filtering with Server Hydration
**What:** Load all workspace documents server-side, then filter/group client-side for responsiveness.
**When:** Dashboard filters are toggled frequently; avoids server round-trips.
**Trade-off:** Works well for hundreds of documents. If a workspace has 10K+ documents, add server-side pagination with cursor-based `skip/take`.

### Pattern 4: Lazy-Loaded PDF Preview
**What:** Keep PDF rendering out of the main bundle by dynamically importing the preview modal.
**When:** PDF preview is a secondary action, not the primary flow.
**Example:**
```typescript
const PdfPreviewModal = dynamic(
  () => import("./pdf-preview-modal").then(m => m.PdfPreviewModal),
  { ssr: false, loading: () => <Spinner /> }
);
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Reusing Patient-Tab Components for Dashboard
**What:** Importing `DocumentsSection` or `PatientDocumentosTab` into the global dashboard.
**Why bad:** These components expect `patientId`-scoped data and don't support cross-patient filtering, global date ranges, or patient name resolution. Forcing them to handle both cases creates prop sprawl and conditional logic.
**Instead:** Build `DocumentDashboard` as a top-level component that shares only presentational utilities (`DocumentRow`, `groupByType`, `TypeGroup`).

### Anti-Pattern 2: Adding Dashboard Logic to Existing Repositories
**What:** Extending `listActiveByPatient` with optional filters for type, date, patient name.
**Why bad:** Repositories should have narrow, explicit contracts. Optional filter objects make testing harder and blur the line between repository and service layer.
**Instead:** Add `listActiveByWorkspace` for the base query; apply filters in the component or a dedicated dashboard service function.

### Anti-Pattern 3: Keyboard Shortcuts in Individual Components
**What:** Each page registering its own `useEffect` keydown listeners.
**Why bad:** Conflicts, duplicate handlers, no discoverability. The existing `useGlobalShortcuts` hook already solves this with a central binding registry.
**Instead:** Extend `KeyboardShortcutsProvider` to accept route-specific bindings via context, or have pages call `useGlobalShortcuts` with their local bindings.

### Anti-Pattern 4: Server-Side PDF Preview
**What:** Calling `renderPracticeDocumentPdf` in a Server Action and streaming the buffer back.
**Why bad:** Adds latency for a visual preview that should feel instant. The client already has all the data (content, patient name, profile).
**Instead:** Render PDF client-side using the existing `@react-pdf/renderer` dynamic import.

## Scalability Considerations

| Concern | At 100 docs/patient | At 1K docs/workspace | At 10K docs/workspace |
|---------|---------------------|----------------------|-----------------------|
| Dashboard load | All docs in one query | Add `take: 100` with "load more" | Cursor pagination + search index |
| Timeline render | Client-side grouping fine | Virtualized list (react-window) | Paginate by year, lazy load |
| PDF preview | Instant | Instant | Instant (client-side render) |
| Keyboard shortcuts | Global registry O(n) | O(n) with 20-30 bindings | Still negligible |

## New Database Index Recommendations

```prisma
// For workspace-level document queries (dashboard)
@@index([workspaceId, archivedAt, createdAt])

// For patient-name search in dashboard filters
@@index([workspaceId, deletedAt, fullName])  // on Patient
```

The existing `@@index([workspaceId, patientId])` on `PracticeDocument` is sufficient for patient-scoped queries. The dashboard needs the additional triple index for efficient `workspaceId + archivedAt = null + orderBy createdAt` queries.

## Sources

- Existing codebase: `src/lib/documents/repository.ts`, `src/lib/clinical/repository.ts`, `src/lib/appointments/repository.ts`
- Existing components: `clinical-timeline.tsx`, `documents-section.tsx`, `document-composer-form.tsx`, `note-composer-form.tsx`
- Schema: `prisma/schema.prisma` (PracticeDocument, ClinicalNote, Appointment indexes)
- PDF architecture: `src/lib/documents/pdf.tsx` (lazy-loaded @react-pdf/renderer)
- Keyboard system: `src/components/ui/keyboard-shortcuts-modal.tsx`, `src/app/(vault)/components/keyboard-shortcuts-provider.tsx`
- UX requirements: `.planning/document-flow-ux-plan.md`
- Project context: `.planning/PROJECT.md`
