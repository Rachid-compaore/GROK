import { loadFont } from "@remotion/fonts";
import { Easing, interpolate, spring, staticFile, useVideoConfig } from "remotion";

export const FPS = 60;
export const TOTAL = 30 * FPS;
export const sec = (s: number) => Math.round(s * FPS);

/** Le slogan officiel — jamais modifié. */
export const SLOGAN = "CRÉMEUX ET DÉLICIEUX";

/** Scènes (secondes). Chaque scène recouvre la précédente pendant sa transition. */
export const SCENES = {
  opening: { from: 0, to: 4.5 },
  threeInOne: { from: 3.7, to: 10.5 },
  cappuccino: { from: 9.7, to: 17.0 },
  latte: { from: 16.2, to: 23.5 },
  final: { from: 22.7, to: 30 },
};

export const PRODUCTS = {
  threeInOne: { src: "products/3in1.png", ratio: 1176 / 1274, name: "TOPCAFÉ 3 IN 1" },
  cappuccino: { src: "products/cappuccino.png", ratio: 1154 / 1264, name: "TOPCAFÉ CAPPUCCINO" },
  latte: { src: "products/latte.png", ratio: 1052 / 1324, name: "TOPCAFÉ CAFÉ LATTE" },
};

/** Univers colorés de chaque produit. */
export const WORLD = {
  blue: { bg: ["#2a56c9", "#0f2a78", "#040b26"], light: "rgba(120,170,255,0.45)", accent: "#f3c969" },
  orange: { bg: ["#ff9a3c", "#e0560f", "#3a1204"], light: "rgba(255,190,120,0.5)", accent: "#fff1d6" },
  cream: { bg: ["#fff4dc", "#e9c992", "#7a4a22"], light: "rgba(255,236,200,0.6)", accent: "#8a4a1c" },
};

export const GOLD = { light: "#fff1b8", mid: "#f3c969", deep: "#b9832a" };
export const FONT = { sans: "Montserrat", brand: "Cinzel" };
const fonts: [string, string, string][] = [
  [FONT.sans, "montserrat-latin-500-normal.woff2", "500"],
  [FONT.sans, "montserrat-latin-700-normal.woff2", "700"],
  [FONT.sans, "montserrat-latin-800-normal.woff2", "800"],
  [FONT.sans, "montserrat-latin-900-normal.woff2", "900"],
  [FONT.brand, "cinzel-latin-600-normal.woff2", "600"],
  [FONT.brand, "cinzel-latin-800-normal.woff2", "800"],
];
for (const [family, file, weight] of fonts) loadFont({ family, url: staticFile(`fonts/${file}`), weight });

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

/** Mise en page : chaque scène choisit ses positions selon le format (16:9 ou 9:16). */
export const useLayout = () => {
  const { width, height } = useVideoConfig();
  const portrait = height > width;
  return { W: width, H: height, portrait, pick: <T,>(landscape: T, vertical: T) => (portrait ? vertical : landscape) };
};
