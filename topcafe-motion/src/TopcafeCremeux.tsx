import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { CARAMEL, FOAM, MILK } from "./components/Liquids";
import { Final, Opening, ProductScene } from "./scenes/Scenes";
import { SCENES, sec } from "./theme";

const seq = (k: keyof typeof SCENES) => ({ from: sec(SCENES[k].from), durationInFrames: sec(SCENES[k].to - SCENES[k].from) });

/**
 * TOPCAFÉ — « CRÉMEUX ET DÉLICIEUX » (30 s).
 * Une seule timeline pour les deux formats : chaque scène adapte sa mise en page (16:9 ou 9:16).
 * Chaque scène entre par une transition liquide (lait, mousse, caramel, or) qui révèle directement la suivante.
 */
export const TopcafeCremeux: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Sequence {...seq("opening")} name="01 · Ouverture"><Opening /></Sequence>
    <Sequence {...seq("threeInOne")} name="02 · 3 IN 1">
      <ProductScene cfg={{ product: "threeInOne", world: "blue", wipe: { dir: "right", colors: MILK }, entry: "rise", entryAt: 0.45, nameAt: 2.0, sloganAt: 3.0, accent: "milk" }} />
    </Sequence>
    <Sequence {...seq("cappuccino")} name="03 · Cappuccino">
      <ProductScene cfg={{ product: "cappuccino", world: "orange", wipe: { dir: "up", colors: FOAM }, entry: "slam", entryAt: 0.55, nameAt: 2.0, sloganAt: 3.0, accent: "cocoa" }} />
    </Sequence>
    <Sequence {...seq("latte")} name="04 · Café Latte">
      <ProductScene cfg={{ product: "latte", world: "cream", wipe: { dir: "radial", colors: CARAMEL }, entry: "swing", entryAt: 0.55, nameAt: 2.0, sloganAt: 3.0, accent: "caramel" }} />
    </Sequence>
    <Sequence {...seq("final")} name="05 · Packshot"><Final /></Sequence>
    <Audio src={staticFile("music.wav")} />
  </AbsoluteFill>
);
