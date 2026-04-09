"use client";

/**
 * SearchBar — persistent global search island for the vault sidebar.
 *
 * Rendered as a client component island inside the server layout.
 * Calls searchAllAction on debounced query changes (300ms debounce).
 * Displays grouped results in a dropdown: Pacientes, Sessões, Documentos, Cobranças.
 *
 * Security: Results come from searchAllAction which delegates to searchAll.
 * searchAll enforces SECU-05 — no clinical or financial content in results.
 */

import { useState, useCallback, useEffect, useRef } from "react";
import { searchAllAction } from "@/app/(vault)/actions/search";
import type { SearchResultItem } from "@/lib/search/search";
import { groupSearchResults } from "@/lib/search/search";
import type { SearchResults } from "@/lib/search/search";

// ─── SearchDropdown ───────────────────────────────────────────────────────────

interface SearchDropdownProps {
  results: SearchResults;
  onClose: () => void;
}

function SearchDropdown({ results, onClose }: SearchDropdownProps) {
  const { patients, sessions, documents, charges } = results;
  const isEmpty =
    patients.length === 0 &&
    sessions.length === 0 &&
    documents.length === 0 &&
    charges.length === 0;

  return (
    <div className="search-dropdown-enter" style={dropdownStyle}>
      {isEmpty ? (
        <p style={emptyStyle}>Nenhum resultado encontrado</p>
      ) : (
        <>
          <ResultGroup heading="Pacientes" items={patients} verTodosHref="/patients" onClose={onClose} />
          <ResultGroup heading="Sessões" items={sessions} verTodosHref="/agenda" onClose={onClose} />
          <ResultGroup heading="Documentos" items={documents} verTodosHref="/patients" onClose={onClose} />
          <ResultGroup heading="Cobranças" items={charges} verTodosHref="/financeiro" onClose={onClose} />
        </>
      )}
    </div>
  );
}

interface ResultGroupProps {
  heading: string;
  items: SearchResultItem[];
  verTodosHref: string;
  onClose: () => void;
}

function ResultGroup({ heading, items, verTodosHref, onClose }: ResultGroupProps) {
  if (items.length === 0) return null;

  const visible = items.slice(0, 3);
  const hasMore = items.length > 3;

  return (
    <div style={groupStyle}>
      <p style={groupHeadingStyle}>{heading}</p>
      {visible.map((item) => (
        <a key={item.id} href={item.href} style={resultItemStyle} onClick={onClose}>
          {item.label}
          {item.patientName && item.label !== "Paciente" && (
            <span style={patientNameStyle}> · {item.patientName}</span>
          )}
        </a>
      ))}
      {hasMore && (
        <a href={verTodosHref} style={verTodosStyle} onClick={onClose}>
          Ver todos
        </a>
      )}
    </div>
  );
}

// ─── SearchBar ────────────────────────────────────────────────────────────────

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  const handleChange = useCallback((value: string) => {
    setQuery(value);

    if (debounceRef.current !== null) {
      clearTimeout(debounceRef.current);
    }

    if (!value.trim()) {
      setResults(null);
      setIsOpen(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      const items = await searchAllAction(value);
      setResults(groupSearchResults(items));
      setIsOpen(true);
    }, 300);
  }, []);

  return (
    <div ref={containerRef} style={containerStyle}>
      <div style={inputWrapperStyle}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={searchIconStyle} aria-hidden="true">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Buscar..."
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          className="input-field"
          style={searchInputStyle}
          aria-label="Buscar"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          data-search-input
        />
        <span style={commandKHintStyle}>⌘K</span>
      </div>
      {isOpen && results !== null && (
        <SearchDropdown results={results} onClose={() => setIsOpen(false)} />
      )}
    </div>
  );
}

// ─── styles ───────────────────────────────────────────────────────────────────

const containerStyle: React.CSSProperties = {
  position: "relative",
};

const inputWrapperStyle: React.CSSProperties = {
  position: "relative",
  display: "flex",
  alignItems: "center",
};

const searchIconStyle: React.CSSProperties = {
  position: "absolute",
  left: "0.625rem",
  color: "var(--color-text-4)",
  pointerEvents: "none",
  flexShrink: 0,
};

const searchInputStyle: React.CSSProperties = {
  width: "100%",
  paddingLeft: "2rem",
  paddingRight: "0.625rem",
  paddingTop: "0.4rem",
  paddingBottom: "0.4rem",
  fontSize: "0.8rem",
  borderRadius: "var(--radius-sm)",
  background: "rgba(255, 255, 255, 0.7)",
};

const dropdownStyle: React.CSSProperties = {
  position: "absolute",
  bottom: "calc(100% + 0.375rem)",
  left: 0,
  right: 0,
  minWidth: "280px",
  background: "var(--color-surface-1)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-md)",
  boxShadow: "var(--shadow-lg)",
  zIndex: "var(--z-dropdown)",
  padding: "0.375rem 0",
  maxHeight: "380px",
  overflowY: "auto",
};

const groupStyle: React.CSSProperties = {
  padding: "0.25rem 0",
};

const groupHeadingStyle: React.CSSProperties = {
  fontSize: "0.68rem",
  fontWeight: 600,
  color: "var(--color-text-4)",
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  padding: "0.25rem 0.875rem",
  margin: 0,
};

const resultItemStyle: React.CSSProperties = {
  display: "block",
  padding: "0.4rem 0.875rem",
  fontSize: "0.85rem",
  color: "var(--color-text-1)",
  textDecoration: "none",
  cursor: "pointer",
  transition: "background 0.1s",
};

const patientNameStyle: React.CSSProperties = {
  color: "var(--color-text-3)",
  fontSize: "0.78rem",
};

const verTodosStyle: React.CSSProperties = {
  display: "block",
  padding: "0.25rem 0.875rem",
  fontSize: "0.78rem",
  color: "var(--color-accent)",
  textDecoration: "none",
  fontWeight: 500,
};

const emptyStyle: React.CSSProperties = {
  fontSize: "0.85rem",
  color: "var(--color-text-3)",
  padding: "0.5rem 0.875rem",
  margin: 0,
};

const commandKHintStyle: React.CSSProperties = {
  fontSize: "0.7rem",
  color: "rgba(146, 64, 14, 0.5)",
  letterSpacing: "0.05em",
  pointerEvents: "none",
  paddingRight: "0.375rem",
};
