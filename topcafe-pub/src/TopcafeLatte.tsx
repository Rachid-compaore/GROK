import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { FilmFinish } from "./components/Effects";
import { Scene1Intro } from "./scenes/Scene1Intro";
import { Scene2Product } from "./scenes/Scene2Product";
import { Scene3Taste } from "./scenes/Scene3Taste";
import { Scene4Signature } from "./scenes/Scene4Signature";
import { Scene5Packshot } from "./scenes/Scene5Packshot";
import { COLORS, TIMING } from "./theme";

/** Publicité TOPCAFÉ Café Latte — 25 s, 1920×1080, 30 i/s. */
export const TopcafeLatte: React.FC = () => (
  <AbsoluteFill style={{ background: COLORS.espresso }}>
    <Sequence from={TIMING.intro.from} durationInFrames={TIMING.intro.dur} name="1 · Introduction">
      <Scene1Intro />
    </Sequence>
    <Sequence from={TIMING.product.from} durationInFrames={TIMING.product.dur} name="2 · Produit">
      <Scene2Product />
    </Sequence>
    <Sequence from={TIMING.taste.from} durationInFrames={TIMING.taste.dur} name="3 · Expérience gourmande">
      <Scene3Taste />
    </Sequence>
    <Sequence from={TIMING.signature.from} durationInFrames={TIMING.signature.dur} name="4 · Signature">
      <Scene4Signature />
    </Sequence>
    <Sequence from={TIMING.packshot.from} durationInFrames={TIMING.packshot.dur} name="5 · Packshot">
      <Scene5Packshot />
    </Sequence>
    <FilmFinish />
    <Audio src={staticFile("music.wav")} />
  </AbsoluteFill>
);
