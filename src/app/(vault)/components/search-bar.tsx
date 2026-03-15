"use client";

/**
 * SearchBar — persistent global search island for the vault nav.
 *
 * Rendered as a client component island inside the server layout nav.
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
    <div style={dropdownStyle}>
      {isEmpty ? (
        <p style={emptyStyle}>Nenhum resultado encontrado</p>
      ) : (
        <>
          <ResultGroup
            heading="Pacientes"
            items={patients}
            verTodosHref="/patients"
            onClose={onClose}
          />
          <ResultGroup
            heading="Sessões"
            items={sessions}
            verTodosHref="/agenda"
            onClose={onClose}
          />
          <ResultGroup
            heading="Documentos"
            items={documents}
            verTodosHref="/patients"
            onClose={onClose}
          />
          <ResultGroup
            heading="Cobranças"
            items={charges}
            verTodosHref="/financeiro"
            onClose={onClose}
          />
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
        <a
          key={item.id}
          href={item.href}
          style={resultItemStyle}
          onClick={onClose}
        >
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

    // Clear previous debounce
    if (debounceRef.current !== null) {
      clearTimeout(debounceRef.current);
    }

    // Empty query — collapse immediately without debounce
    if (!value.trim()) {
      setResults(null);
      setIsOpen(false);
      return;
    }

    // Debounce the server action call (300ms)
    debounceRef.current = setTimeout(async () => {
      const items = await searchAllAction(value);
      setResults(groupSearchResults(items));
      setIsOpen(true);
    }, 300);
  }, []);

  return (
    <div ref={containerRef} style={containerStyle}>
      <input
        type="text"
        placeholder="Buscar paciente, sessão, documento..."
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        style={searchInputStyle}
        aria-label="Buscar"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      />
      {isOpen && results !== null && (
        <SearchDropdown results={results} onClose={() => setIsOpen(false)} />
      )}
    </div>
  );
}

// ─── styles ───────────────────────────────────────────────────────────────────

const containerStyle: React.CSSProperties = {
  position: "relative",
  flex: 1,
  maxWidth: "320px",
  marginLeft: "auto",
};

const searchInputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.3rem 0.75rem",
  fontSize: "0.875rem",
  borderRadius: "999px",
  border: "1px solid rgba(146, 64, 14, 0.2)",
  background: "rgba(255, 252, 247, 0.95)",
  color: "#292524",
  outline: "none",
  boxSizing: "border-box",
};

const dropdownStyle: React.CSSProperties = {
  position: "absolute",
  top: "calc(100% + 0.25rem)",
  left: 0,
  right: 0,
  minWidth: "280px",
  background: "#fffcf7",
  border: "1px solid rgba(146, 64, 14, 0.15)",
  borderRadius: "0.5rem",
  boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  zIndex: 50,
  padding: "0.5rem 0",
  maxHeight: "400px",
  overflowY: "auto",
};

const groupStyle: React.CSSProperties = {
  padding: "0.25rem 0",
};

const groupHeadingStyle: React.CSSProperties = {
  fontSize: "0.7rem",
  fontWeight: 600,
  color: "#9ca3af",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  padding: "0.25rem 0.75rem",
  margin: 0,
};

const resultItemStyle: React.CSSProperties = {
  display: "block",
  padding: "0.375rem 0.75rem",
  fontSize: "0.875rem",
  color: "#292524",
  textDecoration: "none",
  cursor: "pointer",
};

const patientNameStyle: React.CSSProperties = {
  color: "#78716c",
  fontSize: "0.8rem",
};

const verTodosStyle: React.CSSProperties = {
  display: "block",
  padding: "0.25rem 0.75rem",
  fontSize: "0.8rem",
  color: "#92400e",
  textDecoration: "none",
  fontWeight: 500,
};

const emptyStyle: React.CSSProperties = {
  fontSize: "0.875rem",
  color: "#78716c",
  padding: "0.5rem 0.75rem",
  margin: 0,
};
