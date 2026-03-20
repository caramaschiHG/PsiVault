import { SearchBar } from "./components/search-bar";
import { VaultSidebarNav } from "./components/vault-sidebar-nav";
import { BottomNav } from "./components/bottom-nav";
import { ToastProvider } from "@/components/ui/toast-provider";

export const dynamic = "force-dynamic";

export default function VaultLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={shellStyle}>
      {/* Skip link — acessibilidade teclado */}
      <a
        href="#main-content"
        style={skipLinkStyle}
        onFocus={(e) => {
          e.currentTarget.style.left = "1rem";
          e.currentTarget.style.top = "1rem";
          e.currentTarget.style.width = "auto";
          e.currentTarget.style.height = "auto";
        }}
        onBlur={(e) => {
          e.currentTarget.style.left = "-9999px";
          e.currentTarget.style.width = "1px";
          e.currentTarget.style.height = "1px";
        }}
      >
        Ir para conteúdo principal
      </a>

      {/* Sidebar */}
      <aside className="vault-sidebar" style={sidebarStyle} aria-label="Navegação principal">
        {/* Brand */}
        <div style={brandStyle}>
          <div style={brandLockStyle}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ color: "rgba(255,255,255,0.85)" }}>
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <div>
            <p style={brandNameStyle}>PsiVault</p>
            <p style={brandTaglineStyle}>Base clínica</p>
          </div>
        </div>

        {/* Primary navigation */}
        <VaultSidebarNav />

        {/* Search — pinned to sidebar bottom */}
        <div style={sidebarSearchStyle}>
          <SearchBar />
        </div>
      </aside>

      {/* Content area */}
      <main id="main-content" className="vault-content" style={contentStyle}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </main>

      {/* Mobile bottom navigation */}
      <BottomNav />
    </div>
  );
}

const shellStyle = {
  display: "flex",
  minHeight: "100vh",
  backgroundColor: "var(--color-surface-0)",
} satisfies React.CSSProperties;

const sidebarStyle = {
  width: "240px",
  minHeight: "100vh",
  backgroundColor: "#2d1810",
  borderRight: "none",
  display: "flex",
  flexDirection: "column",
  flexShrink: 0,
  position: "sticky" as const,
  top: 0,
  height: "100vh",
  overflowY: "auto" as const,
} satisfies React.CSSProperties;

const brandStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.625rem",
  padding: "1.25rem 1rem 1rem",
} satisfies React.CSSProperties;

const brandLockStyle = {
  width: "36px",
  height: "36px",
  borderRadius: "10px",
  background: "rgba(255,255,255,0.1)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
} satisfies React.CSSProperties;

const brandNameStyle = {
  margin: 0,
  fontSize: "0.95rem",
  fontWeight: 700,
  color: "rgba(255,255,255,0.9)",
  lineHeight: 1.2,
} satisfies React.CSSProperties;

const brandTaglineStyle = {
  margin: 0,
  fontSize: "0.72rem",
  color: "rgba(255,255,255,0.45)",
  lineHeight: 1,
} satisfies React.CSSProperties;

const sidebarSearchStyle = {
  padding: "0.75rem",
  borderTop: "1px solid rgba(255,255,255,0.08)",
} satisfies React.CSSProperties;

const contentStyle = {
  flex: 1,
  minWidth: 0,
  background: "var(--color-bg)",
} satisfies React.CSSProperties;

const skipLinkStyle = {
  position: "absolute",
  left: "-9999px",
  top: "auto",
  width: "1px",
  height: "1px",
  overflow: "hidden",
  background: "var(--color-surface-0)",
  color: "var(--color-accent)",
  padding: "0.5rem 1rem",
  borderRadius: "var(--radius-sm)",
  fontWeight: 600,
  zIndex: 9999,
  textDecoration: "none",
} satisfies React.CSSProperties;
