/**
 * Document composer page — /patients/[patientId]/documents/new?type=[documentType]
 *
 * Server component. Guards:
 * 1. type query param must be a valid DocumentType
 * 2. Patient must exist
 * 3. Signature asset must be configured (Phase 1 decision)
 *
 * Builds pre-fill context from profile, patient, and completed appointments.
 * Calls buildDocumentContent(type, context) server-side and passes result
 * as defaultContent prop to DocumentComposerForm client component.
 */

import { notFound } from "next/navigation";
import Link from "next/link";
import { getPatientRepository } from "../../../../../../lib/patients/store";
import { getAppointmentRepository } from "../../../../../../lib/appointments/store";
import { getPracticeProfileSnapshot } from "../../../../../../lib/setup/profile";
import { buildDocumentContent } from "../../../../../../lib/documents/templates";
import type { DocumentType } from "../../../../../../lib/documents/model";
import { DOCUMENT_TYPE_LABELS } from "../../../../../../lib/documents/presenter";
import { DocumentComposerForm } from "./components/document-composer-form";
import { createDocumentAction } from "./actions";
import { resolveSession } from "../../../../../../lib/supabase/session";
import { getClinicalNoteRepository } from "../../../../../../lib/clinical/store";
import { deriveSessionNumber } from "../../../../../../lib/clinical/model";
import type { Appointment } from "../../../../../../lib/appointments/model";

const VALID_TYPES = new Set<DocumentType>([
  "declaration_of_attendance",
  "receipt",
  "anamnesis",
  "psychological_report",
  "consent_and_service_contract",
  "session_note",
  "session_record",
  "referral_letter",
  "patient_record_summary",
]);

const TYPE_METADATA: Array<{
  type: DocumentType;
  category: string;
  description: string;
}> = [
  {
    type: "anamnesis",
    category: "Clínico",
    description: "Histórico clínico inicial do paciente",
  },
  {
    type: "session_note",
    category: "Clínico",
    description: "Registro de progresso e intervenções da sessão",
  },
  {
    type: "session_record",
    category: "Clínico",
    description: "Registro livre, privado e exclusivo do psicólogo, sem modelo pré-definido",
  },
  {
    type: "psychological_report",
    category: "Formal",
    description: "Avaliação psicológica formal para fins específicos",
  },
  {
    type: "referral_letter",
    category: "Formal",
    description: "Encaminhamento para outro especialista",
  },
  {
    type: "declaration_of_attendance",
    category: "Administrativo",
    description: "Atesta o comparecimento do paciente a consultas",
  },
  {
    type: "receipt",
    category: "Administrativo",
    description: "Comprova o pagamento de sessões de psicologia",
  },
  {
    type: "consent_and_service_contract",
    category: "Administrativo",
    description: "Contrato e consentimento informado",
  },
  {
    type: "patient_record_summary",
    category: "Compartilhável",
    description: "Síntese revisável do prontuário para envio ao paciente em PDF",
  },
];

interface DocumentComposerPageProps {
  params: Promise<{ patientId: string }>;
  searchParams: Promise<{ type?: string; appointmentId?: string; from?: string }>;
}

