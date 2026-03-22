/**
 * Opening — 0s to 4.5s
 * Rotina clínica fragmentada: 5 cards dispersos flutuando no espaço.
 * Narrativa: a carga mental silenciosa antes da organização.
 */
import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { T } from "../tokens";
import { useSceneFade, float, SPRING } from "../utils/timing";
import { Vignette } from "../primitives/Vignette";

type SceneProps = { duration: number };

// ─── Fragment definitions ──────────────────────────────────────
const FRAGS = [
  { x: 140,  y: 175, rot: -7, w: 360, h: 210, delay: 0,  phase: 0.0, fromDx: -80, fromDy: -50 },
  { x: 1460, y: 185, rot:  5, w: 310, h: 190, delay: 8,  phase: 1.3, fromDx:  80, fromDy: -50 },
  { x: 1320, y: 490, rot: -4, w: 370, h: 230, delay: 16, phase: 2.1, fromDx:  80, fromDy:  50 },
  { x: 160,  y: 640, rot:  6, w: 300, h: 168, delay: 6,  phase: 0.7, fromDx: -80, fromDy:  50 },
  { x: 790,  y: 715, rot: -2, w: 350, h: 190, delay: 12, phase: 1.8, fromDx:   0, fromDy:  70 },
];

// ─── Fragment content ──────────────────────────────────────────
const Eyebrow: React.FC<{ label: string }> = ({ label }) => (
  <div style={{
    fontSize: 12, fontWeight: 700, letterSpacing: "0.18em",
    textTransform: "uppercase", color: T.brownMid,
    fontFamily: T.fontSans, marginBottom: 16,
  }}>
    {label}
  </div>
);

const FragAgenda: React.FC = () => (
  <div style={{ padding: "22px 26px" }}>
    <Eyebrow label="Agenda" />
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {[
        { time: "09:00", name: "M. Ferreira" },
        { time: "11:00", name: "C. Albuquerque" },
      ].map((row) => (
        <div key={row.time} style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "8px 12px", background: T.accentLight,
          borderRadius: T.rSm, border: `1px solid ${T.borderMed}`,
        }}>
          <span style={{ fontSize: 13, color: T.text3, width: 44, flexShrink: 0, fontFamily: T.fontSans }}>{row.time}</span>
          <span style={{ fontSize: 15, color: T.text1, fontWeight: 500, fontFamily: T.fontSans }}>{row.name}</span>
        </div>
      ))}
    </div>
  </div>
);

const FragNota: React.FC = () => (
  <div style={{ padding: "22px 26px" }}>
    <Eyebrow label="Nota Clínica" />
    <div style={{ fontSize: 13, color: T.text3, fontFamily: T.fontSans, marginBottom: 12 }}>
      Sessão 14 · 21 mar 2026
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
      {[78, 100, 62, 85].map((w, i) => (
        <div key={i} style={{
          height: 9, width: `${w}%`,
          background: "rgba(146, 64, 14, 0.09)",
          borderRadius: 999,
        }} />
      ))}
    </div>
  </div>
);

const FragProntuario: React.FC = () => (
  <div style={{ padding: "22px 26px" }}>
    <Eyebrow label="Prontuário" />
    <div style={{ fontSize: 19, fontWeight: 500, color: T.text1, fontFamily: T.fontSans, marginBottom: 6 }}>
      Ana Claudia M.
    </div>
    <div style={{ fontSize: 13, color: T.text3, fontFamily: T.fontSans, marginBottom: 10 }}>
      Sessão 22 · desde jan 2025
    </div>
    <div style={{ fontSize: 12, color: T.text4, fontFamily: T.fontSans }}>
      Próxima: 28 mar · 10:00
    </div>
  </div>
);

const FragCobranca: React.FC = () => (
  <div style={{ padding: "22px 26px" }}>
    <Eyebrow label="Cobrança" />
    <div style={{ fontSize: 26, fontWeight: 600, color: T.text1, fontFamily: T.fontSans, marginBottom: 10 }}>
      R$ 280,00
    </div>
    <div style={{
      display: "inline-flex", alignItems: "center",
      background: T.pendingBg, color: T.pendingText,
      borderRadius: T.rPill, padding: "4px 14px",
      fontSize: 12, fontWeight: 600, fontFamily: T.fontSans,
    }}>
      Pendente
    </div>
  </div>
);

const FragPendencias: React.FC = () => (
  <div style={{ padding: "22px 26px" }}>
    <Eyebrow label="Pendências" />
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      {[
        "Enviar declaração — M. Ferreira",
        "Renovar atestado — B. Lemos",
        "Conferir sessões de março",
      ].map((item, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 15, height: 15, borderRadius: 4, flexShrink: 0,
            border: `1.5px solid ${T.borderMed}`,
          }} />
          <span style={{ fontSize: 13, color: T.text2, fontFamily: T.fontSans }}>{item}</span>
        </div>
      ))}
    </div>
  </div>
);

const CONTENTS = [FragAgenda, FragNota, FragProntuario, FragCobranca, FragPendencias];

// ─── Scene ────────────────────────────────────────────────────
export const Opening: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sceneOpacity = useSceneFade(duration);

  return (
    <AbsoluteFill style={{ background: T.bg, opacity: sceneOpacity }}>

      {/* Warm ambient glow */}
      <div style={{
        position: "absolute",
        width: 1100, height: 1100,
        left: "50%", top: "50%",
        transform: "translate(-50%, -50%)",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(154,52,18,0.09) 0%, transparent 60%)",
        pointerEvents: "none",
      }} />
      <Vignette />

      {FRAGS.map((frag, i) => {
        const Content = CONTENTS[i];

        const entrance = spring({
          frame: frame - frag.delay,
          fps,
          config: SPRING.FLOAT,
        });

        const entryDx = interpolate(entrance, [0, 1], [frag.fromDx, 0]);
        const entryDy = interpolate(entrance, [0, 1], [frag.fromDy, 0]);
        const entryScale = interpolate(entrance, [0, 1], [0.88, 1]);
        const floatDy = float(frame, 14, frag.phase, 0.032);
        const floatDx = float(frame, 5, frag.phase + 1.4, 0.024);
        const cardOpacity = interpolate(entrance, [0, 0.25, 1], [0, 0.7, 0.97]);

        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: frag.x,
              top: frag.y,
              width: frag.w,
              height: frag.h,
              transform: `translate(${entryDx + floatDx}px, ${entryDy + floatDy}px) rotate(${frag.rot}deg) scale(${entryScale})`,
              background: T.surface1,
              border: `1px solid ${T.border}`,
              borderRadius: T.rMd,
              boxShadow: T.shadowVideo,
              opacity: cardOpacity,
              overflow: "hidden",
            }}
          >
            <Content />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
