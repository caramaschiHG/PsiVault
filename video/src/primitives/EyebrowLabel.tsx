import React from "react";
import { T } from "../tokens";

type EyebrowLabelProps = {
  children: React.ReactNode;
  opacity?: number;
  style?: React.CSSProperties;
};

export const EyebrowLabel: React.FC<EyebrowLabelProps> = ({ children, opacity = 1, style }) => (
  <div
    style={{
      fontSize: 15,
      fontWeight: 700,
      letterSpacing: "0.22em",
      textTransform: "uppercase",
      color: T.brownMid,
      fontFamily: T.fontSans,
      opacity,
      ...style,
    }}
  >
    {children}
  </div>
);
