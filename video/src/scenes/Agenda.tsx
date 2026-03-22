/**
 * Agenda — 9s to 12.5s
 * A semana clínica organizada. Consultas confirmadas.
 * Narrativa: clareza na agenda, profissionalismo no atendimento.
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

const APPOINTMENTS = [
  { time: "09:00", name: "Mariana Costa F.",     status: "confirmed" as const, day: "Seg 17" },
  { time: "11:00", name: "Rafael Albuquerque",    status: "confirmed" as const, day: "Seg 17" },
  { time: "09:00", name: "Bianca Lemos",          status: "scheduled" as const, day: "Ter 18" },
  { time: "14:00", name: "Carlos E. Pinheiro",    status: "confirmed" as const, day: "Qua 19" },
];

// Calendar icon
const CalendarIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={T.text3} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="3" />
    <path d="M16 2v4M8 2v4M3 10h18" />
  </svg>
);

export const Agenda: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sceneOpacity = useSceneFade(duration);

  const eyebrowIn = useEntrance(8,  SPRING.ORGANIC);
  const cardIn    = useEntrance(18, SPRING.FLOAT);

  // Staggered row entrances — called at top level (hooks must not be in loops)
  const rowIn0 = useEntrance(38, SPRING.ORGANIC);
  const rowIn1 = useEntrance(50, SPRING.ORGANIC);
  const rowIn2 = useEntrance(62, SPRING.ORGANIC);
  const rowIn3 = useEntrance(74, SPRING.ORGANIC);
  const rowEntrances = [rowIn0, rowIn1, rowIn2, rowIn3];

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
          Agenda
        </EyebrowLabel>

        {/* Main card */}
        <UICard
          width={860}
          style={{
            opacity: interpolate(cardIn, [0, 1], [0, 1]),
            transform: `translateY(${springY(cardIn, 40)}px) scale(${springScale(cardIn, 0.96)})`,
          }}
        >
          {/* Card header */}
          <div style={{
            padding: "22px 32px 18px",
            borderBottom: `1px solid ${T.border}`,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}>
            <CalendarIcon />
            <span style={{ fontFamily: T.fontSans, fontSize: 16, fontWeight: 600, color: T.text1 }}>
              Semana — 17 a 21 de março de 2026
            </span>
          </div>

          {/* Appointment rows — entrance values computed outside map to respect hooks rules */}
          <div style={{ padding: "8px 0" }}>
            {APPOINTMENTS.map((appt, i) => {
              const rowEntrance = rowEntrances[i];
              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0,
                    padding: "14px 32px",
                    borderBottom: i < APPOINTMENTS.length - 1 ? `1px solid ${T.border}` : "none",
                    opacity: interpolate(rowEntrance, [0, 1], [0, 1]),
                    transform: `translateX(${interpolate(rowEntrance, [0, 1], [-16, 0])}px)`,
                  }}
                >
                  {/* Day */}
                  <span style={{
                    width: 56, fontSize: 13, fontWeight: 600, color: T.text4,
                    fontFamily: T.fontSans, flexShrink: 0,
                  }}>
                    {appt.day}
                  </span>
                  {/* Time */}
                  <span style={{
                    width: 54, fontSize: 15, fontWeight: 600, color: T.brownMid,
                    fontFamily: T.fontSans, flexShrink: 0,
                  }}>
                    {appt.time}
                  </span>
                  {/* Name */}
                  <span style={{
                    flex: 1, fontSize: 16, fontWeight: 500, color: T.text1,
                    fontFamily: T.fontSans,
                  }}>
                    {appt.name}
                  </span>
                  {/* Badge */}
                  <Badge variant={appt.status}>
                    {appt.status === "confirmed" ? "Confirmada" : "Agendada"}
                  </Badge>
                </div>
              );
            })}
          </div>
        </UICard>

      </AbsoluteFill>
    </AbsoluteFill>
  );
};