export default async function DocumentComposerPage({
  params,
  searchParams,
}: DocumentComposerPageProps) {
  const { accountId, workspaceId } = await resolveSession();
  const { patientId } = await params;
  const { type: rawType, appointmentId: rawAppointmentId, from: rawFrom } = await searchParams;
  const appointmentId = rawAppointmentId ?? null;
  const from = rawFrom ?? null;

  // 1. Patient guard (needed for both selection UI and composer)
  const patientRepo = getPatientRepository();
  const patient = await patientRepo.findById(patientId, workspaceId);
  if (!patient) {
    notFound();
  }

  // 1.5. Appointment lookup (if linked)
  let appointment: Appointment | null = null;
  if (appointmentId) {
    const appointmentRepo = getAppointmentRepository();
    const appt = await appointmentRepo.findById(appointmentId, workspaceId);
    if (appt && appt.patientId === patient.id) {
      appointment = appt;
    }
    // If cross-patient or not found, silently ignore (defensive)
  }

  // 2. Type validation — if absent/invalid, render selection grid
  if (!rawType || !VALID_TYPES.has(rawType as DocumentType)) {
    return (
      <main style={shellStyle}>
        <nav style={breadcrumbStyle}>
          <Link href="/patients" style={breadcrumbLinkStyle}>Pacientes</Link>
          <span style={breadcrumbSepStyle}>›</span>
          <Link href={`/patients/${patient.id}`} style={breadcrumbLinkStyle}>
            {patient.socialName ?? patient.fullName}
          </Link>
          <span style={breadcrumbSepStyle}>›</span>
          <span style={breadcrumbCurrentStyle}>Novo documento</span>
        </nav>

        <div style={headingStyle}>
          <p style={eyebrowStyle}>Documentos</p>
          <h1 style={titleStyle}>Escolha o tipo de documento</h1>
        </div>

        <div style={typeGridStyle}>
          {TYPE_METADATA.map(({ type, category, description }) => (
            <Link
              key={type}
              href={`/patients/${patientId}/documents/new?type=${type}`}
              className="document-type-card"
            >
              <div style={typeCardHeaderStyle}>
                <span className="document-type-accent" aria-hidden="true" />
                <span style={typeCardCategoryStyle}>{category}</span>
              </div>
              <strong style={typeCardNameStyle}>{DOCUMENT_TYPE_LABELS[type]}</strong>
              <span style={typeCardDescStyle}>{description}</span>
              <span style={typeCardActionStyle}>
                {type === "session_record" ? "Abrir editor" : "Selecionar modelo"}
              </span>
            </Link>
          ))}
        </div>
      </main>
    );
  }

  const documentType = rawType as DocumentType;

  // 3. Profile for pre-fill and signature notice
  const profile = await getPracticeProfileSnapshot(accountId, workspaceId);
  const hasSignature = !!profile.signatureAsset;

  // 4. Pre-fill context assembly
  const appointmentRepo = getAppointmentRepository();
  // (patient already fetched above)
  const allAppointments = await appointmentRepo.listByPatient(patient.id, workspaceId);
  const completedAppointments = allAppointments.filter(
    (a) => a.status === "COMPLETED",
  );

  // Sort completed appointments by startsAt ascending for date range
  const sortedCompleted = [...completedAppointments].sort(
    (a, b) => a.startsAt.getTime() - b.startsAt.getTime(),
  );

  const sessionCount =
    sortedCompleted.length > 0 ? sortedCompleted.length : null;

  const sessionDateRange =
    sortedCompleted.length > 0
      ? `${formatDate(sortedCompleted[0].startsAt)} a ${formatDate(sortedCompleted[sortedCompleted.length - 1].startsAt)}`
      : null;

  const intakeDate =
    sortedCompleted.length > 0 ? formatDateShort(sortedCompleted[0].startsAt) : null;

  const patientRecordSummaryEntries =
    documentType === "patient_record_summary"
      ? await buildPatientRecordSummaryEntries(patient.id, workspaceId, allAppointments, appointment)
      : null;

  const todayLabel = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
  }).format(new Date());

  const context = {
    patientFullName: patient.socialName ?? patient.fullName,
    professionalName: profile.fullName ?? "",
    crp: profile.crp ?? "",
    todayLabel,
    sessionCount,
    sessionDateRange,
    intakeDate,
    amountLabel: null, // Phase 5 will enrich — priceInCents does not exist yet
    paymentMethod: null,
    patientRecordSummaryEntries,
    appointmentDateLabel: appointment ? formatDateShort(appointment.startsAt) : null,
    appointmentTimeLabel: appointment ? formatTime(appointment.startsAt) : null,
    appointmentCareModeLabel: appointment ? (appointment.careMode === "IN_PERSON" ? "Presencial" : "Online") : null,
    singleSessionDateLabel: appointment ? formatDateShort(appointment.startsAt) : null,
  };

  // 5. Build template content server-side
  const defaultContent = buildDocumentContent(documentType, context);

  // 6. Display name for breadcrumb
  const patientDisplayName = patient.socialName
    ? `${patient.fullName} (${patient.socialName})`
    : patient.fullName;

  const typeLabel = DOCUMENT_TYPE_LABELS[documentType];

  return (
    <main style={shellStyle}>
      {/* Breadcrumb */}
      <nav style={breadcrumbStyle} className="focus-mode-hideable">
        <Link href="/patients" style={breadcrumbLinkStyle}>
          Pacientes
        </Link>
        <span style={breadcrumbSepStyle}>›</span>
        <Link href={`/patients/${patient.id}`} style={breadcrumbLinkStyle}>
          {patientDisplayName}
        </Link>
        <span style={breadcrumbSepStyle}>›</span>
        <span style={breadcrumbCurrentStyle}>Novo documento</span>
      </nav>

      {/* Page heading */}
      <div style={headingStyle}>
        <p style={eyebrowStyle}>Documentos</p>
        <h1 style={titleStyle}>{typeLabel}</h1>
      </div>

      {/* Signature notice (non-blocking) */}
      {!hasSignature && (
        <p className="inline-notice">
          Para assinar documentos, configure sua assinatura em{" "}
          <Link href="/settings/profile">Configurações → Perfil</Link>.
        </p>
      )}

      {/* 7. Document composer form */}
      <DocumentComposerForm
        defaultContent={defaultContent}
        patientId={patient.id}
        documentType={documentType}
        createDocumentAction={createDocumentAction}
        appointmentId={appointment?.id ?? null}
        from={from}
        patientName={patientDisplayName}
      />
    </main>
  );
}

