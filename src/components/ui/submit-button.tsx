"use client";

import { useFormStatus } from "react-dom";

interface SubmitButtonProps {
  label: string;
  pendingLabel?: string;
  style?: React.CSSProperties;
  className?: string;
}

export function SubmitButton({
  label,
  pendingLabel = "Salvando...",
  style,
  className,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      style={{ ...baseStyle, ...style, ...(pending ? pendingStyle : {}) }}
      className={className}
    >
      {pending && (
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          style={spinnerStyle}
          aria-hidden="true"
        >
          <circle
            cx="7"
            cy="7"
            r="5.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="22"
            strokeDashoffset="8"
            strokeLinecap="round"
          />
        </svg>
      )}
      {pending ? pendingLabel : label}
    </button>
  );
}

const baseStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.4rem",
  cursor: "pointer",
} satisfies React.CSSProperties;

const pendingStyle = {
  opacity: 0.7,
  cursor: "not-allowed",
} satisfies React.CSSProperties;

const spinnerStyle = {
  animation: "spin 0.6s linear infinite",
  flexShrink: 0,
} satisfies React.CSSProperties;
