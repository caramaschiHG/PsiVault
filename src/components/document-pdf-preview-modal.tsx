"use client";

import React, { useEffect, useRef } from "react";

interface DocumentPdfPreviewModalProps {
  pdfUrl: string;
  filename: string;
  onClose: () => void;
}

export function DocumentPdfPreviewModal({
  pdfUrl,
  filename,
  onClose,
}: DocumentPdfPreviewModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Focus trap: focus the modal on open
    modalRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
      if (e.key === "Tab") {
        // Simple focus trap: keep focus inside modal
        const focusable = modalRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        if (!focusable || focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    // Prevent body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      style={overlayStyle}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdf-preview-title"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        style={modalStyle}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={headerStyle}>
          <h2 id="pdf-preview-title" style={titleStyle}>
            Visualizar PDF
          </h2>
          <button onClick={onClose} style={closeButtonStyle} aria-label="Fechar">
            ×
          </button>
        </div>

        {/* Body */}
        <div style={bodyStyle}>
          <iframe
            src={pdfUrl}
            title={filename}
            style={iframeStyle}
            loading="lazy"
          />
        </div>

        {/* Footer */}
        <div style={footerStyle}>
          <button onClick={onClose} style={secondaryButtonStyle}>
            Fechar
          </button>
          <a
            href={pdfUrl}
            download={filename}
            target="_blank"
            rel="noreferrer"
            style={primaryButtonStyle}
          >
            Baixar PDF
          </a>
        </div>
      </div>
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0, 0, 0, 0.45)",
  zIndex: 100,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "1rem",
  animation: "fadeIn 150ms ease-out",
};

const modalStyle: React.CSSProperties = {
  width: "min(900px, 92vw)",
  height: "min(85vh, 800px)",
  background: "#fff",
  borderRadius: "var(--radius-lg)",
  boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  animation: "scaleIn 200ms ease-out",
  outline: "none",
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "1rem 1.25rem",
  borderBottom: "1px solid var(--color-border-light)",
  flexShrink: 0,
};

const titleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: "1rem",
  fontWeight: 600,
  color: "var(--color-text-1)",
};

const closeButtonStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  fontSize: "1.5rem",
  lineHeight: 1,
  color: "var(--color-text-3)",
  cursor: "pointer",
  padding: "0.25rem 0.5rem",
  borderRadius: "var(--radius-sm)",
};

const bodyStyle: React.CSSProperties = {
  flex: 1,
  overflow: "hidden",
  padding: "0.5rem",
};

const iframeStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  border: "none",
  borderRadius: "var(--radius-md)",
};

const footerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: "0.75rem",
  padding: "0.875rem 1.25rem",
  borderTop: "1px solid var(--color-border-light)",
  flexShrink: 0,
};

const secondaryButtonStyle: React.CSSProperties = {
  padding: "0.5rem 1rem",
  borderRadius: "var(--radius-md)",
  border: "1px solid var(--color-border-med)",
  background: "var(--color-surface-1)",
  color: "var(--color-text-2)",
  fontWeight: 500,
  fontSize: "0.875rem",
  cursor: "pointer",
  fontFamily: "inherit",
};

const primaryButtonStyle: React.CSSProperties = {
  padding: "0.5rem 1rem",
  borderRadius: "var(--radius-md)",
  border: "none",
  background: "var(--color-accent)",
  color: "#fff",
  fontWeight: 600,
  fontSize: "0.875rem",
  textDecoration: "none",
  cursor: "pointer",
  fontFamily: "inherit",
};
