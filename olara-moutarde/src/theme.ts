import { loadFont } from "@remotion/fonts";
import { Easing, interpolate, spring, staticFile, useVideoConfig } from "remotion";

export const FPS = 60;
export const TOTAL = 30 * FPS;
export const sec = (s: number) => Math.round(s * FPS);

/** Le slogan de signature — jamais modifié. */
export const SLOGAN = "CRÉMEUX ET DÉLICIEUX";

/** Timeline (secondes). Les scènes se chevauchent pendant leurs transitions. */
export const T = {
  silence: { from: 0, to: 4.6 },
  impact: { from: 3.9, to: 9.4 },     // chute à 4,0 ; impact à 4,45 ; vague ; passage à travers la matière à 6,9
  gastro: { from: 8.8, to: 16.8 },    // filet de sauce → assiette → ingrédients → plongée dans la cuillère
  reveal: { from: 16.0, to: 30 },     // projecteurs, orbite, puis signature à 24,8
  dropFall: 4.0,
  dropHit: 4.45,
  through: 6.9,
  lights: [16.6, 17.05, 17.5],
  signature: 24.8,
  underline: 25.7,
};

/** Palette : jaune moutarde, rouge couvercle, vert étiquette, noir, crème, or. */
export const C = {
  mustard: "#d9a514",
  mustardDeep: "#a86f05",
  mustardLight: "#f4cf4a",
  red: "#d9161c",
  green: "#0f6b2e",
  black: "#080605",
  cream: "#fbf3dc",
  gold: "#e9c46a",
};

/** Pots (dimensions des découpes : leurs proportions relatives sont celles de la photo). */
export const JARS = [
  { key: "pot-1kg", src: "products/pot-1kg.png", w: 700, h: 1338 },
  { key: "pot-850g", src: "products/pot-850g.png", w: 642, h: 1238 },
  { key: "pot-370g", src: "products/pot-370g.png", w: 516, h: 912 },
];

export const FONT = { display: "Bodoni Moda", sans: "Montserrat" };
const fonts: [string, string, string, string][] = [
  [FONT.display, "bodoni-moda-latin-700-normal.woff2", "700", "normal"],
  [FONT.display, "bodoni-moda-latin-900-normal.woff2", "900", "normal"],
  [FONT.display, "bodoni-moda-latin-500-italic.woff2", "500", "italic"],
  [FONT.sans, "montserrat-latin-500-normal.woff2", "500", "normal"],
  [FONT.sans, "montserrat-latin-600-normal.woff2", "600", "normal"],
];
for (const [family, file, weight, style] of fonts) loadFont({ family, url: staticFile(`fonts/${file}`), weight, style });

export const EASE = {
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  out: Easing.bezier(0.16, 1, 0.3, 1),
  in: Easing.bezier(0.55, 0, 1, 0.45),
  soft: Easing.bezier(0.45, 0, 0.55, 1),
  gravity: Easing.bezier(0.5, 0, 0.9, 0.6),
};
export const tw = (frame: number, a: number, b: number, from: number, to: number, easing = EASE.inOut) =>
  interpolate(frame, [sec(a), sec(b)], [from, to], { easing, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
export const spr = (frame: number, at: number, damping = 15, mass = 0.9, stiffness = 100) =>
  spring({ frame: frame - sec(at), fps: FPS, config: { damping, mass, stiffness } });

/** Mise en page selon le format (16:9 ou 9:16). */
export const useLayout = () => {
  const { width, height } = useVideoConfig();
  const portrait = height > width;
  return { W: width, H: height, portrait, pick: <X,>(landscape: X, vertical: X) => (portrait ? vertical : landscape) };
};
