import { SearchBar } from "./components/search-bar";
import { VaultSidebarNav } from "./components/vault-sidebar-nav";
import { BottomNav } from "./components/bottom-nav";
import { KeyboardShortcutsProvider } from "./components/keyboard-shortcuts-provider";
import { ToastProvider } from "@/components/ui/toast-provider";
import { NotificationProvider } from "@/components/ui/notification-context";
import { TopBar } from "./components/top-bar";
import { CwvCollector } from "@/components/cwv-collector";
import { ReactScan } from "@/components/react-scan";
import { DarkModeNotification } from "../components/dark-mode-notification";

export default function VaultLayout({ children }: { children: React.ReactNode }) {
  return (
    <KeyboardShortcutsProvider>
      <NotificationProvider>
        <DarkModeNotification />
        <CwvCollector />
        <ReactScan />
        <div style={shellStyle}>
        {/* Skip link — acessibilidade teclado (CSS-only, sem event handlers) */}
        <a href="#main-content" className="skip-link">
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
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={brandNameStyle}>PsiVault</p>
              <p style={brandTaglineStyle}>Base clínica</p>
            </div>
          </div>

          {/* Primary navigation */}
          <VaultSidebarNav />
        </aside>

        {/* Content area */}
        <main id="main-content" className="vault-content" style={contentStyle}>
          <TopBar />
          <ToastProvider>
            <div className="vault-page-enter">
              {children}
            </div>
          </ToastProvider>
        </main>

        {/* Mobile bottom navigation */}
        <BottomNav />
        </div>
      </NotificationProvider>
    </KeyboardShortcutsProvider>
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
  backgroundColor: "var(--color-sidebar-bg)",
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
  padding: "1.5rem 1.25rem 1rem",
} satisfies React.CSSProperties;

const brandLockStyle = {
  width: "36px",
  height: "36px",
  borderRadius: "var(--radius-sm)",
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
  color: "rgba(255,255,255,0.70)",
  lineHeight: 1,
} satisfies React.CSSProperties;

const contentStyle = {
  flex: 1,
  minWidth: 0,
  background: "var(--color-bg)",
} satisfies React.CSSProperties;
