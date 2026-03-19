"use client";

import { useRef } from "react";

interface OtpInputProps {
  value: string;
  onValueChange: (v: string) => void;
  hasError?: boolean;
  autoFocus?: boolean;
}

export function OtpInput({ value, onValueChange, hasError, autoFocus }: OtpInputProps) {
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? "");
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  function focusAt(i: number) {
    inputsRef.current[i]?.focus();
  }

  function handleChange(i: number, raw: string) {
    const char = raw.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = char;
    onValueChange(next.join(""));
    if (char && i < 5) focusAt(i + 1);
  }

  function handleKeyDown(i: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace") {
      if (digits[i]) {
        const next = [...digits];
        next[i] = "";
        onValueChange(next.join(""));
      } else if (i > 0) {
        focusAt(i - 1);
      }
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onValueChange(pasted.padEnd(6, "").slice(0, 6));
    focusAt(Math.min(pasted.length, 5));
  }

  return (
    <div className="auth-otp-wrap" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => { inputsRef.current[i] = el; }}
          className={`auth-otp-digit${hasError ? " auth-otp-digit--error" : ""}`}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          autoFocus={autoFocus && i === 0}
          aria-label={`Dígito ${i + 1} do código`}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
        />
      ))}
    </div>
  );
}
