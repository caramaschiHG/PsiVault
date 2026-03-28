"use client";

import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  {
    href: "/inicio",
    label: "Início",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" width={16} height={16} aria-hidden="true">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    href: "/agenda",
    label: "Agenda",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" width={16} height={16} aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    href: "/patients",
    label: "Pacientes",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" width={16} height={16} aria-hidden="true">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    href: "/financeiro",
    label: "Financeiro",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" width={16} height={16} aria-hidden="true">
        <rect x="1" y="4" width="22" height="16" rx="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
  },
] as const;

const SETTINGS_ITEM = {
  href: "/settings/profile",
  label: "Configurações",
  icon: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" width={16} height={16} aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
};

export function VaultSidebarNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/patients") {
      return pathname.startsWith("/patients");
    }
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <nav style={navStyle} aria-label="Navegação principal">
      {/* Main nav items */}
      <ul style={listStyle}>
        {NAV_ITEMS.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              className={`nav-link${isActive(item.href) ? " active" : ""}`}
              aria-current={isActive(item.href) ? "page" : undefined}
            >
              {item.icon}
              <span>{item.label}</span>
            </a>
          </li>
        ))}
      </ul>

      {/* Divider */}
      <div style={dividerStyle} />

      {/* Settings */}
      <ul style={listStyle}>
        <li>
          <a
            href={SETTINGS_ITEM.href}
            className={`nav-link${isActive(SETTINGS_ITEM.href) ? " active" : ""}`}
            aria-current={isActive(SETTINGS_ITEM.href) ? "page" : undefined}
          >
            {SETTINGS_ITEM.icon}
            <span>{SETTINGS_ITEM.label}</span>
          </a>
        </li>
      </ul>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Divider before footer */}
      <div style={dividerStyle} />

      {/* Footer: avatar + nome + sair */}
      <div style={footerStyle}>
        <div style={avatarStyle}>PS</div>
        <div style={footerInfoStyle}>
          <span style={footerNameStyle}>Profissional</span>
          <a href="/api/auth/signout" style={signoutStyle}>Sair</a>
        </div>
      </div>
    </nav>
  );
}

const navStyle: React.CSSProperties = {
  flex: 1,
  padding: "0.75rem 0.875rem",
  display: "flex",
  flexDirection: "column",
  gap: "0.375rem",
};

const listStyle: React.CSSProperties = {
  listStyle: "none",
  margin: 0,
  padding: 0,
  display: "flex",
  flexDirection: "column",
  gap: "0.125rem",
};

const dividerStyle: React.CSSProperties = {
  height: "1px",
  backgroundColor: "rgba(255,255,255,0.08)",
  margin: "0.5rem 0",
};

const footerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.625rem",
  padding: "0.5rem 0.25rem 0.75rem",
};

const avatarStyle: React.CSSProperties = {
  width: "2rem",
  height: "2rem",
  borderRadius: "50%",
  backgroundColor: "rgba(255,255,255,0.15)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "0.7rem",
  fontWeight: 600,
  color: "rgba(255,255,255,0.9)",
  flexShrink: 0,
};

const footerInfoStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.125rem",
  minWidth: 0,
};

const footerNameStyle: React.CSSProperties = {
  fontSize: "var(--font-size-meta)",
  color: "rgba(255,255,255,0.75)",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const signoutStyle: React.CSSProperties = {
  fontSize: "var(--font-size-meta)",
  color: "rgba(255,255,255,0.5)",
  textDecoration: "none",
};
