"use client";

import { useFormStatus } from "react-dom";
import { Button } from "./button";

interface SubmitButtonProps {
  label: string;
  pendingLabel?: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  className?: string;
  fullWidth?: boolean;
}

export function SubmitButton({
  label,
  pendingLabel = "Salvando...",
  variant = "primary",
  className,
  fullWidth = false,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      variant={variant}
      isLoading={pending}
      loadingLabel={pendingLabel}
      className={`${fullWidth ? "w-full" : ""} ${className ?? ""}`.trim()}
    >
      {label}
    </Button>
  );
}
