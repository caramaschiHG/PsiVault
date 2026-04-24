"use client";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  "aria-label"?: string;
}

const sizeMap = {
  sm: 14,
  md: 20,
  lg: 28,
};

export function Spinner({
  size = "sm",
  className = "",
  "aria-label": ariaLabel = "Carregando...",
}: SpinnerProps) {
  const px = sizeMap[size];
  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 14 14"
      fill="none"
      style={{ animation: "spin 0.6s linear infinite", flexShrink: 0 }}
      className={className}
      aria-hidden={ariaLabel ? undefined : "true"}
      aria-label={ariaLabel}
      role="status"
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
  );
}
