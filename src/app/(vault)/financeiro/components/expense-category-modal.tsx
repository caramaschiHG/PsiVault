"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { ExpenseCategory } from "@/lib/expense-categories/model";
import {
  createExpenseCategoryAction,
  renameExpenseCategoryAction,
  archiveExpenseCategoryAction,
} from "../actions";

interface ExpenseCategoryModalProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  categories: ExpenseCategory[];
}

export function ExpenseCategoryModal({ open, onOpenChange, categories }: ExpenseCategoryModalProps) {
  const router = useRouter();
  const modalRef = useRef<HTMLDivElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [newName, setNewName] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") { onOpenChange(false); return; }
      if (e.key !== "Tab" || !modalRef.current) return;
      const focusable = modalRef.current.querySelectorAll<HTMLElement>(
        'button, input, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last?.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    requestAnimationFrame(() => { modalRef.current?.focus(); });
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onOpenChange]);

  if (!open) return null;

  // Active first, then archived
  const sorted = [...categories].sort((a, b) => {
    if (a.archived === b.archived) return a.name.localeCompare(b.name);
    return a.archived ? 1 : -1;
  });

  function startEdit(cat: ExpenseCategory) {
    setEditingId(cat.id);
    setEditName(cat.name);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
  }

  function handleRename(categoryId: string) {
    const name = editName.trim();
    if (!name) return;
    startTransition(async () => {
      await renameExpenseCategoryAction(categoryId, name);
      setEditingId(null);
      router.refresh();
    });
  }

  function handleToggleArchive(cat: ExpenseCategory) {
    if (cat.archived) return; // unarchive not in scope
    startTransition(async () => {
      await archiveExpenseCategoryAction(cat.id);
      router.refresh();
    });
  }

  function handleCreate() {
    const name = newName.trim();
    if (!name) return;
    startTransition(async () => {
      const fd = new FormData();
      fd.set("name", name);
      await createExpenseCategoryAction(null, fd);
      setNewName("");
      router.refresh();
    });
  }

  return (
    <div style={overlayStyle} onClick={() => onOpenChange(false)}>
      <div
        ref={modalRef}
        style={modalStyle}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Gerenciar categorias"
        tabIndex={-1}
      >
        {/* Header */}
        <div style={headerStyle}>
          <h2 style={titleStyle}>Gerenciar categorias</h2>
          <button
            className="btn-ghost"
            type="button"
            onClick={() => onOpenChange(false)}
            style={closeBtnStyle}
            aria-label="Fechar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={bodyStyle}>
          {sorted.length === 0 && (
            <p style={emptyCatStyle}>Sem categorias. Crie a primeira abaixo.</p>
          )}
          {sorted.map((cat) => (
            <div key={cat.id} style={catRowStyle}>
              {editingId === cat.id ? (
                <>
                  <input
                    className="input-field"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleRename(cat.id); if (e.key === "Escape") cancelEdit(); }}
                    style={editInputStyle}
                    autoFocus
                  />
                  <button className="btn-primary" type="button" onClick={() => handleRename(cat.id)} disabled={isPending} style={smallBtnStyle}>Salvar</button>
                  <button className="btn-ghost" type="button" onClick={cancelEdit} style={smallBtnStyle}>Cancelar</button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => startEdit(cat)}
                    style={catNameBtnStyle}
                    aria-label={`Editar nome de ${cat.name}`}
                  >
                    <span style={cat.archived ? archivedBadgeStyle : badgeStyle}>
                      {cat.name}{cat.archived && <span style={inactiveSuffixStyle}> · inativa</span>}
                    </span>
                  </button>
                  {!cat.archived && (
                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={() => handleToggleArchive(cat)}
                      disabled={isPending}
                      style={smallBtnStyle}
                      aria-label={`Desativar ${cat.name}`}
                    >
                      Desativar
                    </button>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={footerStyle}>
          <div style={separatorStyle} />
          <div style={footerRowStyle}>
            <input
              className="input-field"
              placeholder="Nome da categoria"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleCreate(); }}
              style={newCatInputStyle}
            />
            <button
              className="btn-primary"
              type="button"
              onClick={handleCreate}
              disabled={isPending || !newName.trim()}
            >
              + Nova categoria
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.18)",
  zIndex: "var(--z-modal)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
} satisfies React.CSSProperties;

const modalStyle = {
  background: "var(--color-surface-1)",
  borderRadius: "var(--radius-lg)",
  boxShadow: "var(--shadow-xl)",
  width: "min(560px, calc(100vw - 2rem))",
  padding: "var(--space-6)",
  outline: "none",
  display: "flex",
  flexDirection: "column",
  maxHeight: "80vh",
} satisfies React.CSSProperties;

const headerStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "var(--space-4)",
} satisfies React.CSSProperties;

const titleStyle = {
  margin: 0,
  fontSize: "var(--font-size-h2)",
  fontWeight: 600,
  color: "var(--color-text-1)",
} satisfies React.CSSProperties;

const closeBtnStyle = {
  width: "32px",
  height: "32px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 0,
  flexShrink: 0,
} satisfies React.CSSProperties;

const bodyStyle = {
  flex: 1,
  overflowY: "auto",
  display: "grid",
  gap: "var(--space-2)",
  marginBottom: "var(--space-4)",
} satisfies React.CSSProperties;

const catRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: "var(--space-2)",
  padding: "var(--space-2) 0",
} satisfies React.CSSProperties;

const catNameBtnStyle = {
  flex: 1,
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: 0,
  textAlign: "left",
} satisfies React.CSSProperties;

const badgeStyle = {
  display: "inline-flex",
  background: "var(--color-surface-3)",
  border: "1px solid var(--color-border)",
  color: "var(--color-text-2)",
  fontSize: "var(--font-size-sm)",
  fontWeight: 500,
  padding: "2px 8px",
  borderRadius: "var(--radius-pill)",
} satisfies React.CSSProperties;

const archivedBadgeStyle = {
  ...badgeStyle,
  opacity: 0.55,
} satisfies React.CSSProperties;

const inactiveSuffixStyle = {
  color: "var(--color-text-3)",
} satisfies React.CSSProperties;

const editInputStyle = {
  flex: 1,
} satisfies React.CSSProperties;

const smallBtnStyle = {
  fontSize: "var(--font-size-sm)",
  padding: "4px 10px",
  height: "auto",
} satisfies React.CSSProperties;

const emptyCatStyle = {
  fontSize: "var(--font-size-body)",
  color: "var(--color-text-2)",
  margin: 0,
} satisfies React.CSSProperties;

const separatorStyle = {
  height: "1px",
  background: "var(--color-border)",
  marginBottom: "var(--space-4)",
} satisfies React.CSSProperties;

const footerStyle = {} satisfies React.CSSProperties;

const footerRowStyle = {
  display: "flex",
  gap: "var(--space-3)",
  alignItems: "center",
} satisfies React.CSSProperties;

const newCatInputStyle = {
  flex: 1,
} satisfies React.CSSProperties;
