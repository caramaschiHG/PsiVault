"use client";

import { PageShell } from "@/components/ui/page-shell";
import { PageHeader } from "@/components/ui/page-header";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useTheme } from "@/components/ui/theme-provider";

export default function AppearancePage() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  return (
    <PageShell>
      <PageHeader title="Aparência" />

      <div style={sectionStyle}>
        <h2 style={headingStyle}>Tema</h2>
        <p style={descriptionStyle}>
          Escolha entre o modo claro, escuro ou siga a configuração do seu sistema.
        </p>

        <div style={optionsStyle}>
          <ThemeOption
            label="Claro"
            description="Interface com cores claras, ideal para ambientes iluminados."
            active={theme === "light"}
            onClick={() => setTheme("light")}
            previewLight
          />
          <ThemeOption
            label="Escuro"
            description="Interface com cores escuras, mais confortável em ambientes com pouca luz."
            active={theme === "dark"}
            onClick={() => setTheme("dark")}
            previewDark
          />
          <ThemeOption
            label="Sistema"
            description="Segue a configuração de tema do seu dispositivo."
            active={theme === "system"}
            onClick={() => setTheme("system")}
            previewAuto
          />
        </div>
      </div>

      <div style={sectionStyle}>
        <h2 style={headingStyle}>Acesso rápido</h2>
        <p style={descriptionStyle}>
          Você também pode alternar o tema rapidamente usando o toggle abaixo.
        </p>

        <div style={toggleRowStyle}>
          <span style={toggleLabelStyle}>
            Modo {resolvedTheme === "dark" ? "escuro" : "claro"} ativo
          </span>
          <ThemeToggle size={48} />
        </div>
      </div>
    </PageShell>
  );
}

function ThemeOption({
  label,
  description,
  active,
  onClick,
  previewLight,
  previewDark,
  previewAuto,
}: {
  label: string;
  description: string;
  active: boolean;
  onClick: () => void;
  previewLight?: boolean;
  previewDark?: boolean;
  previewAuto?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        ...optionStyle,
        borderColor: active ? "var(--color-accent)" : "var(--color-border)",
        background: active ? "var(--color-accent-light)" : "var(--color-surface-0)",
      }}
    >
      <div style={previewWrapStyle}>
        {previewLight && (
          <div style={lightPreviewStyle}>
            <div style={previewBarStyle} />
            <div style={previewBarShortStyle} />
          </div>
        )}
        {previewDark && (
          <div style={darkPreviewStyle}>
            <div style={{ ...previewBarStyle, background: "#c26a4a" }} />
            <div style={{ ...previewBarShortStyle, background: "#8a8278" }} />
          </div>
        )}
        {previewAuto && (
          <div style={autoPreviewStyle}>
            <div style={{ ...previewBarStyle, background: "#c26a4a" }} />
            <div style={{ ...previewBarShortStyle, background: "#b8b0a4" }} />
          </div>
        )}
      </div>
      <div style={optionTextStyle}>
        <span style={{ ...optionLabelStyle, color: active ? "var(--color-accent)" : "var(--color-text-1)" }}>
          {label}
        </span>
        <span style={optionDescStyle}>{description}</span>
      </div>
      {active && (
        <div style={checkStyle}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      )}
    </button>
  );
}

const sectionStyle = {
  marginTop: "2rem",
} satisfies React.CSSProperties;

const headingStyle = {
  fontSize: "1rem",
  fontWeight: 600,
  color: "var(--color-text-1)",
  margin: "0 0 0.25rem",
} satisfies React.CSSProperties;

const descriptionStyle = {
  fontSize: "0.875rem",
  color: "var(--color-text-2)",
  margin: "0 0 1.25rem",
  lineHeight: 1.5,
} satisfies React.CSSProperties;

const optionsStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: "0.75rem",
} satisfies React.CSSProperties;

const optionStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.875rem",
  padding: "0.875rem 1rem",
  borderRadius: "var(--radius-md)",
  border: "1.5px solid var(--color-border)",
  background: "var(--color-surface-0)",
  cursor: "pointer",
  textAlign: "left" as const,
  transition: "border-color 150ms ease, background 150ms ease",
} satisfies React.CSSProperties;

const previewWrapStyle = {
  width: "40px",
  height: "40px",
  borderRadius: "var(--radius-sm)",
  overflow: "hidden",
  flexShrink: 0,
  border: "1px solid var(--color-border)",
} satisfies React.CSSProperties;

const lightPreviewStyle = {
  width: "100%",
  height: "100%",
  background: "#f7f3ed",
  display: "flex",
  flexDirection: "column" as const,
  gap: "4px",
  padding: "6px",
} satisfies React.CSSProperties;

const darkPreviewStyle = {
  width: "100%",
  height: "100%",
  background: "#1e1b18",
  display: "flex",
  flexDirection: "column" as const,
  gap: "4px",
  padding: "6px",
} satisfies React.CSSProperties;

const autoPreviewStyle = {
  width: "100%",
  height: "100%",
  background: "linear-gradient(135deg, #f7f3ed 50%, #1e1b18 50%)",
  display: "flex",
  flexDirection: "column" as const,
  gap: "4px",
  padding: "6px",
  position: "relative" as const,
} satisfies React.CSSProperties;

const previewBarStyle = {
  height: "6px",
  borderRadius: "2px",
  background: "#9a3412",
} satisfies React.CSSProperties;

const previewBarShortStyle = {
  height: "6px",
  borderRadius: "2px",
  background: "#78716c",
  width: "60%",
} satisfies React.CSSProperties;

const optionTextStyle = {
  display: "flex",
  flexDirection: "column" as const,
  gap: "2px",
  flex: 1,
  minWidth: 0,
} satisfies React.CSSProperties;

const optionLabelStyle = {
  fontSize: "0.875rem",
  fontWeight: 600,
  transition: "color 150ms ease",
} satisfies React.CSSProperties;

const optionDescStyle = {
  fontSize: "0.75rem",
  color: "var(--color-text-3)",
  lineHeight: 1.4,
} satisfies React.CSSProperties;

const checkStyle = {
  width: "20px",
  height: "20px",
  borderRadius: "50%",
  background: "var(--color-accent)",
  color: "#fff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
} satisfies React.CSSProperties;

const toggleRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "1rem 1.25rem",
  background: "var(--color-surface-0)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-md)",
} satisfies React.CSSProperties;

const toggleLabelStyle = {
  fontSize: "0.875rem",
  fontWeight: 500,
  color: "var(--color-text-1)",
} satisfies React.CSSProperties;
