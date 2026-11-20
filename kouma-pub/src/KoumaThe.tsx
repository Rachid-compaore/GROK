import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { LeafSweep } from "./components/Effects";
import { Experience, Final, Immersion, Intro, Reveal } from "./scenes/Scenes";
import { SCENES, sec } from "./theme";

const seq = (k: keyof typeof SCENES) => ({ from: sec(SCENES[k].from), durationInFrames: sec(SCENES[k].to - SCENES[k].from) });

/** Kouma — Thé Vert de Chine : publicité 25 s, 1920×1080, 60 i/s. */
export const KoumaThe: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Sequence {...seq("intro")} name="1 · Intro plantations"><Intro /></Sequence>
    <Sequence {...seq("immersion")} name="2 · Immersion feuilles"><Immersion /></Sequence>
    <Sequence {...seq("reveal")} name="3 · Reveal produit"><Reveal /></Sequence>
    <Sequence {...seq("experience")} name="4 · Expérience"><Experience /></Sequence>
    <Sequence {...seq("final")} name="5 · Final"><Final /></Sequence>
    {/* transitions par vagues de feuilles */}
    <LeafSweep at={3.45} dur={1.15} dir={-1} />
    <LeafSweep at={7.4} dur={1.15} dir={1} />
    <Audio src={staticFile("music.wav")} />
  </AbsoluteFill>
);
