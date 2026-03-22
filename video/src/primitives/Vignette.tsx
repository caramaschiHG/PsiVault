import React from "react";

/** Cinematic vignette overlay — subtle edge darkening to frame content. */
export const Vignette: React.FC<{ opacity?: number }> = ({ opacity = 1 }) => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      background:
        "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 55%, rgba(20,16,12,0.20) 100%)",
      pointerEvents: "none",
      opacity,
      zIndex: 10,
    }}
  />
);
