import { loadFont } from "@remotion/fonts";
import { Easing, interpolate, spring, staticFile } from "remotion";

export const W = 1920;
export const H = 1080;
export const FPS = 60;
export const TOTAL = 30 * FPS;
export const sec = (s: number) => Math.round(s * FPS);

/** Découpage (secondes). Chaque scène recouvre la précédente par un masque de transition. */
export const SCENES = {
  intro: { from: 0, to: 4.3 },
  tea: { from: 3.8, to: 7.4 },
  blackcurrant: { from: 6.8, to: 12.4 },
  strawberry: { from: 11.8, to: 17.4 },
  lemon: { from: 16.8, to: 22.4 },
  forest: { from: 21.8, to: 26.4 },
  finale: { from: 25.8, to: 30 },
};

export type FruitKind = "cassis" | "strawberry" | "lemon" | "lemonSlice" | "raspberry" | "blackberry" | "leaf";

export type Flavor = {
  key: string;
  pack: string;
  name: string;
  tagline: string;
  bg: [string, string, string]; // centre, milieu, bord
  accent: string;
  glow: string;
  fruits: FruitKind[];
  transition: "wave" | "splash" | "burst" | "diagonal";
};

export const FLAVORS: Record<string, Flavor> = {
  blackcurrant: {
    key: "blackcurrant",
    pack: "packs/blackcurrant.jpg",
    name: "BLACKCURRANT",
    tagline: "L'intensité du thé noir, aux notes de cassis.",
    bg: ["#5b3b96", "#2a1650", "#0b0518"],
    accent: "#e9c46a",
    glow: "rgba(170,120,255,0.45)",
    fruits: ["cassis", "cassis", "cassis", "leaf"],
    transition: "wave",
  },
  strawberry: {
    key: "strawberry",
    pack: "packs/strawberry.jpg",
    name: "STRAWBERRY",
    tagline: "Une touche fruitée et gourmande.",
    bg: ["#ff6a6a", "#d81f3d", "#5a0616"],
    accent: "#ffd23f",
    glow: "rgba(255,180,120,0.5)",
    fruits: ["strawberry", "strawberry", "leaf"],
    transition: "splash",
  },
  lemon: {
    key: "lemon",
    pack: "packs/lemon.jpg",
    name: "LEMON",
    tagline: "Une note de fraîcheur citronnée.",
    bg: ["#fff27a", "#ffc300", "#e07a00"],
    accent: "#ffffff",
    glow: "rgba(255,255,220,0.65)",
    fruits: ["lemon", "lemonSlice", "lemonSlice", "leaf"],
    transition: "burst",
  },
  forest: {
    key: "forest",
    pack: "packs/forest-fruits.jpg",
    name: "FOREST FRUITS",
    tagline: "Un bouquet de notes fruitées.",
    bg: ["#ff6fa5", "#c2185b", "#3a0526"],
    accent: "#ffd6e7",
    glow: "rgba(255,170,210,0.5)",
    fruits: ["raspberry", "strawberry", "blackberry", "raspberry"],
    transition: "diagonal",
  },
};

export const GOLD = { light: "#ffe36b", mid: "#ffc400", deep: "#f08c00" };
export const FONT = { sans: "Montserrat", serif: "Playfair Display" };

const fonts: [string, string, string, string][] = [
  [FONT.sans, "montserrat-latin-500-normal.woff2", "500", "normal"],
  [FONT.sans, "montserrat-latin-700-normal.woff2", "700", "normal"],
  [FONT.sans, "montserrat-latin-800-normal.woff2", "800", "normal"],
  [FONT.serif, "playfair-display-latin-400-italic.woff2", "400", "italic"],
  [FONT.serif, "playfair-display-latin-600-italic.woff2", "600", "italic"],
];
for (const [family, file, weight, style] of fonts) loadFont({ family, url: staticFile(`fonts/${file}`), weight, style });

export const EASE = {
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  out: Easing.bezier(0.16, 1, 0.3, 1),
  in: Easing.bezier(0.55, 0, 1, 0.45),
  soft: Easing.bezier(0.45, 0, 0.55, 1),
};

/** interpolation bornée en secondes (temps local de la scène) */
export const tw = (frame: number, a: number, b: number, from: number, to: number, easing = EASE.inOut) =>
  interpolate(frame, [sec(a), sec(b)], [from, to], { easing, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

/** ressort qui démarre à `at` secondes */
export const spr = (frame: number, at: number, damping = 15, mass = 0.9, stiffness = 110) =>
  spring({ frame: frame - sec(at), fps: FPS, config: { damping, mass, stiffness } });
