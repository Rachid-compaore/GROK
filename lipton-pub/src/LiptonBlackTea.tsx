import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { FlavorScene } from "./scenes/FlavorScene";
import { Finale } from "./scenes/Finale";
import { Intro } from "./scenes/Intro";
import { TeaWorld } from "./scenes/TeaWorld";
import { FLAVORS, SCENES, sec } from "./theme";

const seq = (k: keyof typeof SCENES) => ({ from: sec(SCENES[k].from), durationInFrames: sec(SCENES[k].to - SCENES[k].from) });

/** LIPTON BLACK TEA — publicité 30 s, 1920×1080, 60 i/s. */
export const LiptonBlackTea: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Sequence {...seq("intro")} name="1 · Intro"><Intro /></Sequence>
    <Sequence {...seq("tea")} name="2 · Thé noir"><TeaWorld /></Sequence>
    <Sequence {...seq("blackcurrant")} name="3 · Blackcurrant"><FlavorScene flavor={FLAVORS.blackcurrant} /></Sequence>
    <Sequence {...seq("strawberry")} name="4 · Strawberry"><FlavorScene flavor={FLAVORS.strawberry} mirror /></Sequence>
    <Sequence {...seq("lemon")} name="5 · Lemon"><FlavorScene flavor={FLAVORS.lemon} /></Sequence>
    <Sequence {...seq("forest")} name="6 · Forest Fruits"><FlavorScene flavor={FLAVORS.forest} mirror /></Sequence>
    <Sequence {...seq("finale")} name="7 · Final"><Finale /></Sequence>
    <AbsoluteFill style={{ pointerEvents: "none", background: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.28) 100%)" }} />
    <Audio src={staticFile("music.wav")} />
  </AbsoluteFill>
);
