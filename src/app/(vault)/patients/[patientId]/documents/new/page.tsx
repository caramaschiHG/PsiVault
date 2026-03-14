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

const WORKSPACE_ID = "ws_1";
const ACCOUNT_ID = "acct_1";

const VALID_TYPES = new Set<DocumentType>([
  "declaration_of_attendance",
  "receipt",
  "anamnesis",
  "psychological_report",
  "consent_and_service_contract",
]);

const TYPE_LABELS: Record<DocumentType, string> = {
  declaration_of_attendance: "Declaração de Comparecimento",
  receipt: "Recibo de Pagamento",
  anamnesis: "Anamnese",
  psychological_report: "Laudo Psicológico",
  consent_and_service_contract: "Contrato de Prestação de Serviços",
};

interface DocumentComposerPageProps {
  params: Promise<{ patientId: string }>;
  searchParams: Promise<{ type?: string }>;
}

export default async function DocumentComposerPage({
  params,
  searchParams,
}: DocumentComposerPageProps) {
  const { patientId } = await params;
  const { type: rawType } = await searchParams;

  // 1. Type validation
  if (!rawType || !VALID_TYPES.has(rawType as DocumentType)) {
    notFound();
  }
  const documentType = rawType as DocumentType;

  // 2. Patient guard
  const patientRepo = getPatientRepository();
  const patient = patientRepo.findById(patientId, WORKSPACE_ID);
  if (!patient) {
    notFound();
  }

  // 3. Signature gate
  const profile = getPracticeProfileSnapshot(ACCOUNT_ID, WORKSPACE_ID);
  if (profile.signatureAsset === null) {
    return (
      <main style={shellStyle}>
        <nav style={breadcrumbStyle}>
          <Link href="/patients" style={breadcrumbLinkStyle}>
            Pacientes
          </Link>
          <span style={breadcrumbSepStyle}>/</span>
          <Link href={`/patients/${patient.id}`} style={breadcrumbLinkStyle}>
            {patient.fullName}
          </Link>
          <span style={breadcrumbSepStyle}>/</span>
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
  const allAppointments = appointmentRepo.listByPatient(patient.id, WORKSPACE_ID);
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
        <span style={breadcrumbSepStyle}>/</span>
        <Link href={`/patients/${patient.id}`} style={breadcrumbLinkStyle}>
          {patientDisplayName}
        </Link>
        <span style={breadcrumbSepStyle}>/</span>
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
  minHeight: "100vh",
  padding: "2rem",
  display: "grid",
  gap: "1.5rem",
  alignContent: "start",
  maxWidth: "800px",
} satisfies React.CSSProperties;

const breadcrumbStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.4rem",
  fontSize: "0.82rem",
  color: "#78716c",
} satisfies React.CSSProperties;

const breadcrumbLinkStyle = {
  color: "#b45309",
  textDecoration: "none",
  fontWeight: 500,
} satisfies React.CSSProperties;

const breadcrumbSepStyle = {
  color: "#d6d3d1",
  fontWeight: 400,
} satisfies React.CSSProperties;

const breadcrumbCurrentStyle = {
  color: "#78716c",
  fontWeight: 500,
} satisfies React.CSSProperties;

const headingStyle = {
  display: "grid",
  gap: "0.2rem",
} satisfies React.CSSProperties;

const eyebrowStyle = {
  margin: 0,
  textTransform: "uppercase" as const,
  letterSpacing: "0.14em",
  fontSize: "0.72rem",
  color: "#b45309",
} satisfies React.CSSProperties;

const titleStyle = {
  margin: 0,
  fontSize: "2rem",
  fontWeight: 700,
  color: "#1c1917",
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
