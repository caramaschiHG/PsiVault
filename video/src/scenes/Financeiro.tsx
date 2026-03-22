/**
 * Financeiro — 18s to 20.5s
 * Recibo gerado, cobrança registrada, tudo em ordem.
 * Narrativa: praticidade financeira, sem complicação.
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

export const Financeiro: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sceneOpacity = useSceneFade(duration);

  const eyebrowIn = useEntrance(8,  SPRING.ORGANIC);
  const cardIn    = useEntrance(16, SPRING.FLOAT);
  const row1In    = useEntrance(28, SPRING.ORGANIC);
  const row2In    = useEntrance(38, SPRING.ORGANIC);
  const row3In    = useEntrance(48, SPRING.ORGANIC);
  const badgeIn   = useEntrance(56, SPRING.CRISP);

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
          Cobranças
        </EyebrowLabel>

        {/* Receipt card */}
        <UICard
          width={540}
          style={{
            opacity: interpolate(cardIn, [0, 1], [0, 1]),
            transform: `translateY(${springY(cardIn, 40)}px) scale(${springScale(cardIn, 0.96)})`,
          }}
        >
          {/* Header */}
          <div style={{
            padding: "22px 32px 18px",
            borderBottom: `1px solid ${T.border}`,
          }}>
            <div style={{ fontFamily: T.fontSans, fontSize: 16, fontWeight: 600, color: T.text1 }}>
              Recibo de sessão
            </div>
            <div style={{ fontFamily: T.fontSans, fontSize: 13, color: T.text3, marginTop: 4 }}>
              Mariana Costa Ferreira
            </div>
          </div>

          {/* Details */}
          <div style={{ padding: "18px 32px" }}>
            {[
              { label: "Sessão", value: "Nº 14 — 21/03/2026", in: row1In },
              { label: "Modalidade", value: "Psicoterapia individual", in: row2In },
              { label: "Valor", value: "R$ 280,00", in: row3In, bold: true },
            ].map((row) => (
              <div
                key={row.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 0",
                  borderBottom: `1px solid ${T.border}`,
                  opacity: interpolate(row.in, [0, 1], [0, 1]),
                  transform: `translateX(${interpolate(row.in, [0, 1], [-10, 0])}px)`,
                }}
              >
                <span style={{
                  fontFamily: T.fontSans, fontSize: 13,
                  color: T.text3, fontWeight: 400,
                }}>
                  {row.label}
                </span>
                <span style={{
                  fontFamily: T.fontSans, fontSize: row.bold ? 20 : 14,
                  color: row.bold ? T.text1 : T.text2,
                  fontWeight: row.bold ? 600 : 400,
                }}>
                  {row.value}
                </span>
              </div>
            ))}

            {/* Paid badge */}
            <div style={{
              display: "flex",
              justifyContent: "flex-end",
              marginTop: 18,
              opacity: interpolate(badgeIn, [0, 1], [0, 1]),
              transform: `scale(${interpolate(badgeIn, [0, 1], [0.88, 1])})`,
              transformOrigin: "right center",
            }}>
              <Badge variant="paid">Pago</Badge>
            </div>
          </div>
        </UICard>

      </AbsoluteFill>
    </AbsoluteFill>
  );
};
