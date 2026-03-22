import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

/** Frames for fade in / fade out at scene edges */
export const FADE = 18;

/**
 * Spring configs — matching premium SaaS motion style.
 * ORGANIC: slight natural energy, no bounce. Best for most UI elements.
 * CRISP:   tighter spring for scale/icon reveals.
 * FLOAT:   very gentle, for hover-like entrance.
 */
export const SPRING = {
  ORGANIC: { damping: 14, stiffness: 80, mass: 0.7 },
  CRISP:   { damping: 18, stiffness: 120, mass: 0.5 },
  FLOAT:   { damping: 12, stiffness: 60,  mass: 0.8 },
} as const;

/** Linear fade-in and fade-out scoped to a scene's local frame */
export function useSceneFade(duration: number): number {
  const frame = useCurrentFrame();
  return interpolate(
    frame,
    [0, FADE, duration - FADE, duration],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
}

/** Organic spring from 0→1 with optional delay (in frames).
 *  Uses SPRING.ORGANIC by default — natural feel, no harsh snap. */
export function useEntrance(
  delay = 0,
  config: { damping?: number; stiffness?: number; mass?: number } = SPRING.ORGANIC
): number {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config });
}

/** Gentle sin oscillation — pure, frame-driven */
export function float(
  frame: number,
  amplitude: number,
  phase = 0,
  speed = 0.04
): number {
  return Math.sin(frame * speed + phase) * amplitude;
}

/** Map a spring value (0→1) to a y translation */
export function springY(progress: number, fromY: number, toY = 0): number {
  return interpolate(progress, [0, 1], [fromY, toY]);
}

/** Map a spring value (0→1) to a scale */
export function springScale(progress: number, fromScale = 0.94, toScale = 1): number {
  return interpolate(progress, [0, 1], [fromScale, toScale]);
}
