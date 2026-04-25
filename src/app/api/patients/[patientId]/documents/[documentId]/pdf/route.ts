import { createClient } from "@/lib/supabase/server";
import { getDocumentRepository } from "@/lib/documents/store";
import { getPatientRepository } from "@/lib/patients/store";
import { getPracticeProfileSnapshot } from "@/lib/setup/profile";
import { DOCUMENT_TYPE_LABELS } from "@/lib/documents/presenter";
import { renderPracticeDocumentPdf } from "@/lib/documents/pdf";
import { resolveSession } from "@/lib/supabase/session";

export const runtime = "nodejs";

interface RouteContext {
  params: Promise<{ patientId: string; documentId: string }>;
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { workspaceId } = await resolveSession();
  const { patientId, documentId } = await params;

  const patientRepo = getPatientRepository();
  const documentRepo = getDocumentRepository();

  const [patient, document, profile] = await Promise.all([
    patientRepo.findById(patientId, workspaceId),
    documentRepo.findById(documentId, workspaceId),
    getPracticeProfileSnapshot(undefined, workspaceId),
  ]);

  if (!patient || !document || document.patientId !== patient.id) {
    return Response.json({ error: "Documento não encontrado." }, { status: 404 });
  }

  if (document.status === "draft") {
    return Response.json(
      { error: "Rascunhos não podem ser exportados em PDF." },
      { status: 400 },
    );
  }

  // Include signature only if document is signed and profile has a signature asset
  let signatureDataUri: string | null = null;
  if (document.status === "signed" && profile.signatureAsset?.storageKey) {
    signatureDataUri = await getSignatureDataUri(profile.signatureAsset.storageKey);
  }

  const title = DOCUMENT_TYPE_LABELS[document.type];
  const generatedAtLabel = new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeZone: "America/Sao_Paulo",
  }).format(new Date());

  const pdf = await renderPracticeDocumentPdf({
    title,
    patientName: patient.socialName ?? patient.fullName,
    professionalName: profile.fullName ?? document.createdByName,
    crp: profile.crp ?? "CRP não informado",
    generatedAtLabel,
    content: document.content,
    signatureDataUri,
    isRichText: document.type === "session_record",
  });

  const filename = sanitizeFilename(`${title}-${patient.fullName}.pdf`);

  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}

async function getSignatureDataUri(storageKey: string): Promise<string | null> {
  const supabase = await createClient();
  const signedUrlResult = await supabase.storage.from("signatures").createSignedUrl(storageKey, 120);
  const signedUrl = signedUrlResult.data?.signedUrl;

  if (!signedUrl) return null;

  const response = await fetch(signedUrl);
  if (!response.ok) return null;

  const contentType = response.headers.get("content-type") ?? "image/png";
  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");

  return `data:${contentType};base64,${base64}`;
}

function sanitizeFilename(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}
