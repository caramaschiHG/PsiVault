/**
 * Settings sub-navigation layout — shared tab strip for all /settings/* routes.
 *
 * Renders a compact tab-style sub-nav above {children} so that the three
 * settings pages (Perfil, Segurança, Dados e Privacidade) are mutually
 * discoverable from any of the three routes.
 *
 * Intentionally a server component — no usePathname, no active-state
 * highlighting. The page heading already indicates which section is active.
 */

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={shellStyle}>
      <nav style={subNavStyle}>
        <a href="/settings/profile" style={tabLinkStyle}>
          Perfil
        </a>
        <a href="/settings/security" style={tabLinkStyle}>
          Segurança
        </a>
        <a href="/settings/dados-e-privacidade" style={tabLinkStyle}>
          Dados e Privacidade
        </a>
      </nav>
      {children}
    </div>
  );
}

const shellStyle = {
  display: "grid",
  gap: 0,
} satisfies React.CSSProperties;

const subNavStyle = {
  display: "flex",
  gap: "0.25rem",
  padding: "1rem 2rem 0",
  borderBottom: "1px solid rgba(146, 64, 14, 0.1)",
  background: "rgba(255, 252, 247, 0.6)",
} satisfies React.CSSProperties;

const tabLinkStyle = {
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "#57534e",
  textDecoration: "none",
  padding: "0.45rem 1rem",
  borderRadius: "12px 12px 0 0",
  border: "1px solid transparent",
  transition: "background 0.15s",
} satisfies React.CSSProperties;
