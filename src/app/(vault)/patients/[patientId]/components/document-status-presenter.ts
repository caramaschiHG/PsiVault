import type { DocumentStatus } from "../../../../../lib/documents/model";

export const STATUS_LABELS: Record<DocumentStatus, string> = {
  draft: "Rascunho",
  finalized: "Pendente",
  signed: "Assinado",
  delivered: "Entregue",
  archived: "Arquivado",
};

export const STATUS_COLORS: Record<DocumentStatus, { bg: string; text: string; border: string }> = {
  draft: {
    bg: "rgba(248,250,252,0.95)",
    text: "var(--color-text-3)",
    border: "rgba(148,163,184,0.3)",
  },
  finalized: {
    bg: "rgba(254,243,199,0.95)",
    text: "var(--color-warning-text)",
    border: "rgba(251,191,36,0.3)",
  },
  signed: {
    bg: "rgba(240,253,244,0.95)",
    text: "var(--color-success-text)",
    border: "rgba(134,239,172,0.3)",
  },
  delivered: {
    bg: "rgba(239,246,255,0.95)",
    text: "var(--color-accent)",
    border: "rgba(147,197,253,0.3)",
  },
  archived: {
    bg: "rgba(241,245,249,0.95)",
    text: "var(--color-text-4)",
    border: "rgba(203,213,225,0.3)",
  },
};

export type StatusFilter = "all" | DocumentStatus;

export const FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "draft", label: "Rascunhos" },
  { value: "finalized", label: "Pendentes" },
  { value: "signed", label: "Assinados" },
  { value: "delivered", label: "Entregues" },
  { value: "archived", label: "Arquivados" },
];
