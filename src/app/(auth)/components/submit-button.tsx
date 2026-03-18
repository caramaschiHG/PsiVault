"use client";

import { useFormStatus } from "react-dom";

function SpinnerSVG() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
      <path d="M12 2 a10 10 0 0 1 10 10">
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 12 12"
          to="360 12 12"
          dur="0.8s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  );
}

export function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      style={
        {
          borderRadius: "16px",
          padding: "1rem 1.2rem",
          background: "#9a3412",
          color: "#fff",
          fontWeight: 700,
          border: 0,
          cursor: pending ? "not-allowed" : "pointer",
          opacity: pending ? 0.7 : 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
        } satisfies React.CSSProperties
      }
    >
      {pending ? <SpinnerSVG /> : label}
    </button>
  );
}
