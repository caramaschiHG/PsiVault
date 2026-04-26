"use client";

import { useFormStatus } from "react-dom";
import { Spinner } from "@/components/ui/spinner";

interface FormSubmitButtonProps {
  label: string;
  pendingLabel: string;
  style?: React.CSSProperties;
  className?: string;
}

export function FormSubmitButton({
  label,
  pendingLabel,
  style,
  className = "",
}: FormSubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={className}
      style={{
        ...style,
        opacity: pending ? 0.7 : 1,
        cursor: pending ? "wait" : "pointer",
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
      }}
    >
      {pending && <Spinner size="sm" aria-hidden="true" />}
      {pending ? pendingLabel : label}
    </button>
  );
}
