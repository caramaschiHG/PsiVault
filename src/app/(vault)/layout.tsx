/**
 * Vault layout — shared navigation for all authenticated vault routes.
 *
 * Renders a persistent top navigation bar with links to the main vault
 * sections: Agenda, Pacientes, Financeiro, Configurações, and a global
 * SearchBar client island for cross-domain search (SRCH-01, SRCH-02).
 *
 * This file intentionally stays a server component — SearchBar is a client
 * island imported here; Next.js resolves the client boundary automatically.
 */

import { SearchBar } from "./components/search-bar";

export default function VaultLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={vaultShellStyle}>
      <nav style={navStyle}>
        <a href="/inicio" style={navLinkStyle}>
          Início
        </a>
        <a href="/agenda" style={navLinkStyle}>
          Agenda
        </a>
        <a href="/patients" style={navLinkStyle}>
          Pacientes
        </a>
        <a href="/financeiro" style={navLinkStyle}>
          Financeiro
        </a>
        <a href="/settings/profile" style={navLinkStyle}>
          Configurações
        </a>
        <SearchBar />
      </nav>
      {children}
    </div>
  );
}

const vaultShellStyle = {
  display: "grid",
  gridTemplateRows: "auto 1fr",
  minHeight: "100vh",
} satisfies React.CSSProperties;

const navStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  padding: "0.75rem 1.5rem",
  borderBottom: "1px solid rgba(146, 64, 14, 0.12)",
  background: "rgba(255, 252, 247, 0.97)",
  flexWrap: "wrap" as const,
} satisfies React.CSSProperties;

const navLinkStyle = {
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "#57534e",
  textDecoration: "none",
  padding: "0.3rem 0.75rem",
  borderRadius: "999px",
  transition: "background 0.15s",
} satisfies React.CSSProperties;
