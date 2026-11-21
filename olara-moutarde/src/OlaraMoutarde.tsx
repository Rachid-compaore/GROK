import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { FilmFinish } from "./components/Matter";
import { GastroAct } from "./scenes/Gastro";
import { MatterAct } from "./scenes/Matter";
import { RevealAct } from "./scenes/Reveal";
import { sec, T } from "./theme";

const seq = (k: "silence" | "impact" | "gastro" | "reveal", from: number, to: number) => ({ from: sec(from), durationInFrames: sec(to - from), name: k });

/**
 * OLARA — Moutarde de Dijon. « LE GOÛT QUI RÉVEILLE » (30 s).
 * Acte 1 : matière (silence, goutte, impact, vague) — Acte 2 : gastronomie — Acte 3 : reveal + signature.
 * L'acte 1 est posé AU-DESSUS de l'acte 2 : quand la matière s'affine en filet, elle découvre l'assiette.
 */
export const OlaraMoutarde: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Sequence {...seq("gastro", T.gastro.from, T.gastro.to)}><GastroAct /></Sequence>
    <Sequence {...seq("silence", 0, 9.4)}><MatterAct /></Sequence>
    <Sequence {...seq("reveal", T.reveal.from, T.reveal.to)}><RevealAct /></Sequence>
    <FilmFinish />
    <Audio src={staticFile("music.wav")} />
  </AbsoluteFill>
);
