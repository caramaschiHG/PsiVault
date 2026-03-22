import React from "react";
import { AbsoluteFill, Sequence } from "remotion";
import { T } from "./tokens";
import { Opening } from "./scenes/Opening";
import { Centering } from "./scenes/Centering";
import { Agenda } from "./scenes/Agenda";
import { Patient } from "./scenes/Patient";
import { ClinicalTimeline } from "./scenes/ClinicalTimeline";
import { Financeiro } from "./scenes/Financeiro";
import { Closing } from "./scenes/Closing";

// ─── Scene boundaries ─────────────────────────────────────────
// All scenes overlap by 15 frames (0.5s) for smooth cross-fades.
// Each scene handles its own fade-in / fade-out via useSceneFade().
// ─────────────────────────────────────────────────────────────
// Opening:    0    → 135   (4.5s)
// Centering:  120  → 300   (6.0s)  [15fr overlap with Opening]
// Agenda:     285  → 435   (5.0s)  [15fr overlap with Centering]
// Patient:    420  → 570   (5.0s)  [15fr overlap with Agenda]
// Timeline:   555  → 690   (4.5s)  [15fr overlap with Patient]
// Financeiro: 675  → 780   (3.5s)  [15fr overlap with Timeline]
// Closing:    765  → 900   (4.5s)  [15fr overlap with Financeiro]
// ─────────────────────────────────────────────────────────────
// Total composition: 900 frames = 30s @ 30fps ✓

const SCENES = {
  opening:    { from: 0,   dur: 135 },
  centering:  { from: 120, dur: 180 },
  agenda:     { from: 285, dur: 150 },
  patient:    { from: 420, dur: 150 },
  timeline:   { from: 555, dur: 135 },
  financeiro: { from: 675, dur: 105 },
  closing:    { from: 765, dur: 135 },
} as const;

export const PsiVaultVideo: React.FC = () => (
  <AbsoluteFill style={{ background: T.bg }}>

    <Sequence from={SCENES.opening.from} durationInFrames={SCENES.opening.dur} premountFor={30}>
      <Opening duration={SCENES.opening.dur} />
    </Sequence>

    <Sequence from={SCENES.centering.from} durationInFrames={SCENES.centering.dur} premountFor={30}>
      <Centering duration={SCENES.centering.dur} />
    </Sequence>

    <Sequence from={SCENES.agenda.from} durationInFrames={SCENES.agenda.dur} premountFor={30}>
      <Agenda duration={SCENES.agenda.dur} />
    </Sequence>

    <Sequence from={SCENES.patient.from} durationInFrames={SCENES.patient.dur} premountFor={30}>
      <Patient duration={SCENES.patient.dur} />
    </Sequence>

    <Sequence from={SCENES.timeline.from} durationInFrames={SCENES.timeline.dur} premountFor={30}>
      <ClinicalTimeline duration={SCENES.timeline.dur} />
    </Sequence>

    <Sequence from={SCENES.financeiro.from} durationInFrames={SCENES.financeiro.dur} premountFor={30}>
      <Financeiro duration={SCENES.financeiro.dur} />
    </Sequence>

    <Sequence from={SCENES.closing.from} durationInFrames={SCENES.closing.dur} premountFor={30}>
      <Closing duration={SCENES.closing.dur} />
    </Sequence>

  </AbsoluteFill>
);
