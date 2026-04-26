"use client";

import { useTheme } from "./theme-provider";

export function ThemeToggle({ size = 36 }: { size?: number }) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
      title={isDark ? "Modo claro" : "Modo escuro"}
      style={{
        width: size,
        height: size / 1.75,
        borderRadius: 999,
        border: "none",
        background: isDark ? "#3d2b1a" : "#e8ddd0",
        cursor: "pointer",
        position: "relative",
        padding: 2,
        transition: "background 300ms ease",
        display: "inline-flex",
        alignItems: "center",
        flexShrink: 0,
      }}
    >
      {/* Track icons */}
      <span
        style={{
          position: "absolute",
          left: size * 0.08,
          fontSize: size * 0.28,
          lineHeight: 1,
          opacity: isDark ? 0.3 : 0,
          transition: "opacity 300ms ease",
          userSelect: "none",
        }}
        aria-hidden="true"
      >
        ☀
      </span>
      <span
        style={{
          position: "absolute",
          right: size * 0.08,
          fontSize: size * 0.22,
          lineHeight: 1,
          opacity: isDark ? 0 : 0.3,
          transition: "opacity 300ms ease",
          userSelect: "none",
        }}
        aria-hidden="true"
      >
        ☾
      </span>

      {/* Thumb */}
      <span
        style={{
          width: size / 1.75 - 6,
          height: size / 1.75 - 6,
          borderRadius: "50%",
          background: isDark ? "#f7f3ed" : "#fff",
          boxShadow: isDark
            ? "0 1px 4px rgba(0,0,0,0.4), inset 0 -1px 2px rgba(0,0,0,0.1)"
            : "0 1px 4px rgba(120,53,15,0.2), inset 0 -1px 2px rgba(0,0,0,0.05)",
          transform: isDark ? `translateX(${size - size / 1.75 - 1}px)` : "translateX(1px)",
          transition: "transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1), background 300ms ease, box-shadow 300ms ease",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* Sun icon inside thumb (light mode) */}
        <svg
          width={size * 0.22}
          height={size * 0.22}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#b45309"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            position: "absolute",
            opacity: isDark ? 0 : 1,
            transform: isDark ? "rotate(-90deg) scale(0.5)" : "rotate(0deg) scale(1)",
            transition: "opacity 200ms ease, transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>

        {/* Moon icon inside thumb (dark mode) */}
        <svg
          width={size * 0.2}
          height={size * 0.2}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#3d2b1a"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            position: "absolute",
            opacity: isDark ? 1 : 0,
            transform: isDark ? "rotate(0deg) scale(1)" : "rotate(90deg) scale(0.5)",
            transition: "opacity 200ms ease, transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)",
          }}
          aria-hidden="true"
        >
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </span>
    </button>
  );
}
