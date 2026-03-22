import React from "react";
import { T } from "../tokens";

type UICardProps = {
  children: React.ReactNode;
  width?: number | string;
  style?: React.CSSProperties;
};

export const UICard: React.FC<UICardProps> = ({ children, width = 860, style }) => (
  <div
    style={{
      width,
      background: T.surface1,
      border: `1px solid ${T.border}`,
      borderRadius: T.rLg,
      boxShadow: T.shadowVideo,
      overflow: "hidden",
      // Subtle inner top-edge highlight — adds depth on video
      outline: "1px solid rgba(255,255,255,0.6)",
      outlineOffset: -1,
      ...style,
    }}
  >
    {children}
  </div>
);
