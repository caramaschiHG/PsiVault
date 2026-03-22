// Load IBM Plex fonts — blocks rendering until ready
// Package names follow @remotion/google-fonts naming convention (camelCase)
import { loadFont as loadSerif } from "@remotion/google-fonts/IBMPlexSerif";
import { loadFont as loadSans } from "@remotion/google-fonts/IBMPlexSans";

const serifResult = loadSerif("normal", {
  weights: ["400", "500", "600"],
  subsets: ["latin"],
});

const sansResult = loadSans("normal", {
  weights: ["400", "500", "600", "700"],
  subsets: ["latin"],
});

export const fontSerif = serifResult.fontFamily;
export const fontSans = sansResult.fontFamily;
