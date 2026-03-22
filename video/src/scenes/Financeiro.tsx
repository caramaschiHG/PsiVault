/**
 * Financeiro — 22.5s to 26s
 * Recibo gerado, cobrança registrada, tudo em ordem.
 * Narrativa: praticidade financeira, sem complicação.
 *
 * Layout: card entra por SCALE puro + confirmação "Pago" proeminente.
 * Glow: esquerda para variar.
 */
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { T } from "../tokens";
import { useSceneFade, useEntrance, springY, springScale, SPRING } from "../utils/timing";
import { UICard } from "../primitives/UICard";
import { EyebrowLabel } from "../primitives/EyebrowLabel";
import { Vignette } from "../primitives/Vignette";

type SceneProps = { duration: number };

// Large check icon for payment confirmation
const CheckCircle: React.FC<{ size?: number; progress: number }> = ({ size = 56, progress }) => {
  const strokeDash = 2 * Math.PI * 20;
  const strokeOffset = strokeDash * (1 - progress);
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <circle
        cx="24" cy="24" r="20"
        stroke={T.paidText}
        strokeWidth="2"
        strokeOpacity={progress}
        fill="rgba(34,197,94,0.08)"
      />
      <circle
        cx="24" cy="24" r="20"
        stroke={T.paidText}
        strokeWidth="2.5"
        strokeDasharray={strokeDash}
        strokeDashoffset={strokeOffset}
        strokeLinecap="round"
        fill="none"
        style={{ transform: "rotate(-90deg)", transformOrigin: "24px 24px" }}
      />
      <path
        d="M15 24l6 6 12-12"
        stroke={T.paidText}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity={Math.min(1, progress * 2)}
      />
    </svg>
  );
};

export const Financeiro: React.FC<SceneProps> = ({ duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sceneOpacity = useSceneFade(duration);

  const eyebrowIn = useEntrance(8,  SPRING.ORGANIC);
  const cardIn    = useEntrance(16, SPRING.FLOAT);
  const row1In    = useEntrance(30, SPRING.ORGANIC);
  const row2In    = useEntrance(42, SPRING.ORGANIC);
  const row3In    = useEntrance(54, SPRING.ORGANIC);

  // Check circle draws in after rows
  const checkProgress = interpolate(frame, [62, 90], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const confirmIn = useEntrance(62, SPRING.CRISP);

  return (
    <AbsoluteFill style={{ background: T.bg, opacity: sceneOpacity }}>

      {/* Glow — lado esquerdo */}
      <div style={{
        position: "absolute",
        width: 1100, height: 1100,
        left: "-10%", top: "50%",
        transform: "translate(0, -50%)",
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
          Cobranças
        </EyebrowLabel>

        {/* Receipt card — entrada por SCALE */}
        <UICard
          width={560}
          style={{
            opacity: interpolate(cardIn, [0, 1], [0, 1]),
            transform: `scale(${interpolate(cardIn, [0, 1], [0.88, 1])})`,
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

          {/* Detail rows */}
          <div style={{ padding: "18px 32px" }}>
            {[
              { label: "Sessão",      value: "Nº 14 — 21/03/2026",      in: row1In, bold: false },
              { label: "Modalidade",  value: "Psicoterapia individual",  in: row2In, bold: false },
              { label: "Valor",       value: "R$ 280,00",                in: row3In, bold: true  },
            ].map((row) => (
              <div
                key={row.label}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 0",
                  borderBottom: `1px solid ${T.border}`,
                  opacity: interpolate(row.in, [0, 1], [0, 1]),
                  transform: `translateX(${interpolate(row.in, [0, 1], [-10, 0])}px)`,
                }}
              >
                <span style={{ fontFamily: T.fontSans, fontSize: 13, color: T.text3, fontWeight: 400 }}>
                  {row.label}
                </span>
                <span style={{
                  fontFamily: T.fontSans,
                  fontSize: row.bold ? 22 : 14,
                  color: row.bold ? T.text1 : T.text2,
                  fontWeight: row.bold ? 700 : 400,
                }}>
                  {row.value}
                </span>
              </div>
            ))}

            {/* Payment confirmation — check + large "Pago" */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 16,
              marginTop: 22,
              padding: "18px 0 6px",
              opacity: interpolate(confirmIn, [0, 1], [0, 1]),
              transform: `scale(${springScale(confirmIn, 0.80)})`,
            }}>
              <CheckCircle size={52} progress={checkProgress} />
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{
                  fontFamily: T.fontSerif,
                  fontSize: 32,
                  fontWeight: 600,
                  color: T.paidText,
                  lineHeight: 1,
                }}>
                  Pago
                </span>
                <span style={{
                  fontFamily: T.fontSans,
                  fontSize: 12,
                  color: T.text4,
                  letterSpacing: "0.06em",
                }}>
                  21 mar 2026
                </span>
              </div>
            </div>
          </div>
        </UICard>

      </AbsoluteFill>
    </AbsoluteFill>
  );
};
