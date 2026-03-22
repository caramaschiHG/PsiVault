import React from "react";
import { Composition } from "remotion";
import { PsiVaultVideo } from "./PsiVaultVideo";

// 30 seconds @ 30fps = 900 frames
const FPS = 30;
const DURATION_SECS = 30;

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
