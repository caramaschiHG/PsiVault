/**
 * Closing — 20s to 25s
 * O cofre fecha. A marca se apresenta com calma e precisão.
 * Narrativa: confiança, sigilo, organização — tudo no lugar.
 */
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { T } from "../tokens";
import { useSceneFade, useEntrance, springY, springScale, SPRING, float } from "../utils/timing";

type SceneProps = { duration: number };

// Lock icon — cream version for dark background
const LockIconCream: React.FC<{ size?: number }> = ({ size = 44 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="rgba(247,243,237,0.5)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    <circle cx="12" cy="16" r="1" fill="rgba(247,243,237,0.5)" stroke="none" />
  </svg>
);

export const Closing: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sceneOpacity = useSceneFade(duration);

  // Staggered brand elements — organic springs
  const lockIn    = useEntrance(12, SPRING.CRISP);
  const logoIn    = useEntrance(24, SPRING.ORGANIC);
  const lineGrow  = interpolate(frame, [50, 92], [0, 280], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const taglineIn = useEntrance(78, SPRING.FLOAT);
  const sublineIn = useEntrance(100, SPRING.ORGANIC);
  const footerIn  = useEntrance(120, SPRING.ORGANIC);

  // Warm pulse — logo breathes, perceptible but not distracting
  const breathe = 1 + Math.sin(frame * 0.04) * 0.010;

  // Ambient floating dots — subtle life in the dark scene
  const dot1y = float(frame, 18, 0.0,  0.028);
  const dot2y = float(frame, 14, 1.7,  0.031);
  const dot3y = float(frame, 22, 3.4,  0.026);
  const dot4y = float(frame, 10, 5.1,  0.034);
  const dotsIn = useEntrance(30, SPRING.FLOAT);

  return (
    <AbsoluteFill
      style={{
        background: T.bgDark,
        opacity: sceneOpacity,
      }}
    >

      {/* Warm radial glow — richer for dark background */}
      <div style={{
        position: "absolute",
        inset: 0,
        background: "radial-gradient(ellipse 72% 72% at 50% 62%, rgba(154,52,18,0.18) 0%, transparent 58%)",
        pointerEvents: "none",
      }} />

      {/* Ambient floating dots */}
      {[
        { x: 220,  y: 200, size: 3, dy: dot1y, opacity: 0.14 },
        { x: 1700, y: 280, size: 2, dy: dot2y, opacity: 0.10 },
        { x: 160,  y: 820, size: 2, dy: dot3y, opacity: 0.12 },
        { x: 1740, y: 760, size: 3, dy: dot4y, opacity: 0.08 },
      ].map((dot, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            left: dot.x,
            top: dot.y,
            width: dot.size,
            height: dot.size,
            borderRadius: "50%",
            background: "rgba(247,243,237,0.9)",
            transform: `translateY(${dot.dy}px)`,
            opacity: dot.opacity * interpolate(dotsIn, [0, 1], [0, 1]),
          }}
        />
      ))}

      {/* Content — perfectly centered */}
      <AbsoluteFill style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
      }}>

        {/* Lock icon */}
        <div style={{
          opacity: interpolate(lockIn, [0, 1], [0, 1]),
          transform: `translateY(${springY(lockIn, 28)}px) scale(${interpolate(lockIn, [0, 1], [0.65, 1])})`,
          marginBottom: 26,
        }}>
          <LockIconCream size={48} />
        </div>

        {/* PsiVault wordmark */}
        <div style={{
          fontFamily: T.fontSerif,
          fontSize: 100,
          fontWeight: 400,
          color: "#f7f3ed",
          letterSpacing: "-0.025em",
          lineHeight: 1,
          opacity: interpolate(logoIn, [0, 1], [0, 1]),
          transform: `translateY(${springY(logoIn, 24)}px) scale(${interpolate(logoIn, [0, 1], [0.94, breathe])})`,
        }}>
          PsiVault
        </div>

        {/* Separator line */}
        <div style={{
          width: lineGrow,
          height: 1,
          background: "rgba(247, 243, 237, 0.18)",
          marginTop: 28,
          marginBottom: 26,
        }} />

        {/* Tagline — serif italic, premium */}
        <div style={{
          fontFamily: T.fontSerif,
          fontStyle: "italic",
          fontSize: 30,
          fontWeight: 400,
          color: "rgba(247, 243, 237, 0.80)",
          letterSpacing: "0.01em",
          lineHeight: 1.4,
          opacity: interpolate(taglineIn, [0, 1], [0, 1]),
          transform: `translateY(${springY(taglineIn, 18)}px)`,
          textAlign: "center",
          maxWidth: 720,
        }}>
          A rotina clínica no lugar.
        </div>

        {/* Supporting copy */}
        <div style={{
          fontFamily: T.fontSans,
          fontSize: 15,
          fontWeight: 400,
          color: "rgba(247, 243, 237, 0.38)",
          letterSpacing: "0.04em",
          marginTop: 14,
          opacity: interpolate(sublineIn, [0, 1], [0, 1]),
          transform: `translateY(${springY(sublineIn, 12)}px)`,
          textAlign: "center",
          maxWidth: 600,
        }}>
          Prontuário · Agenda · Documentos · Cobranças
        </div>

        {/* Footer — domain / brand mark */}
        <div style={{
          fontFamily: T.fontSans,
          fontSize: 12,
          fontWeight: 500,
          letterSpacing: "0.20em",
          textTransform: "uppercase",
          color: "rgba(247, 243, 237, 0.32)",
          marginTop: 50,
          opacity: interpolate(footerIn, [0, 1], [0, 1]),
        }}>
          psivault.com.br
        </div>

      </AbsoluteFill>
    </AbsoluteFill>
  );
};
