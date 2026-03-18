import React from "react";

const shellStyle = {
  padding: "2rem 2.5rem",
  maxWidth: 960,
  width: "100%",
  display: "grid",
  gap: "1.25rem",
  alignContent: "start",
} satisfies React.CSSProperties;

const skeletonHeaderStyle = {
  height: "120px",
  borderRadius: "var(--radius-xl)",
  background: "var(--color-surface-1)",
  border: "1px solid var(--color-border)",
  animation: "skeleton-pulse 1.5s ease-in-out infinite",
} satisfies React.CSSProperties;

const skeletonSectionStyle = {
  height: "200px",
  borderRadius: "var(--radius-xl)",
  background: "var(--color-surface-1)",
  border: "1px solid var(--color-border)",
  animation: "skeleton-pulse 1.5s ease-in-out infinite",
} satisfies React.CSSProperties;

export default function PatientProfileLoading() {
  return (
    <main style={shellStyle}>
      <div style={skeletonHeaderStyle} />
      <div style={skeletonSectionStyle} />
      <div style={skeletonSectionStyle} />
      <div style={skeletonSectionStyle} />
    </main>
  );
}
