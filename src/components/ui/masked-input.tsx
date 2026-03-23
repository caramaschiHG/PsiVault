"use client";

import { useState, ChangeEvent, useEffect } from "react";

interface MaskedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "defaultValue"> {
  mask: "phone" | "crp";
  value?: string;
  defaultValue?: string;
}

function applyMask(value: string, mask: "phone" | "crp"): string {
  if (!value) return "";
  
  if (mask === "phone") {
    const digits = value.replace(/\D/g, "");
    if (digits.length === 0) return "";
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  }
  
  if (mask === "crp") {
    const digits = value.replace(/\D/g, "");
    
    // Allow empty string or just the prefix
    if (digits.length === 0) {
      const upper = value.toUpperCase();
      if (upper === "C") return "C";
      if (upper === "CR") return "CR";
      if (upper.startsWith("CRP")) return "CRP ";
      return ""; 
    }
    
    if (digits.length <= 2) return `CRP ${digits}`;
    return `CRP ${digits.slice(0, 2)}/${digits.slice(2, 8)}`;
  }
  
  return value;
}

export function MaskedInput({ mask, defaultValue, value: propValue, onChange, ...props }: MaskedInputProps) {
  const [val, setVal] = useState(() => {
    if (propValue !== undefined) return applyMask(String(propValue), mask);
    if (defaultValue !== undefined) return applyMask(String(defaultValue), mask);
    return "";
  });

  useEffect(() => {
    if (propValue !== undefined) {
      setVal(applyMask(String(propValue), mask));
    }
  }, [propValue, mask]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    
    // Allow deletion of the prefix
    if (mask === "crp" && val === "CRP " && rawValue.toUpperCase() === "CRP") {
      setVal("");
      e.target.value = "";
      if (onChange) onChange(e);
      return;
    }
    
    const formatted = applyMask(rawValue, mask);
    setVal(formatted);
    
    e.target.value = formatted;
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <input
      {...props}
      value={val}
      onChange={handleChange}
    />
  );
}