async function buildPatientRecordSummaryEntries(
  patientId: string,
  workspaceId: string,
  appointments: Awaited<ReturnType<ReturnType<typeof getAppointmentRepository>["listByPatient"]>>,
  linkedAppointment: Appointment | null = null,
) {
  const clinicalRepo = getClinicalNoteRepository();
  const notes = await clinicalRepo.listByPatient(patientId, workspaceId);
  const appointmentById = new Map(appointments.map((appointment) => [appointment.id, appointment]));

  let entries = notes
    .map((note) => {
      const appointment = appointmentById.get(note.appointmentId);
      if (!appointment) return null;

      const sessionNumber = deriveSessionNumber(appointment.id, appointments);

      return {
        sessionLabel: sessionNumber != null ? `Sessão ${sessionNumber}` : "Sessão registrada",
        sessionDateLabel: formatDateShort(appointment.startsAt),
        demand: note.demand,
        observedMood: note.observedMood,
        themes: note.themes,
        clinicalEvolution: note.clinicalEvolution,
        nextSteps: note.nextSteps,
        freeTextExcerpt: summarizeFreeText(note.freeText),
        startsAt: appointment.startsAt,
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

  // Filter notes up to linked appointment date (APPT-04)
  if (linkedAppointment) {
    const cutoff = linkedAppointment.startsAt.getTime();
    entries = entries.filter((e) => e.startsAt.getTime() <= cutoff);
  }

  return entries
    .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime())
    .slice(0, 20)
    .map(({ startsAt: _startsAt, ...entry }) => entry);
}

function summarizeFreeText(freeText: string): string | null {
  const normalized = freeText.replace(/\s+/g, " ").trim();
  if (normalized.length === 0) return null;
  if (normalized.length <= 220) return normalized;
  return `${normalized.slice(0, 217).trimEnd()}...`;
}

// ─── Date helpers ─────────────────────────────────────────────────────────────

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function formatDateShort(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(date);
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const shellStyle = {
  padding: "2rem 2.5rem",
  maxWidth: 960,
  width: "100%",
  display: "grid",
  gap: "1.5rem",
  alignContent: "start",
} satisfies React.CSSProperties;

const breadcrumbStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.4rem",
  fontSize: "0.82rem",
} satisfies React.CSSProperties;

const breadcrumbLinkStyle = {
  color: "var(--color-text-2)",
  textDecoration: "none",
  fontWeight: 500,
} satisfies React.CSSProperties;

const breadcrumbSepStyle = {
  color: "var(--color-text-4)",
  fontSize: "0.75rem",
} satisfies React.CSSProperties;

const breadcrumbCurrentStyle = {
  color: "var(--color-text-3)",
  fontWeight: 500,
} satisfies React.CSSProperties;

const headingStyle = {
  display: "grid",
  gap: "0.2rem",
} satisfies React.CSSProperties;

const eyebrowStyle = {
  margin: 0,
  textTransform: "uppercase" as const,
  letterSpacing: "0.12em",
  fontSize: "0.7rem",
  color: "var(--color-brown-mid)",
  fontWeight: 600,
} satisfies React.CSSProperties;

const titleStyle = {
  margin: 0,
  fontSize: "2rem",
  fontWeight: 700,
  fontFamily: "'IBM Plex Serif', serif",
  color: "var(--color-text-1)",
} satisfies React.CSSProperties;

const typeGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
  gap: "1rem",
} satisfies React.CSSProperties;

const typeCardHeaderStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.6rem",
} satisfies React.CSSProperties;

const typeCardCategoryStyle = {
  fontSize: "0.7rem",
  textTransform: "uppercase" as const,
  letterSpacing: "0.14em",
  color: "var(--color-brown-mid)",
  fontWeight: 700,
} satisfies React.CSSProperties;

const typeCardNameStyle = {
  fontSize: "1rem",
  color: "var(--color-text-1)",
  fontWeight: 700,
  lineHeight: 1.35,
  fontFamily: "'IBM Plex Serif', serif",
} satisfies React.CSSProperties;

const typeCardDescStyle = {
  fontSize: "0.82rem",
  color: "var(--color-text-3)",
  lineHeight: 1.55,
} satisfies React.CSSProperties;

const typeCardActionStyle = {
  marginTop: "auto",
  fontSize: "0.77rem",
  color: "var(--color-accent)",
  fontWeight: 600,
  letterSpacing: "0.04em",
} satisfies React.CSSProperties;
