// Brand tokens — source of truth: PsiLock/src/app/globals.css
import { fontSerif, fontSans } from "./fonts";

export const T = {
  // ─── Colors ───────────────────────────────────────────────
  bg:           "#f7f3ed",        // --color-bg: warm off-white
  surface0:     "#ffffff",
  surface1:     "#fffcf7",
  bgDark:       "#1a1410",        // auth dark panel

  border:       "rgba(146, 64, 14, 0.12)",
  borderMed:    "rgba(146, 64, 14, 0.20)",

  text1:        "#1c1917",        // near-black charcoal
  text2:        "#57534e",        // warm medium gray
  text3:        "#57534e",
  text4:        "#a8a29e",        // lighter warm gray

  accent:       "#9a3412",        // terracotta brick red
  accentStrong: "#7c2910",
  accentLight:  "rgba(154, 52, 18, 0.08)",
  brownMid:     "#b45309",        // amber

  paidBg:       "rgba(34, 197, 94, 0.10)",
  paidText:     "#166534",
  pendingBg:    "rgba(245, 158, 11, 0.10)",
  pendingText:  "#92400e",

  // ─── Radii (px) ───────────────────────────────────────────
  rSm:   8,
  rMd:   14,
  rLg:   20,
  rXl:   28,
  rPill: 999,

  // ─── Shadows ──────────────────────────────────────────────
  shadowSm:   "0 1px 3px rgba(0,0,0,0.06)",
  shadowMd:   "0 4px 16px rgba(120, 53, 15, 0.10)",
  shadowLg:   "0 20px 56px rgba(120, 53, 15, 0.18), 0 4px 14px rgba(120, 53, 15, 0.08)",
  shadowAuth: "0 32px 100px rgba(120, 53, 15, 0.20)",
  // Extra-deep shadow for video cards — compensates for playback compression
  shadowVideo: "0 28px 72px rgba(120, 53, 15, 0.22), 0 6px 18px rgba(120, 53, 15, 0.10), 0 1px 4px rgba(120, 53, 15, 0.06)",

  // ─── Typography ───────────────────────────────────────────
  fontSerif,
  fontSans,
} as const;
