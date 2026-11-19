import React from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from "remotion";
import { BottomFrame, Particles } from "./components/Brand";
import { Header } from "./scenes/Header";
import { Card } from "./scenes/Tips";
import { C } from "./theme";

/**
 * OLARA — Astuces CUISINE (25 s, 1080×1920, 60 i/s).
 * 0–3 s intro · 3–11 s frites · 11–12 s transition · 12–20 s plat trop salé · 20–25 s signature.
 */
export const OlaraAstuces: React.FC = () => {
  const frame = useCurrentFrame();
  // caméra : très légère poussée continue, jamais de va-et-vient
  const cam = 1 + (frame / 1500) * 0.03;
  return (
    <AbsoluteFill style={{ background: C.white }}>
      <AbsoluteFill style={{ transform: `scale(${cam})`, transformOrigin: "50% 40%" }}>
        <BottomFrame />
        <Particles />
        <Header />
        <Card />
      </AbsoluteFill>
      <Audio src={staticFile("music.wav")} />
    </AbsoluteFill>
  );
};
