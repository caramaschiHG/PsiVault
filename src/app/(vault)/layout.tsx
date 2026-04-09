import { SearchBar } from "./components/search-bar";
import { VaultSidebarNav } from "./components/vault-sidebar-nav";
import { BottomNav } from "./components/bottom-nav";
import { KeyboardShortcutsProvider } from "./components/keyboard-shortcuts-provider";
import { ToastProvider } from "@/components/ui/toast-provider";

export const dynamic = "force-dynamic";

export default function VaultLayout({ children }: { children: React.ReactNode }) {
  return (
    <KeyboardShortcutsProvider>
      <div className="vault-shell">
        {/* Skip link — acessibilidade teclado */}
        <a href="#main-content" className="skip-link">
          Ir para conteúdo principal
        </a>

        {/* Sidebar — desktop */}
        <aside className="vault-sidebar" aria-label="Navegação principal">
          {/* Brand */}
          <div className="vault-brand">
            <div className="vault-brand-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div className="vault-brand-text">
              <p className="vault-brand-name">PsiVault</p>
              <p className="vault-brand-tagline">Base clínica</p>
            </div>
          </div>

          {/* Primary navigation */}
          <VaultSidebarNav />

          {/* Search — pinned to sidebar bottom */}
          <div className="vault-sidebar-search">
            <SearchBar />
          </div>
        </aside>

        {/* Content area */}
        <main id="main-content" className="vault-content">
          <ToastProvider>
            <div className="vault-page-enter">
              {children}
            </div>
          </ToastProvider>
        </main>

        {/* Mobile bottom navigation */}
        <BottomNav />
      </div>
    </KeyboardShortcutsProvider>
  );
}
