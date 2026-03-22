/**
 * ClinicalTimeline — 15s to 18.5s
 * Histórico de sessões: organização, continuidade, sigilo.
 * Narrativa: o prontuário como memória clínica confiável.
 */
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { T } from "../tokens";
import { useSceneFade, useEntrance, springY, springScale, SPRING } from "../utils/timing";
import { UICard } from "../primitives/UICard";
import { Badge } from "../primitives/Badge";
import { EyebrowLabel } from "../primitives/EyebrowLabel";
import { Vignette } from "../primitives/Vignette";

type SceneProps = { duration: number };

const SESSIONS = [
  { label: "jan 2026", desc: "Sessão 10", highlight: false },
  { label: "fev 2026", desc: "Sessão 11", highlight: false },
  { label: "fev 2026", desc: "Sessão 12", highlight: false },
  { label: "mar 2026", desc: "Sessão 13", highlight: false },
  { label: "mar 2026", desc: "Sessão 14 — atual", highlight: true },
];

export const ClinicalTimeline: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sceneOpacity = useSceneFade(duration);

  const eyebrowIn = useEntrance(8,  SPRING.ORGANIC);
  const cardIn    = useEntrance(18, SPRING.FLOAT);
  const badgeIn   = useEntrance(82, SPRING.CRISP);

  const lineHeight = interpolate(frame, [28, 80], [0, 208], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Staggered row entrances — hoisted to top level (no hooks in loops)
  const rowIn0 = useEntrance(28, SPRING.ORGANIC);
  const rowIn1 = useEntrance(40, SPRING.ORGANIC);
  const rowIn2 = useEntrance(52, SPRING.ORGANIC);
  const rowIn3 = useEntrance(64, SPRING.ORGANIC);
  const rowIn4 = useEntrance(76, SPRING.ORGANIC);
  const rowEntrances = [rowIn0, rowIn1, rowIn2, rowIn3, rowIn4];

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
          Prontuário
        </EyebrowLabel>

        {/* Card */}
        <UICard
          width={720}
          style={{
            opacity: interpolate(cardIn, [0, 1], [0, 1]),
            transform: `translateY(${springY(cardIn, 40)}px) scale(${springScale(cardIn, 0.96)})`,
          }}
        >
          {/* Card header */}
          <div style={{
            padding: "22px 32px 18px",
            borderBottom: `1px solid ${T.border}`,
          }}>
            <div style={{
              fontFamily: T.fontSans, fontSize: 16, fontWeight: 600, color: T.text1, marginBottom: 4,
            }}>
              Mariana Costa Ferreira
            </div>
            <div style={{ fontFamily: T.fontSans, fontSize: 13, color: T.text3 }}>
              Histórico de sessões
            </div>
          </div>

          {/* Timeline */}
          <div style={{ padding: "20px 32px 24px", position: "relative" }}>

            {/* Vertical line */}
            <div style={{
              position: "absolute",
              left: 47,
              top: 30,
              width: 1.5,
              height: lineHeight,
              background: T.borderMed,
            }} />

            {/* Session rows */}
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {SESSIONS.map((session, i) => {
                const rowIn = rowEntrances[i];
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 20,
                      padding: "10px 0",
                      opacity: interpolate(rowIn, [0, 1], [0, 1]),
                      transform: `translateX(${interpolate(rowIn, [0, 1], [-14, 0])}px)`,
                    }}
                  >
                    {/* Dot */}
                    <div style={{
                      width: 12, height: 12, borderRadius: "50%", flexShrink: 0,
                      marginLeft: 9.5,
                      background: session.highlight ? T.accent : T.borderMed,
                      border: `2px solid ${session.highlight ? T.accent : T.border}`,
                      boxShadow: session.highlight ? `0 0 0 3px ${T.accentLight}` : "none",
                      zIndex: 1,
                    }} />

                    {/* Label */}
                    <span style={{
                      width: 68, fontSize: 12, color: T.text4,
                      fontFamily: T.fontSans, fontWeight: 500, flexShrink: 0,
                    }}>
                      {session.label}
                    </span>

                    {/* Description */}
                    <span style={{
                      fontSize: session.highlight ? 15 : 14,
                      fontWeight: session.highlight ? 600 : 400,
                      color: session.highlight ? T.text1 : T.text2,
                      fontFamily: session.highlight ? T.fontSerif : T.fontSans,
                    }}>
                      {session.desc}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Confidentiality badge */}
            <div style={{
              marginTop: 16,
              paddingTop: 16,
              borderTop: `1px solid ${T.border}`,
              display: "flex",
              justifyContent: "flex-end",
              opacity: interpolate(badgeIn, [0, 1], [0, 1]),
              transform: `translateY(${springY(badgeIn, 10)}px)`,
            }}>
              <Badge variant="confidential">Prontuário confidencial</Badge>
            </div>
          </div>
        </UICard>

      </AbsoluteFill>
    </AbsoluteFill>
  );
};
