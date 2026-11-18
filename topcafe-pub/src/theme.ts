import { loadFont } from "@remotion/fonts";
import { Easing, interpolate, staticFile } from "remotion";

export const WIDTH = 1920;
export const HEIGHT = 1080;
export const FPS = 30;
export const TOTAL_FRAMES = 25 * FPS; // 750

/** Découpage temporel (en images). Les scènes se chevauchent pour des fondus doux. */
export const TIMING = {
  intro: { from: 0, dur: 135 }, //   0 – 4,5 s
  product: { from: 110, dur: 180 }, // 3,7 – 9,7 s
  taste: { from: 265, dur: 195 }, //  8,8 – 15,3 s
  signature: { from: 440, dur: 200 }, // 14,7 – 21,3 s
  packshot: { from: 620, dur: 130 }, // 20,7 – 25 s
  overlap: 25,
};

export const COLORS = {
  espresso: "#140b06",
  chocolate: "#3a2113",
  caramel: "#9a6236",
  cream: "#f6ead6",
  gold: "#d9a86c",
  goldLight: "#f0cf9c",
  blue: "#1d4fb8",
  blueDeep: "#0a2463",
};

export const SERIF = "Playfair Display";
export const SANS = "Montserrat";

const fonts: [string, string, string, string][] = [
  [SERIF, "playfair-display-latin-400-italic.woff2", "400", "italic"],
  [SERIF, "playfair-display-latin-700-italic.woff2", "700", "italic"],
  [SERIF, "playfair-display-latin-900-italic.woff2", "900", "italic"],
  [SERIF, "playfair-display-latin-700-normal.woff2", "700", "normal"],
  [SANS, "montserrat-latin-300-normal.woff2", "300", "normal"],
  [SANS, "montserrat-latin-500-normal.woff2", "500", "normal"],
  [SANS, "montserrat-latin-600-normal.woff2", "600", "normal"],
];
for (const [family, file, weight, style] of fonts) {
  loadFont({ family, url: staticFile(`fonts/${file}`), weight, style });
}

/** Courbes d'animation « studio » : départs et arrivées très doux. */
export const EASE = {
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  out: Easing.bezier(0.16, 1, 0.3, 1),
  in: Easing.bezier(0.55, 0, 1, 0.45),
  soft: Easing.bezier(0.45, 0, 0.55, 1),
};

/** interpolate() borné, avec une courbe d'easing. */
export const anim = (
  frame: number,
  [a, b]: [number, number],
  [from, to]: [number, number],
  easing = EASE.inOut,
) =>
  interpolate(frame, [a, b], [from, to], {
    easing,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
