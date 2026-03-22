import React from "react";
import { Composition } from "remotion";
import { PsiVaultVideo } from "./PsiVaultVideo";

// 25 seconds @ 30fps = 750 frames
const FPS = 30;
const DURATION_SECS = 25;

export const Root: React.FC = () => (
  <Composition
    id="PsiVaultVideo"
    component={PsiVaultVideo}
    durationInFrames={DURATION_SECS * FPS}
    fps={FPS}
    width={1920}
    height={1080}
  />
);
