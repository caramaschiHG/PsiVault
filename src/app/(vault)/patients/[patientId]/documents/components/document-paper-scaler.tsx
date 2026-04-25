"use client";

import React, { useEffect, useRef, useState } from "react";

interface DocumentPaperScalerProps {
  children: React.ReactNode;
}

export function DocumentPaperScaler({ children }: DocumentPaperScalerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const containerWidth = entry.contentRect.width;
        // 210mm ≈ 793.7px at 96dpi; add small buffer for rounding
        const paperWidth = 794;
        const ratio = containerWidth / paperWidth;
        setScale(ratio < 1 ? ratio : 1);
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        overflowX: "auto",
        display: "flex",
        justifyContent: "center",
        padding: "0.5rem 0",
      }}
    >
      <div
        style={{
          transform: scale < 1 ? `scale(${scale})` : undefined,
          transformOrigin: "top center",
          transition: "transform 200ms ease-out",
        }}
      >
        {children}
      </div>
    </div>
  );
}
