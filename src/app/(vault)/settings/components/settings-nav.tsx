"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/settings/profile", label: "Perfil" },
  { href: "/settings/security", label: "Segurança" },
  { href: "/settings/notificacoes", label: "Notificações" },
  { href: "/settings/dados-e-privacidade", label: "Dados e Privacidade" },
];

export function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav style={subNavStyle}>
      {tabs.map((tab) => {
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            prefetch
            style={isActive ? activeTabStyle : tabLinkStyle}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

const subNavStyle = {
  display: "flex",
  gap: "0.25rem",
  padding: "1rem 2rem 0",
  borderBottom: "1px solid var(--color-border)",
  background: "var(--color-surface-1)",
} satisfies React.CSSProperties;

const tabLinkStyle = {
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "var(--color-text-2)",
  textDecoration: "none",
  padding: "0.45rem 1rem",
  borderRadius: "12px 12px 0 0",
  border: "1px solid transparent",
  transition: "background 0.15s",
} satisfies React.CSSProperties;

const activeTabStyle = {
  ...tabLinkStyle,
  background: "var(--color-accent-light)",
  color: "var(--color-accent)",
  fontWeight: 600,
} satisfies React.CSSProperties;
