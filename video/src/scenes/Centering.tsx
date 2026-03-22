/**
 * Centering — 4s to 9.5s
 * Os fragmentos convergem. O PsiVault emerge como centro calmo.
 * Narrativa: ordem, identidade, confiança.
 */
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { T } from "../tokens";
import { useSceneFade, useEntrance, springY, springScale, SPRING } from "../utils/timing";
import { Vignette } from "../primitives/Vignette";

type SceneProps = { duration: number };

// Lock icon SVG (inline, brand style)
const LockIcon: React.FC<{ size?: number; color?: string }> = ({ size = 36, color = T.accent }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    <circle cx="12" cy="16" r="1" fill={color} stroke="none" />
  </svg>
);

export const Centering: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sceneOpacity = useSceneFade(duration);

  // Staggered entrance animations — organic springs
  const glowIn    = useEntrance(0,  SPRING.FLOAT);
  const lockIn    = useEntrance(15, SPRING.CRISP);
  const logoIn    = useEntrance(25, SPRING.ORGANIC);
  const lineGrow  = interpolate(frame, [50, 95], [0, 340], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const eyebrowIn = useEntrance(70, SPRING.ORGANIC);

  return (
    <AbsoluteFill style={{ background: T.bg, opacity: sceneOpacity }}>

      {/* Warm radial bloom */}
      <div style={{
        position: "absolute",
        width: 1000, height: 1000,
        left: "50%", top: "50%",
        transform: "translate(-50%, -50%)",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(154,52,18,0.12) 0%, transparent 58%)",
        opacity: glowIn,
        pointerEvents: "none",
      }} />
      <Vignette opacity={interpolate(glowIn, [0, 1], [0, 1])} />

      {/* Centered content stack */}
      <AbsoluteFill style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
      }}>

        {/* Lock icon */}
        <div style={{
          opacity: interpolate(lockIn, [0, 1], [0, 0.88]),
          transform: `translateY(${springY(lockIn, 24)}px) scale(${interpolate(lockIn, [0, 1], [0.72, 1])})`,
          marginBottom: 24,
        }}>
          <LockIcon size={44} color={T.accent} />
        </div>

        {/* Wordmark — IBM Plex Serif, accent color */}
        <div style={{
          fontFamily: T.fontSerif,
          fontSize: 96,
          fontWeight: 600,
          color: T.accent,
          letterSpacing: "-0.03em",
          lineHeight: 1,
          opacity: interpolate(logoIn, [0, 1], [0, 1]),
          transform: `translateY(${springY(logoIn, 28)}px) scale(${springScale(logoIn, 0.92)})`,
        }}>
          PsiVault
        </div>

        {/* Separator line — draws from center */}
        <div style={{
          width: lineGrow,
          height: 1,
          background: T.borderMed,
          marginTop: 24,
          marginBottom: 22,
        }} />

        {/* Eyebrow tagline */}
        <div style={{
          fontFamily: T.fontSans,
          fontSize: 17,
          fontWeight: 700,
          letterSpacing: "0.24em",
          textTransform: "uppercase",
          color: T.brownMid,
          opacity: interpolate(eyebrowIn, [0, 1], [0, 1]),
          transform: `translateY(${springY(eyebrowIn, 18)}px)`,
        }}>
          O COFRE DA ROTINA CLÍNICA
        </div>

      </AbsoluteFill>
    </AbsoluteFill>
  );
};
