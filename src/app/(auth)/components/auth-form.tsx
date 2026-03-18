"use client";

import { useFormStatus } from "react-dom";

export function AuthForm({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <fieldset
      disabled={pending}
      style={{ border: "none", padding: 0, margin: 0 } satisfies React.CSSProperties}
    >
      {children}
    </fieldset>
  );
}
