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
import { DocumentComposerForm } from "./components/document-composer-form";
import { createDocumentAction } from "./actions";
import { resolveSession } from "../../../../../../lib/supabase/session";

const VALID_TYPES = new Set<DocumentType>([
  "declaration_of_attendance",
  "receipt",
  "anamnesis",
  "psychological_report",
  "consent_and_service_contract",
  "session_note",
  "referral_letter",
]);

const TYPE_LABELS: Record<DocumentType, string> = {
  declaration_of_attendance: "Declaração de Comparecimento",
  receipt: "Recibo de Pagamento",
  anamnesis: "Anamnese",
  psychological_report: "Laudo Psicológico",
  consent_and_service_contract: "Contrato de Prestação de Serviços",
  session_note: "Evolução de Sessão",
  referral_letter: "Carta de Encaminhamento",
};

const TYPE_METADATA: Array<{
  type: DocumentType;
  icon: string;
  description: string;
}> = [
  {
    type: "anamnesis",
    icon: "📋",
    description: "Histórico clínico inicial do paciente",
  },
  {
    type: "session_note",
    icon: "📝",
    description: "Registro de progresso e intervenções da sessão",
  },
  {
    type: "psychological_report",
    icon: "📑",
    description: "Avaliação psicológica formal para fins específicos",
  },
  {
    type: "referral_letter",
    icon: "✉️",
    description: "Encaminhamento para outro especialista",
  },
  {
    type: "declaration_of_attendance",
    icon: "🗓️",
    description: "Atesta o comparecimento do paciente a consultas",
  },
  {
    type: "receipt",
    icon: "💳",
    description: "Comprova o pagamento de sessões de psicologia",
  },
  {
    type: "consent_and_service_contract",
    icon: "📜",
    description: "Contrato e consentimento informado",
  },
];

interface DocumentComposerPageProps {
  params: Promise<{ patientId: string }>;
  searchParams: Promise<{ type?: string }>;
}

export default async function DocumentComposerPage({
  params,
  searchParams,
}: DocumentComposerPageProps) {
  const { accountId, workspaceId } = await resolveSession();
  const { patientId } = await params;
  const { type: rawType } = await searchParams;

  // 1. Patient guard (needed for both selection UI and composer)
  const patientRepo = getPatientRepository();
  const patient = await patientRepo.findById(patientId, workspaceId);
  if (!patient) {
    notFound();
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
          {TYPE_METADATA.map(({ type, icon, description }) => (
            <Link
              key={type}
              href={`/patients/${patientId}/documents/new?type=${type}`}
              style={typeCardStyle}
            >
              <span style={typeCardIconStyle}>{icon}</span>
              <strong style={typeCardNameStyle}>{TYPE_LABELS[type]}</strong>
              <span style={typeCardDescStyle}>{description}</span>
            </Link>
          ))}
        </div>
      </main>
    );
  }

  const documentType = rawType as DocumentType;

  // 3. Signature gate
  const profile = getPracticeProfileSnapshot(accountId, workspaceId);
  if (!profile.signatureAsset) {
    return (
      <main style={shellStyle}>
        <nav style={breadcrumbStyle}>
          <Link href="/patients" style={breadcrumbLinkStyle}>
            Pacientes
          </Link>
          <span style={breadcrumbSepStyle}>›</span>
          <Link href={`/patients/${patient.id}`} style={breadcrumbLinkStyle}>
            {patient.fullName}
          </Link>
          <span style={breadcrumbSepStyle}>›</span>
          <span style={breadcrumbCurrentStyle}>Novo documento</span>
        </nav>

        <div style={gateNoticeStyle}>
          <p style={gateNoticeTextStyle}>
            Documentos requerem assinatura configurada.
          </p>
          <Link href="/setup/profile" style={gateNoticeLinkStyle}>
            Configurar em Perfil
          </Link>
        </div>
      </main>
    );
  }

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
  };

  // 5. Build template content server-side
  const defaultContent = buildDocumentContent(documentType, context);

  // 6. Display name for breadcrumb
  const patientDisplayName = patient.socialName
    ? `${patient.fullName} (${patient.socialName})`
    : patient.fullName;

  const typeLabel = TYPE_LABELS[documentType];

  return (
    <main style={shellStyle}>
      {/* Breadcrumb */}
      <nav style={breadcrumbStyle}>
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

      {/* 7. Document composer form */}
      <DocumentComposerForm
        defaultContent={defaultContent}
        patientId={patient.id}
        documentType={documentType}
        createDocumentAction={createDocumentAction}
      />
    </main>
  );
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
  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
  gap: "0.875rem",
} satisfies React.CSSProperties;

const typeCardStyle = {
  display: "grid",
  gap: "0.4rem",
  padding: "1.25rem 1.35rem",
  borderRadius: "16px",
  background: "rgba(255, 252, 247, 0.95)",
  border: "1px solid rgba(146, 64, 14, 0.14)",
  textDecoration: "none",
  boxShadow: "0 2px 6px rgba(120, 53, 15, 0.04)",
  transition: "box-shadow 0.15s",
} satisfies React.CSSProperties;

const typeCardIconStyle = {
  fontSize: "1.75rem",
  lineHeight: 1,
} satisfies React.CSSProperties;

const typeCardNameStyle = {
  fontSize: "0.9rem",
  color: "var(--color-text-1)",
  fontWeight: 700,
  lineHeight: 1.3,
} satisfies React.CSSProperties;

const typeCardDescStyle = {
  fontSize: "0.78rem",
  color: "var(--color-text-3)",
  lineHeight: 1.4,
} satisfies React.CSSProperties;

const gateNoticeStyle = {
  padding: "2rem",
  borderRadius: "16px",
  background: "rgba(255, 252, 247, 0.95)",
  border: "1px solid rgba(146, 64, 14, 0.12)",
  boxShadow: "0 2px 8px rgba(120, 53, 15, 0.04)",
  display: "grid",
  gap: "1rem",
} satisfies React.CSSProperties;

const gateNoticeTextStyle = {
  margin: 0,
  fontSize: "1rem",
  color: "#1c1917",
  fontWeight: 500,
} satisfies React.CSSProperties;

const gateNoticeLinkStyle = {
  display: "inline-block",
  padding: "0.75rem 1.5rem",
  borderRadius: "12px",
  background: "#9a3412",
  color: "#fff7ed",
  textDecoration: "none",
  fontWeight: 700,
  fontSize: "0.95rem",
  width: "fit-content",
} satisfies React.CSSProperties;
