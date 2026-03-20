"use client";

import { useState } from "react";

interface WhatsAppEntry {
  appointmentId: string;
  patientName: string;
  patientPhone: string;
  appointmentDate: string;
  appointmentTime: string;
  whatsappUrl: string;
}

interface Props {
  entries: WhatsAppEntry[];
}

export function TodayWhatsAppPanel({ entries }: Props) {
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(entries.map((e) => e.appointmentId)),
  );
  const [sending, setSending] = useState(false);

  if (entries.length === 0) return null;

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function sendAll() {
    const toSend = entries.filter((e) => selected.has(e.appointmentId));
    if (toSend.length === 0) return;
    setSending(true);
    for (let i = 0; i < toSend.length; i++) {
      window.open(toSend[i].whatsappUrl, "_blank");
      if (i < toSend.length - 1) {
        await new Promise((res) => setTimeout(res, 800));
      }
    }
    setSending(false);
  }

  return (
    <section style={panelStyle}>
      <div style={panelHeaderStyle}>
        <div>
          <p style={eyebrowStyle}>WhatsApp</p>
          <h2 style={panelTitleStyle}>Lembretes do dia</h2>
        </div>
        <button
          onClick={sendAll}
          disabled={sending || selected.size === 0}
          style={selected.size > 0 ? sendButtonStyle : sendButtonDisabledStyle}
        >
          {sending ? "Abrindo…" : `Enviar lembretes (${selected.size})`}
        </button>
      </div>

      <ul style={listStyle}>
        {entries.map((entry) => (
          <li key={entry.appointmentId} style={listItemStyle}>
            <label style={checkboxLabelStyle}>
              <input
                type="checkbox"
                checked={selected.has(entry.appointmentId)}
                onChange={() => toggle(entry.appointmentId)}
                style={checkboxStyle}
              />
              <div style={entryInfoStyle}>
                <span style={patientNameStyle}>{entry.patientName}</span>
                <span style={timeStyle}>{entry.appointmentTime}</span>
              </div>
            </label>
          </li>
        ))}
      </ul>
    </section>
  );
}

const panelStyle = {
  background: "var(--color-surface-1)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-lg)",
  padding: "1.25rem",
  display: "grid",
  gap: "1rem",
} satisfies React.CSSProperties;

const panelHeaderStyle = {
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "space-between",
  gap: "1rem",
  flexWrap: "wrap" as const,
} satisfies React.CSSProperties;

const eyebrowStyle = {
  margin: 0,
  fontSize: "0.7rem",
  fontWeight: 600,
  textTransform: "uppercase" as const,
  letterSpacing: "0.12em",
  color: "var(--color-brown-mid)",
} satisfies React.CSSProperties;

const panelTitleStyle = {
  margin: 0,
  fontSize: "0.95rem",
  fontWeight: 600,
  color: "var(--color-text-1)",
} satisfies React.CSSProperties;

const sendButtonStyle = {
  padding: "0.45rem 1rem",
  borderRadius: "var(--radius-md)",
  border: "none",
  background: "#25d366",
  color: "#fff",
  fontSize: "0.85rem",
  fontWeight: 600,
  cursor: "pointer",
  fontFamily: "inherit",
  whiteSpace: "nowrap" as const,
} satisfies React.CSSProperties;

const sendButtonDisabledStyle = {
  ...sendButtonStyle,
  opacity: 0.4,
  cursor: "not-allowed",
};

const listStyle = {
  margin: 0,
  padding: 0,
  listStyle: "none",
  display: "grid",
  gap: "0.4rem",
} satisfies React.CSSProperties;

const listItemStyle = {
  borderRadius: "var(--radius-sm)",
  transition: "background 0.1s",
} satisfies React.CSSProperties;

const checkboxLabelStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.65rem",
  padding: "0.45rem 0.5rem",
  cursor: "pointer",
  borderRadius: "var(--radius-sm)",
} satisfies React.CSSProperties;

const checkboxStyle = {
  width: "1rem",
  height: "1rem",
  accentColor: "#25d366",
  cursor: "pointer",
  flexShrink: 0,
} satisfies React.CSSProperties;

const entryInfoStyle = {
  display: "flex",
  alignItems: "center",
  gap: "0.5rem",
  flex: 1,
  minWidth: 0,
} satisfies React.CSSProperties;

const patientNameStyle = {
  fontSize: "0.875rem",
  color: "var(--color-text-1)",
  fontWeight: 500,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap" as const,
} satisfies React.CSSProperties;

const timeStyle = {
  fontSize: "0.8rem",
  color: "var(--color-text-2)",
  whiteSpace: "nowrap" as const,
} satisfies React.CSSProperties;
