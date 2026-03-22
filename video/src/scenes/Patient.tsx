/**
 * Patient — 12s to 15.5s
 * Ficha do paciente + registro clínico com efeito typewriter.
 * Narrativa: conhecimento acumulado, cuidado individualizado.
 */
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { T } from "../tokens";
import { useSceneFade, useEntrance, springY, springScale, SPRING } from "../utils/timing";
import { UICard } from "../primitives/UICard";
import { EyebrowLabel } from "../primitives/EyebrowLabel";
import { Vignette } from "../primitives/Vignette";

type SceneProps = { duration: number };

const NOTE_TEXT =
  "Paciente relata avanço significativo nos processos de regulação emocional. " +
  "Sessão conduzida com foco em técnicas de reestruturação cognitiva.";

// User icon
const UserIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.text3} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);

// Note/document icon
const NoteIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.text3} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="8" y1="13" x2="16" y2="13" />
    <line x1="8" y1="17" x2="12" y2="17" />
  </svg>
);

export const Patient: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sceneOpacity = useSceneFade(duration);

  const eyebrowIn    = useEntrance(8,  SPRING.ORGANIC);
  const cardIn       = useEntrance(18, SPRING.FLOAT);
  const profileIn    = useEntrance(30, SPRING.ORGANIC);
  const dividerIn    = interpolate(frame, [42, 72], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const noteHeaderIn = useEntrance(56, SPRING.ORGANIC);
  const sessionIn    = useEntrance(62, SPRING.ORGANIC);

  // Typewriter effect for note body
  const charsVisible = Math.floor(
    interpolate(frame, [65, 100], [0, NOTE_TEXT.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  return (
    <AbsoluteFill style={{ background: T.bg, opacity: sceneOpacity }}>

      {/* Warm glow */}
      <div style={{
        position: "absolute",
        width: 1100, height: 1100,
        left: "50%", top: "50%",
        transform: "translate(-50%, -50%)",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(154,52,18,0.09) 0%, transparent 56%)",
        pointerEvents: "none",
      }} />
      <Vignette />

      <AbsoluteFill style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 28,
      }}>

        {/* Eyebrow */}
        <EyebrowLabel
          opacity={interpolate(eyebrowIn, [0, 1], [0, 1])}
          style={{ transform: `translateY(${springY(eyebrowIn, 16)}px)` }}
        >
          Registro Clínico
        </EyebrowLabel>

        {/* Main card */}
        <UICard
          width={860}
          style={{
            opacity: interpolate(cardIn, [0, 1], [0, 1]),
            transform: `translateY(${springY(cardIn, 40)}px) scale(${springScale(cardIn, 0.96)})`,
          }}
        >
          {/* Patient profile header */}
          <div style={{
            padding: "24px 32px",
            borderBottom: `1px solid ${T.border}`,
            display: "flex",
            alignItems: "center",
            gap: 20,
            opacity: interpolate(profileIn, [0, 1], [0, 1]),
          }}>
            {/* Avatar */}
            <div style={{
              width: 52, height: 52, borderRadius: "50%",
              background: T.accentLight,
              border: `1px solid ${T.borderMed}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, fontWeight: 600, color: T.accent,
              fontFamily: T.fontSans, flexShrink: 0,
            }}>
              MC
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: T.fontSans, fontSize: 18, fontWeight: 600, color: T.text1, marginBottom: 4 }}>
                Mariana Costa Ferreira
              </div>
              <div style={{ fontFamily: T.fontSans, fontSize: 13, color: T.text3, display: "flex", gap: 20 }}>
                <span>34 anos</span>
                <span>Atendimento desde mar 2024</span>
              </div>
            </div>
            <div style={{
              fontFamily: T.fontSans, fontSize: 12, fontWeight: 600,
              letterSpacing: "0.12em", textTransform: "uppercase",
              color: T.text4,
            }}>
              Sessão 14
            </div>
          </div>

          {/* Divider with date */}
          <div style={{
            padding: "16px 32px 8px",
            opacity: dividerIn,
            transform: `translateX(${interpolate(dividerIn, [0, 1], [-12, 0])}px)`,
          }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              fontSize: 13, color: T.text4, fontFamily: T.fontSans,
            }}>
              <NoteIcon />
              <span style={{ fontWeight: 600 }}>21 mar 2026</span>
              <span>·</span>
              <span style={{
                opacity: interpolate(noteHeaderIn, [0, 1], [0, 1]),
                transform: `translateX(${interpolate(noteHeaderIn, [0, 1], [-8, 0])}px)`,
              }}>
                Registro da sessão
              </span>
            </div>
          </div>

          {/* Note text — typewriter */}
          <div style={{
            padding: "8px 32px 28px",
            fontFamily: T.fontSans,
            fontSize: 16,
            color: T.text2,
            lineHeight: 1.65,
            minHeight: 80,
          }}>
            {NOTE_TEXT.slice(0, charsVisible)}
            {charsVisible < NOTE_TEXT.length && (
              <span style={{
                display: "inline-block", width: 2, height: "1em",
                background: T.accent, verticalAlign: "text-bottom",
                opacity: frame % 30 < 15 ? 1 : 0,
              }} />
            )}
          </div>
        </UICard>

      </AbsoluteFill>
    </AbsoluteFill>
  );
};
