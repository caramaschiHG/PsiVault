import { SettingsNav } from "./components/settings-nav";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={shellStyle}>
      <SettingsNav />
      {children}
    </div>
  );
}

const shellStyle = {
  display: "grid",
  gap: 0,
} satisfies React.CSSProperties;
