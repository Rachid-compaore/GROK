import { loadFont } from "@remotion/fonts";
import { Easing, interpolate, spring, staticFile } from "remotion";

export const W = 1920;
export const H = 1080;
export const FPS = 60;
export const TOTAL = 25 * FPS;
export const sec = (s: number) => Math.round(s * FPS);

/** Scènes (secondes). Elles se chevauchent : la suivante se révèle par-dessus. */
export const SCENES = {
  intro: { from: 0, to: 4.4 },
  immersion: { from: 3.7, to: 8.4 },
  reveal: { from: 7.7, to: 14.3 },
  experience: { from: 13.6, to: 19.3 },
  final: { from: 18.6, to: 25 },
};

/** Couleurs mesurées sur le visuel Kouma. */
export const C = {
  red: "#fe0104",
  redDeep: "#b0000a",
  green: "#1f7a1a",
  greenDeep: "#0d4a12",
  leaf: "#3f9b2b",
  gold: "#f6c445",
  goldDeep: "#c98a12",
  amber: "#a0400c",
  cream: "#fff6e2",
};

export const FONT = { sans: "Montserrat", serif: "Playfair Display", cond: "Roboto Condensed" };
const fonts: [string, string, string, string][] = [
  [FONT.sans, "montserrat-latin-600-normal.woff2", "600", "normal"],
  [FONT.sans, "montserrat-latin-800-normal.woff2", "800", "normal"],
  [FONT.sans, "montserrat-latin-900-normal.woff2", "900", "normal"],
  [FONT.serif, "playfair-display-latin-400-italic.woff2", "400", "italic"],
  [FONT.serif, "playfair-display-latin-600-italic.woff2", "600", "italic"],
  [FONT.cond, "roboto-condensed-latin-700-normal.woff2", "700", "normal"],
  [FONT.cond, "roboto-condensed-latin-800-normal.woff2", "800", "normal"],
];
for (const [family, file, weight, style] of fonts) loadFont({ family, url: staticFile(`fonts/${file}`), weight, style });

export const EASE = {
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  out: Easing.bezier(0.16, 1, 0.3, 1),
  in: Easing.bezier(0.55, 0, 1, 0.45),
  soft: Easing.bezier(0.45, 0, 0.55, 1),
};
export const tw = (frame: number, a: number, b: number, from: number, to: number, easing = EASE.inOut) =>
  interpolate(frame, [sec(a), sec(b)], [from, to], { easing, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
export const spr = (frame: number, at: number, damping = 15, mass = 0.9, stiffness = 100) =>
  spring({ frame: frame - sec(at), fps: FPS, config: { damping, mass, stiffness } });
