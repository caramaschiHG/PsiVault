/**
 * Patient — 14s to 19s
 * Ficha do paciente + registro clínico com efeito typewriter.
 * Narrativa: conhecimento acumulado, cuidado individualizado.
 *
 * Layout: card mais largo (960px), entra da ESQUERDA.
 * Glow: centro-inferior para variar.
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
  "Sessão conduzida com foco em técnicas de reestruturação cognitiva. " +
  "Próxima sessão: 28 de março.";

const NoteIcon: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={T.text3} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="8" y1="13" x2="16" y2="13" />
    <line x1="8" y1="17" x2="12" y2="17" />
  </svg>
);

// Stat pill for session count / since
const StatPill: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={{
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "10px 20px",
    background: T.accentLight,
    borderRadius: T.rMd,
    border: `1px solid ${T.borderMed}`,
    minWidth: 80,
  }}>
    <span style={{ fontFamily: T.fontSans, fontSize: 20, fontWeight: 700, color: T.accent, lineHeight: 1 }}>{value}</span>
    <span style={{ fontFamily: T.fontSans, fontSize: 11, color: T.text3, marginTop: 4, letterSpacing: "0.06em" }}>{label}</span>
  </div>
);

export const Patient: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sceneOpacity = useSceneFade(duration);

  const eyebrowIn    = useEntrance(8,  SPRING.ORGANIC);
  const cardIn       = useEntrance(18, SPRING.FLOAT);
  const profileIn    = useEntrance(30, SPRING.ORGANIC);
  const statsIn      = useEntrance(44, SPRING.CRISP);
  const dividerIn    = interpolate(frame, [52, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const noteHeaderIn = useEntrance(62, SPRING.ORGANIC);

  // Typewriter — more room to breathe: frames 75→130
  const charsVisible = Math.floor(
    interpolate(frame, [75, 135], [0, NOTE_TEXT.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  return (
    <AbsoluteFill style={{ background: T.bg, opacity: sceneOpacity }}>

      {/* Glow — centro-inferior */}
      <div style={{
        position: "absolute",
        width: 1200, height: 900,
        left: "50%", bottom: "5%",
        transform: "translate(-50%, 0)",
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(154,52,18,0.09) 0%, transparent 55%)",
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

        {/* Main card — entra da ESQUERDA, mais largo */}
        <UICard
          width={960}
          style={{
            opacity: interpolate(cardIn, [0, 1], [0, 1]),
            transform: `translateX(${interpolate(cardIn, [0, 1], [-60, 0])}px) scale(${springScale(cardIn, 0.97)})`,
          }}
        >
          {/* Patient profile header */}
          <div style={{
            padding: "24px 36px",
            borderBottom: `1px solid ${T.border}`,
            display: "flex",
            alignItems: "center",
            gap: 24,
            opacity: interpolate(profileIn, [0, 1], [0, 1]),
          }}>
            {/* Avatar */}
            <div style={{
              width: 56, height: 56, borderRadius: "50%",
              background: T.accentLight,
              border: `1px solid ${T.borderMed}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 19, fontWeight: 700, color: T.accent,
              fontFamily: T.fontSans, flexShrink: 0,
            }}>
              MC
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: T.fontSans, fontSize: 19, fontWeight: 600, color: T.text1, marginBottom: 5 }}>
                Mariana Costa Ferreira
              </div>
              <div style={{ fontFamily: T.fontSans, fontSize: 13, color: T.text3, display: "flex", gap: 20 }}>
                <span>34 anos</span>
                <span>Atendimento desde mar 2024</span>
              </div>
            </div>
            {/* Stats */}
            <div style={{
              display: "flex",
              gap: 12,
              opacity: interpolate(statsIn, [0, 1], [0, 1]),
              transform: `scale(${springScale(statsIn, 0.88)})`,
            }}>
              <StatPill label="sessões" value="14" />
              <StatPill label="meses" value="24" />
            </div>
          </div>

          {/* Note section */}
          <div style={{
            padding: "18px 36px 8px",
            opacity: dividerIn,
            transform: `translateX(${interpolate(dividerIn, [0, 1], [-10, 0])}px)`,
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

          {/* Typewriter note body */}
          <div style={{
            padding: "10px 36px 32px",
            fontFamily: T.fontSans,
            fontSize: 16,
            color: T.text2,
            lineHeight: 1.7,
            minHeight: 90,
          }}>
            {NOTE_TEXT.slice(0, charsVisible)}
            {charsVisible < NOTE_TEXT.length && (
              <span style={{
                display: "inline-block", width: 2, height: "1em",
                background: T.accent, verticalAlign: "text-bottom",
                opacity: frame % 28 < 14 ? 1 : 0,
              }} />
            )}
          </div>
        </UICard>

      </AbsoluteFill>
    </AbsoluteFill>
  );
};
