import { loadFont } from "@remotion/fonts";
import { Easing, interpolate, spring, staticFile } from "remotion";

/** Format vertical TikTok / Reels / Shorts, 60 i/s, 25 s. */
export const W = 1080;
export const H = 1920;
export const FPS = 60;
export const TOTAL = 25 * FPS;

/** secondes → images */
export const s = (sec: number) => Math.round(sec * FPS);

/** Minutage (en secondes), calé sur la musique à 120 BPM (1 temps = 0,5 s). */
export const T = {
  introShapes: 0.0,
  logo: 0.4,
  astuces: 0.8,
  cuisine: 1.1,
  bulb: 1.5,
  headerUp: 2.4,
  card: 2.6,
  // astuce 1 — frites
  frites: 3.0,
  fritesTitle: 3.35,
  fritesImg: 4.0,
  highlight: 4.6,
  crunch: [4.9, 7.0, 9.1],
  fritesCheck: 5.6,
  fritesBody: 6.0,
  // transition
  wipe: 11.0,
  swap: 11.5,
  // astuce 2 — sel
  selTitle: 12.1,
  selImg: 12.6,
  shake: [13.2, 16.0, 18.4],
  selCheck: 13.8,
  selBody: 14.0,
  // signature
  outro: 20.0,
  outroTitle: 20.9,
  end: 25.0,
};

/** Couleurs mesurées sur les visuels OLARA. */
export const C = {
  green: "#006b31",
  greenDark: "#0f522f",
  yellow: "#ffd403",
  white: "#ffffff",
  ink: "#1f2a22",
};

export const F = {
  display: "Krona One", // titres larges des astuces
  heavy: "Unbounded", // CUISINE
  hand: "Grandstander", // Astuces
  body: "Roboto Condensed", // texte des astuces
};

const fonts: [string, string, string][] = [
  [F.display, "krona-one-latin-400-normal.woff2", "400"],
  [F.heavy, "unbounded-latin-900-normal.woff2", "900"],
  [F.hand, "grandstander-latin-700-normal.woff2", "700"],
  [F.body, "roboto-condensed-latin-400-normal.woff2", "400"],
  [F.body, "roboto-condensed-latin-700-normal.woff2", "700"],
];
for (const [family, file, weight] of fonts) loadFont({ family, url: staticFile(`fonts/${file}`), weight });

export const EASE = {
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  out: Easing.bezier(0.16, 1, 0.3, 1),
  in: Easing.bezier(0.55, 0, 1, 0.45),
};

/** interpolation bornée avec easing, en secondes */
export const tween = (frame: number, a: number, b: number, from: number, to: number, easing = EASE.inOut) =>
  interpolate(frame, [s(a), s(b)], [from, to], { easing, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

/** ressort qui démarre à `at` secondes */
export const pop = (frame: number, at: number, damping = 14, mass = 0.8, stiffness = 120) =>
  spring({ frame: frame - s(at), fps: FPS, config: { damping, mass, stiffness } });
