import React from "react";

const shellStyle = {
  padding: "2rem 2.5rem",
  maxWidth: 960,
  width: "100%",
  display: "grid",
  gap: "1.5rem",
  alignContent: "start",
} satisfies React.CSSProperties;

const skeletonTitleStyle = {
  height: "2rem",
  width: "40%",
  borderRadius: "var(--radius-md)",
  background: "var(--color-surface-1)",
  border: "1px solid var(--color-border)",
  animation: "skeleton-pulse 1.5s ease-in-out infinite",
} satisfies React.CSSProperties;

const skeletonBlockStyle = {
  height: "180px",
  borderRadius: "var(--radius-xl)",
  background: "var(--color-surface-1)",
  border: "1px solid var(--color-border)",
  animation: "skeleton-pulse 1.5s ease-in-out infinite",
} satisfies React.CSSProperties;

export default function InicioLoading() {
  return (
    <main style={shellStyle}>
      <div style={skeletonTitleStyle} />
      <div style={skeletonBlockStyle} />
      <div style={skeletonBlockStyle} />
      <div style={skeletonBlockStyle} />
    </main>
  );
}
