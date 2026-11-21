import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { FoamCover, MilkWave } from "./components/Liquids";
import { Final, Opening, ProductScene } from "./scenes/Scenes";
import { SCENES, sec } from "./theme";

const seq = (k: keyof typeof SCENES) => ({ from: sec(SCENES[k].from), durationInFrames: sec(SCENES[k].to - SCENES[k].from) });

/**
 * TOPCAFÉ — « CRÉMEUX ET DÉLICIEUX » (30 s).
 * Une seule timeline pour les deux formats : chaque scène adapte sa mise en page (16:9 ou 9:16).
 */
export const TopcafeCremeux: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Sequence {...seq("opening")} name="01 · Ouverture"><Opening /></Sequence>
    <Sequence {...seq("threeInOne")} name="02 · 3 IN 1">
      <ProductScene cfg={{ product: "threeInOne", world: "blue", entryAt: 0.2, entry: "rise", camera: "dolly", nameAt: 1.9, sloganAt: 2.9, extras: "splash" }} />
    </Sequence>
    <Sequence {...seq("cappuccino")} name="03 · Cappuccino">
      <ProductScene cfg={{ product: "cappuccino", world: "orange", entryAt: 0.35, entry: "slam", camera: "travel", nameAt: 2.1, sloganAt: 3.25, extras: "cocoa" }} />
    </Sequence>
    <Sequence {...seq("latte")} name="04 · Café Latte">
      <ProductScene cfg={{ product: "latte", world: "cream", entryAt: 0.45, entry: "orbit", camera: "orbit", nameAt: 2.3, sloganAt: 3.4, extras: "caramel" }} />
    </Sequence>
    <Sequence {...seq("final")} name="05 · Packshot"><Final /></Sequence>
    {/* transitions liquides entre les scènes */}
    <MilkWave at={3.65} dur={0.95} />
    <FoamCover at={9.8} dur={0.9} />
    <Audio src={staticFile("music.wav")} />
  </AbsoluteFill>
);
