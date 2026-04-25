"use client";

/**
 * useDocumentAutoSave — server-side draft auto-save with debounce.
 *
 * Replaces localStorage-based useAutoSave with server-side persistence.
 * - 3s debounce on content change
 * - Calls saveDraftAction via useTransition
 * - Shows indicator: "Salvando..." → "Salvo às 14:32" → "Erro ao salvar"
 */

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { saveDraftAction } from "@/lib/documents/save-draft-action";
import type { DocumentType } from "@/lib/documents/model";

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface UseDocumentAutoSaveOptions {
  documentId?: string;
  patientId: string;
  documentType: DocumentType;
  debounceMs?: number;
}

interface UseDocumentAutoSaveResult {
  status: SaveStatus;
  lastSaved: Date | null;
  isDirty: boolean;
  markDirty: () => void;
  saveNow: () => void;
  documentId: string | null;
}

export function useDocumentAutoSave(
  content: string,
  options: UseDocumentAutoSaveOptions,
): UseDocumentAutoSaveResult {
  const { documentId, patientId, documentType, debounceMs = 3000 } = options;
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [savedDocumentId, setSavedDocumentId] = useState<string | null>(options.documentId ?? null);
  const [isPending, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastContent = useRef(content);

  const performSave = useCallback(() => {
    if (!isDirty && lastContent.current === content) return;

    setStatus("saving");
    lastContent.current = content;

    startTransition(async () => {
      try {
        const formData = new FormData();
        if (savedDocumentId) formData.append("documentId", savedDocumentId);
        formData.append("patientId", patientId);
        formData.append("documentType", documentType);
        formData.append("content", content);

        const result = await saveDraftAction(formData);
        setSavedDocumentId(result.documentId);
        setLastSaved(new Date(result.savedAt));
        setStatus("saved");
        setIsDirty(false);
      } catch (err) {
        console.error("[useDocumentAutoSave] Save failed:", err);
        setStatus("error");
      }
    });
  }, [content, savedDocumentId, patientId, documentType, isDirty]);

  // Debounced auto-save
  useEffect(() => {
    if (!isDirty) return;
    timer.current = setTimeout(performSave, debounceMs);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [content, isDirty, debounceMs, performSave]);

  // Re-render indicator every 30s so relative time updates
  useEffect(() => {
    if (!lastSaved) return;
    const t = setInterval(() => setLastSaved((d) => d ? new Date(d) : null), 30_000);
    return () => clearInterval(t);
  }, [lastSaved]);

  const markDirty = useCallback(() => setIsDirty(true), []);

  const saveNow = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    performSave();
  }, [performSave]);

  return { status, lastSaved, isDirty, markDirty, saveNow, documentId: savedDocumentId };
}
