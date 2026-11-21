import { loadFont } from "@remotion/fonts";
import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

/* =============================================================== réglages */
export const FPS = 60;
export const TOTAL = 25 * FPS;
const sec = (s: number) => Math.round(s * FPS);
const C = { red: "#d4101e", redDeep: "#7a0812", magenta: "#9b1f8c", gold: "#e8b23a", goldLight: "#ffe08a", cream: "#fff6e6", semoule: "#f2c94c" };
const FONT = { script: "Kaushan Script", sans: "Poppins" };
for (const [family, file, weight] of [
  [FONT.script, "kaushan-script-latin-400-normal.woff2", "400"],
  [FONT.sans, "poppins-latin-500-normal.woff2", "500"],
  [FONT.sans, "poppins-latin-600-normal.woff2", "600"],
  [FONT.sans, "poppins-latin-700-normal.woff2", "700"],
  [FONT.sans, "poppins-latin-800-normal.woff2", "800"],
] as const)
  loadFont({ family, url: staticFile(`fonts/${file}`), weight });

const EASE = { inOut: Easing.bezier(0.65, 0, 0.35, 1), out: Easing.bezier(0.16, 1, 0.3, 1), in: Easing.bezier(0.55, 0, 1, 0.45), soft: Easing.bezier(0.45, 0, 0.55, 1) };
const tw = (f: number, a: number, b: number, x: number, y: number, e = EASE.inOut) => interpolate(f, [sec(a), sec(b)], [x, y], { easing: e, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
const spr = (f: number, at: number, damping = 15, mass = 0.9, stiffness = 100) => spring({ frame: f - sec(at), fps: FPS, config: { damping, mass, stiffness } });

/** Instants clés (synchronisés avec scripts/make_audio.py). */
const EV = { logo: 2.2, bag: 4.6, title: 6.0, toCards: 9.2, cards: [9.6, 11.0, 12.4, 13.8], dish: 16.0, dishTitle: 17.0, final: 21.0, slogan: 22.0, badge: 22.9 };

/** Éléments découpés du visuel fourni (dimensions des fichiers). */
const BAG = { src: "media/sachet.png", w: 468, h: 868 };
const LOGO = { src: "media/logo-warda.png", w: 345, h: 345 };
const PLATE = { src: "media/plat-photo.jpg", w: 948, h: 796 };

const useLayout = () => {
  const { width, height } = useVideoConfig();
  const portrait = height > width;
  return { W: width, H: height, portrait, pick: <X,>(a: X, b: X) => (portrait ? b : a) };
};

/* =============================================================== décor */
/** Motif géométrique (étoile à 8 branches, type zellige / moucharabieh) tracé en or. */
const Pattern: React.FC<{ draw: number; opacity: number }> = ({ draw, opacity }) => {
  const { W, H } = useLayout();
  const cell = 150;
  const star = (cx: number, cy: number, r: number) => {
    const p: string[] = [];
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2 + Math.PI / 16;
      const rr = i % 2 ? r * 0.62 : r;
      p.push(`${cx + Math.cos(a) * rr},${cy + Math.sin(a) * rr}`);
    }
    return `M${p.join(" L")}Z`;
  };
  const cells: string[] = [];
  for (let y = -cell; y < H + cell; y += cell) for (let x = -cell; x < W + cell; x += cell) cells.push(star(x + ((y / cell) % 2 ? cell / 2 : 0), y, cell * 0.42));
  const len = 900;
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity }}>
      <defs>
        <radialGradient id="pfade" cx="50%" cy="50%" r="70%">
          <stop offset="0" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="1" />
        </radialGradient>
        <mask id="pmask"><rect width={W} height={H} fill="white" /><rect width={W} height={H} fill="url(#pfade)" /></mask>
      </defs>
      <g mask="url(#pmask)">
        {cells.map((d, i) => (
          <path key={i} d={d} fill="none" stroke={C.gold} strokeWidth={1.4} strokeDasharray={len} strokeDashoffset={len * (1 - Math.min(1, Math.max(0, draw * 1.6 - random(`pc${i}`) * 0.6)))} />
        ))}
      </g>
    </svg>
  );
};

/** Fond rouge profond, lumière chaude au centre. */
const Backdrop: React.FC<{ glowX?: number; glowY?: number; pattern?: number; light?: number }> = ({ glowX = 0.5, glowY = 0.45, pattern = 1, light = 1 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at ${glowX * 100}% ${glowY * 100}%, #c8202c 0%, ${C.redDeep} 45%, #2a0306 100%)` }}>
      <Pattern draw={pattern} opacity={0.18 * light} />
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 45% 55% at ${glowX * 100}% ${glowY * 100}%, rgba(255,214,140,${0.35 * light}) 0%, rgba(255,214,140,0) 70%)`, mixBlendMode: "screen", transform: `scale(${1 + Math.sin(f / 90) * 0.02})` }} />
    </AbsoluteFill>
  );
};

/** Semoule qui coule en filet doré depuis le haut (ralenti), avec grains qui rebondissent. */
const GrainStream: React.FC<{ x: number; from: number; to: number; width?: number; floorY: number }> = ({ x, from, to, width = 46, floorY }) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  if (t < from || t > to + 1.5) return null;
  const on = tw(f, from, from + 0.4, 0, 1) * (1 - tw(f, to, to + 0.6, 0, 1));
  return (
    <>
      {Array.from({ length: 220 }, (_, i) => {
        const r = (k: string) => random(`gs${i}${k}`);
        const period = 1.1 + r("p") * 0.5;
        const phase = ((t - from) / period + r("o")) % 1;
        const birth = from + r("o") * period;
        if (t < birth) return null;
        const y = -40 + phase * (floorY + 40) * (1 + r("v") * 0.06);
        const spread = (r("x") - 0.5) * width * (0.4 + phase * 0.9);
        const s = 3 + r("s") * 4;
        return <div key={i} style={{ position: "absolute", left: x + spread, top: Math.min(y, floorY - 2), width: s, height: s * 1.15, borderRadius: "50%", background: r("c") > 0.5 ? C.semoule : "#e0aa30", opacity: on * (0.65 + r("a") * 0.35), boxShadow: "0 0 3px rgba(255,220,120,0.6)" }} />;
      })}
    </>
  );
};

/** Grains dorés en suspension (profondeur, flou selon la distance). */
const FloatingGrains: React.FC<{ seed: string; count: number; opacity?: number }> = ({ seed, count, opacity = 1 }) => {
  const f = useCurrentFrame();
  const { W, H } = useLayout();
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity }}>
      {Array.from({ length: count }, (_, i) => {
        const r = (k: string) => random(`${seed}${i}${k}`);
        const z = r("z");
        const s = 3 + z * 9;
        const x = r("x") * W + Math.sin(f / 80 + i) * 14;
        const y = ((r("y") * (H + 80) - f * (0.15 + z * 0.4)) % (H + 80) + H + 80) % (H + 80) - 40;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: s, height: s * 1.1, borderRadius: "50%", background: C.semoule, opacity: 0.35 + z * 0.5, filter: `blur(${Math.abs(z - 0.5) * 5}px)` }} />;
      })}
    </AbsoluteFill>
  );
};

/** Tas de semoule au premier plan (couvre aussi le coin du sachet caché par le bol sur la photo). */
const Mound: React.FC<{ x: number; y: number; w: number; grow: number }> = ({ x, y, w, grow }) => {
  const h = w * 0.58 * grow;
  return (
    <svg width={w} height={w * 0.5} style={{ position: "absolute", left: x - w / 2, top: y - w * 0.5 + 6, overflow: "visible", zIndex: 6 }}>
      <defs>
        <filter id="semoule">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={4} result="n" />
          <feColorMatrix in="n" values="0 0 0 0 0.95  0 0 0 0 0.76  0 0 0 0 0.28  0 0 0 0.9 0" result="g" />
          <feComposite in="g" in2="SourceGraphic" operator="in" />
        </filter>
        <radialGradient id="moundShade" cx="40%" cy="25%" r="80%">
          <stop offset="0" stopColor="#ffe59a" />
          <stop offset="0.6" stopColor={C.semoule} />
          <stop offset="1" stopColor="#b98318" />
        </radialGradient>
      </defs>
      <ellipse cx={w / 2} cy={w * 0.5 - 6} rx={w * 0.5} ry={w * 0.05} fill="rgba(0,0,0,0.45)" style={{ filter: "blur(6px)" }} />
      <path d={`M0 ${w * 0.5 - 6} C${w * 0.18} ${w * 0.5 - h * 0.9} ${w * 0.32} ${w * 0.5 - h} ${w * 0.5} ${w * 0.5 - h} C${w * 0.68} ${w * 0.5 - h} ${w * 0.82} ${w * 0.5 - h * 0.9} ${w} ${w * 0.5 - 6}Z`} fill="url(#moundShade)" />
      <path d={`M0 ${w * 0.5 - 6} C${w * 0.18} ${w * 0.5 - h * 0.9} ${w * 0.32} ${w * 0.5 - h} ${w * 0.5} ${w * 0.5 - h} C${w * 0.68} ${w * 0.5 - h} ${w * 0.82} ${w * 0.5 - h * 0.9} ${w} ${w * 0.5 - 6}Z`} fill="#000" filter="url(#semoule)" opacity="0.55" />
    </svg>
  );
};

/* =============================================================== produit */
const Bag: React.FC<{ height: number; shineAt?: number[]; reflection?: number }> = ({ height, shineAt = [], reflection = 0.22 }) => {
  const f = useCurrentFrame();
  const width = (height * BAG.w) / BAG.h;
  const url = staticFile(BAG.src);
  return (
    <div style={{ position: "relative", width, height }}>
      <div style={{ position: "absolute", left: width * 0.05, right: width * 0.05, bottom: -height * 0.03, height: height * 0.06, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 70%)", filter: "blur(6px)" }} />
      {reflection > 0 && (
        <div style={{ position: "absolute", top: height - 3, left: 0, width, height, opacity: reflection, WebkitMaskImage: "linear-gradient(180deg, #000 0%, transparent 28%)", maskImage: "linear-gradient(180deg, #000 0%, transparent 28%)" }}>
          <Img src={url} style={{ width, height, transform: "scaleY(-1)", filter: "blur(1px)" }} />
        </div>
      )}
      <Img src={url} style={{ position: "absolute", inset: 0, width, height, filter: "drop-shadow(0 30px 40px rgba(40,0,0,0.5))" }} />
      <div style={{ position: "absolute", inset: 0, WebkitMaskImage: `url(${url})`, WebkitMaskSize: "100% 100%", maskImage: `url(${url})`, maskSize: "100% 100%", overflow: "hidden", mixBlendMode: "screen" }}>
        {shineAt.map((a, i) => {
          const x = tw(f, a, a + 1.0, -0.3, 1.3);
          return x > -0.3 && x < 1.3 ? <div key={i} style={{ position: "absolute", top: "-10%", height: "120%", left: `${x * 100}%`, width: width * 0.22, transform: "translateX(-50%) rotate(14deg)", background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,250,235,0.5), rgba(255,255,255,0))" }} /> : null;
        })}
      </div>
    </div>
  );
};

const Logo: React.FC<{ size: number; at: number; shineAt?: number }> = ({ size, at, shineAt }) => {
  const f = useCurrentFrame();
  const p = spr(f, at, 12, 0.8, 130);
  const url = staticFile(LOGO.src);
  const x = shineAt === undefined ? -1 : tw(f, shineAt, shineAt + 0.8, -0.3, 1.3);
  return (
    <div style={{ position: "relative", width: size, height: size, transform: `scale(${p}) rotate(${(1 - p) * -20}deg)`, filter: "drop-shadow(0 16px 30px rgba(40,0,0,0.55))" }}>
      <Img src={url} style={{ width: size, height: size }} />
      {x > -0.3 && x < 1.3 && (
        <div style={{ position: "absolute", inset: 0, borderRadius: "50%", overflow: "hidden", mixBlendMode: "screen" }}>
          <div style={{ position: "absolute", top: "-20%", height: "140%", left: `${x * 100}%`, width: size * 0.25, transform: "translateX(-50%) rotate(20deg)", background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.7), rgba(255,255,255,0))" }} />
        </div>
      )}
    </div>
  );
};

/** Plat de couscous (photo) avec vapeur ; son bord droit coupé sur la photo est posé contre le bord de l'écran. */
const Plate: React.FC<{ width: number; steamAt: number }> = ({ width, steamAt }) => {
  const f = useCurrentFrame();
  const t = f / FPS - steamAt;
  const h = (width * PLATE.h) / PLATE.w;
  const a = tw(f, steamAt, steamAt + 1.0, 0, 0.8);
  return (
    <div style={{ position: "relative", width, height: h }}>
      {/* photo du plat fondue dans le décor : bords gauche, haut et bas en dégradé, bord droit collé au cadre */}
      <Img
        src={staticFile(PLATE.src)}
        style={{
          width,
          height: h,
          filter: "saturate(1.06) contrast(1.03)",
          WebkitMaskImage: "linear-gradient(90deg, transparent 0%, #000 26%), linear-gradient(180deg, transparent 0%, #000 22%, #000 86%, transparent 100%)",
          WebkitMaskComposite: "source-in",
          maskImage: "linear-gradient(90deg, transparent 0%, #000 26%), linear-gradient(180deg, transparent 0%, #000 22%, #000 86%, transparent 100%)",
          maskComposite: "intersect",
        }}
      />
      {a > 0 && (
        <svg width={width * 0.6} height={h * 1.2} style={{ position: "absolute", left: width * 0.25, top: -h * 0.95, opacity: a, overflow: "visible", WebkitMaskImage: "linear-gradient(0deg, transparent 0%, #000 25%, #000 50%, transparent 100%)", maskImage: "linear-gradient(0deg, transparent 0%, #000 25%, #000 50%, transparent 100%)" }}>
          {[0, 1, 2, 3].map((k) => {
            const pts: string[] = [];
            for (let i = 0; i <= 28; i++) {
              const hh = i / 28;
              pts.push(`${width * 0.6 * (0.15 + k * 0.22) + Math.sin(hh * 5 + t * (1.1 + k * 0.2) + k * 2) * width * 0.05 * (0.3 + hh)},${h * 1.2 * (1 - hh)}`);
            }
            return <polyline key={k} points={pts.join(" ")} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={width * 0.06} strokeLinecap="round" style={{ filter: `blur(${width * 0.03}px)` }} />;
          })}
        </svg>
      )}
    </div>
  );
};

/* =============================================================== typographie */
const Words: React.FC<{ text: string; at: number; style: React.CSSProperties; stagger?: number; exitAt?: number }> = ({ text, at, style, stagger = 0.08, exitAt }) => {
  const f = useCurrentFrame();
  const out = exitAt === undefined ? 0 : tw(f, exitAt, exitAt + 0.35, 0, 1, EASE.in);
  return (
    <div style={{ ...style, opacity: 1 - out, transform: `translateY(${-out * 24}px)` }}>
      {text.split(" ").map((w, i) => {
        const p = tw(f, at + i * stagger, at + i * stagger + 0.55, 0, 1, EASE.out);
        return (
          <span key={i} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top", marginRight: "0.24em", padding: "0.06em 0.02em 0.14em" }}>
            <span style={{ display: "inline-block", transform: `translateY(${(1 - p) * 110}%) rotate(${(1 - p) * 4}deg)` }}>{w}</span>
          </span>
        );
      })}
    </div>
  );
};

/** Trait de pinceau doré sous un titre. */
const Swash: React.FC<{ at: number; width: number }> = ({ at, width }) => {
  const f = useCurrentFrame();
  const d = tw(f, at, at + 0.7, 0, 1, EASE.out);
  const len = width * 1.2;
  return (
    <svg width={width} height={30} style={{ overflow: "visible" }}>
      <path d={`M4 22 C${width * 0.3} 6 ${width * 0.7} 4 ${width - 4} 12`} fill="none" stroke={C.gold} strokeWidth={6} strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - d)} />
    </svg>
  );
};

/* =============================================================== icônes des avantages (tracées) */
const ICONS: Record<string, string> = {
  wheat: "M50 88 L50 20 M50 34 C40 30 36 22 38 14 C46 16 50 24 50 34 M50 34 C60 30 64 22 62 14 C54 16 50 24 50 34 M50 50 C40 46 36 38 38 30 C46 32 50 40 50 50 M50 50 C60 46 64 38 62 30 C54 32 50 40 50 50 M50 66 C40 62 36 54 38 46 C46 48 50 56 50 66 M50 66 C60 62 64 54 62 46 C54 48 50 56 50 66",
  grains: "M30 40 a4 4 0 1 0 0.1 0 M44 34 a4 4 0 1 0 0.1 0 M58 34 a4 4 0 1 0 0.1 0 M72 40 a4 4 0 1 0 0.1 0 M36 52 a4 4 0 1 0 0.1 0 M50 48 a4 4 0 1 0 0.1 0 M64 52 a4 4 0 1 0 0.1 0 M42 64 a4 4 0 1 0 0.1 0 M56 64 a4 4 0 1 0 0.1 0 M50 76 a4 4 0 1 0 0.1 0",
  chef: "M32 58 C20 58 16 46 22 38 C26 32 34 31 38 34 C40 24 48 20 54 21 C62 22 66 28 66 34 C72 30 82 34 82 44 C82 54 74 58 68 58 Z M34 58 L34 74 Q50 79 66 74 L66 58",
  family: "M30 46 a8 8 0 1 0 0.1 0 M70 46 a8 8 0 1 0 0.1 0 M50 54 a6 6 0 1 0 0.1 0 M18 80 C18 66 24 58 30 58 C36 58 42 66 42 80 M58 80 C58 66 64 58 70 58 C76 58 82 66 82 80 M40 82 C40 72 44 66 50 66 C56 66 60 72 60 82",
};
const BENEFITS = [
  { icon: "wheat", title: "100% Blé dur sélectionné", sub: "Qualité supérieure" },
  { icon: "grains", title: "Grains fins et réguliers", sub: "Une cuisson parfaite" },
  { icon: "chef", title: "Idéal pour tous vos plats", sub: "Traditionnel ou moderne" },
  { icon: "family", title: "Le choix des familles", sub: "Depuis toujours" },
];

const Benefit: React.FC<{ b: (typeof BENEFITS)[number]; at: number; exitAt: number; scale: number }> = ({ b, at, exitAt, scale }) => {
  const f = useCurrentFrame();
  const p = spr(f, at, 14, 0.9, 110);
  const draw = tw(f, at + 0.1, at + 0.9, 0, 1, EASE.out);
  const out = tw(f, exitAt, exitAt + 0.4, 0, 1, EASE.in);
  const R = 2 * Math.PI * 44;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 26 * scale, transform: `translateX(${(1 - p) * 120 + out * 80}px)`, opacity: Math.min(1, p * 1.4) * (1 - out) }}>
      <svg width={104 * scale} height={104 * scale} viewBox="0 0 100 100" style={{ flex: "none", filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.35))" }}>
        <circle cx="50" cy="50" r="46" fill={C.cream} />
        <circle cx="50" cy="50" r="44" fill="none" stroke={C.gold} strokeWidth="4" strokeDasharray={R} strokeDashoffset={R * (1 - draw)} transform="rotate(-90 50 50)" />
        <path d={ICONS[b.icon]} fill="none" stroke={C.red} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" strokeDasharray={600} strokeDashoffset={600 * (1 - draw)} />
      </svg>
      <div style={{ borderLeft: `3px solid ${C.gold}`, paddingLeft: 22 * scale }}>
        <div style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 40 * scale, color: C.cream, lineHeight: 1.15 }}>{b.title}</div>
        <div style={{ fontFamily: FONT.sans, fontWeight: 500, fontSize: 28 * scale, color: C.goldLight, marginTop: 4 }}>{b.sub}</div>
      </div>
    </div>
  );
};

/* =============================================================== la publicité */
export const Warda: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const { W, H, portrait, pick } = useLayout();

  // ---------- positions du sachet selon les moments (16:9 / 9:16)
  const BH = pick(760, 900);
  const BW = (BH * BAG.w) / BAG.h;
  const floorY = pick(960, 1440);
  const rise = spr(f, EV.bag, 15, 1, 85);
  const toLeft = tw(f, EV.toCards, EV.toCards + 0.9, 0, 1, EASE.inOut);
  const toDish = tw(f, EV.dish - 0.5, EV.dish + 0.3, 0, 1, EASE.inOut);
  const toFinal = spr(f, EV.final - 0.1, 15, 1, 90);
  const xHero = pick(600, W / 2), xCards = pick(470, W / 2), xFinal = pick(560, W / 2);
  let bx = xHero + (xCards - xHero) * toLeft;
  if (t >= EV.final - 0.1) bx = xFinal;
  const bagVisible = t >= EV.bag - 0.2 && (t < EV.dish + 0.3 || t >= EV.final - 0.2);
  const cardsPhase = t >= EV.toCards && t < EV.final;
  const finalPhase = t >= EV.final - 0.1;
  const bagHeight = portrait ? (cardsPhase ? BH * 0.7 : finalPhase ? BH * 0.5 : BH * 0.9) : finalPhase ? BH * 0.92 : BH;
  const floorNow = portrait ? (cardsPhase ? 1680 : finalPhase ? 1300 : floorY) : floorY;
  const bagTop = floorNow - bagHeight;
  const bagLift = t < EV.final - 0.1 ? (1 - rise) * 700 + toDish * -900 : (1 - toFinal) * 600;

  // ---------- caméra globale : poussée lente continue, une direction par scène
  const cam = 1 + (t % 1000) * 0.0015;
  const pour = t < EV.bag + 1.5;

  return (
    <AbsoluteFill style={{ background: "#120102", overflow: "hidden" }}>
      <AbsoluteFill style={{ transform: `scale(${cam})`, transformOrigin: "50% 55%" }}>
        <Backdrop glowX={t < EV.toCards ? 0.5 : t < EV.dish ? 0.3 : t < EV.final ? 0.7 : 0.5} glowY={0.45} pattern={tw(f, 0.2, 2.4, 0, 1, EASE.out)} light={tw(f, 0, 1.2, 0.3, 1)} />
        <FloatingGrains seed="bg" count={40} opacity={tw(f, 0.5, 2, 0, 1)} />
        {/* sol / plateau */}
        <div style={{ position: "absolute", left: -100, right: -100, top: floorY, bottom: -200, background: "linear-gradient(180deg, rgba(90,10,14,0.85) 0%, rgba(20,0,2,1) 100%)", opacity: tw(f, EV.bag - 0.5, EV.bag + 0.5, 0, 1) }} />
        <div style={{ position: "absolute", left: -100, right: -100, top: floorY - 1, height: 2, background: `linear-gradient(90deg, transparent 10%, ${C.gold} 50%, transparent 90%)`, opacity: 0.6 * tw(f, EV.bag - 0.5, EV.bag + 0.5, 0, 1) }} />

        {/* ---------- 1. ouverture : la semoule coule, le logo apparaît */}
        {pour && <GrainStream x={pick(W / 2, W / 2)} from={0.3} to={EV.bag + 0.2} floorY={pick(1080, 1920)} width={pick(60, 50)} />}
        {t < EV.bag + 0.6 && (
          <div style={{ position: "absolute", left: W / 2 - pick(190, 220), top: H * 0.45 - pick(190, 220), opacity: 1 - tw(f, EV.bag - 0.4, EV.bag + 0.2, 0, 1), transform: `translateY(${-tw(f, EV.bag - 0.4, EV.bag + 0.4, 0, 260, EASE.in)}px)` }}>
            <Logo size={pick(380, 440)} at={EV.logo} shineAt={EV.logo + 0.7} />
          </div>
        )}

        {/* ---------- sachet (2 → 5) */}
        {bagVisible && (
          <div style={{ position: "absolute", left: bx - (bagHeight * BAG.w) / BAG.h / 2, top: bagTop + bagLift, zIndex: 5 }}>
            <Bag height={bagHeight} shineAt={[EV.bag + 1.0, EV.cards[0] + 0.5, EV.final + 1.2]} />
          </div>
        )}
        {bagVisible && <Mound x={bx - ((bagHeight * BAG.w) / BAG.h) * 0.36} y={floorNow + 4 + bagLift} w={((bagHeight * BAG.w) / BAG.h) * 0.74} grow={tw(f, EV.bag, EV.bag + 0.8, 0.3, 1, EASE.out)} />}
      </AbsoluteFill>

      {/* ---------- 2. titre héros */}
      {t >= EV.title - 0.1 && t < EV.toCards + 0.5 && (
        <div style={{ position: "absolute", left: pick(1000, 0), top: pick(300, 110), width: pick(820, W), textAlign: pick("left", "center") as "left", zIndex: 8 }}>
          <Words text="Couscous" at={EV.title} exitAt={EV.toCards - 0.2} style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: pick(120, 120), color: C.cream, lineHeight: 1, textShadow: "0 8px 30px rgba(40,0,0,0.6)" }} />
          <Words text="Moyen · 1 kg" at={EV.title + 0.35} exitAt={EV.toCards - 0.2} style={{ fontFamily: FONT.script, fontSize: pick(70, 70), color: C.goldLight, marginTop: 8 }} />
          <div style={{ marginTop: 10, display: "flex", justifyContent: pick("flex-start", "center") }}><Swash at={EV.title + 0.8} width={pick(380, 360)} /></div>
          <Words text="100% blé dur" at={EV.title + 1.0} exitAt={EV.toCards - 0.2} style={{ fontFamily: FONT.sans, fontWeight: 600, fontSize: pick(40, 40), letterSpacing: 6, color: C.cream, marginTop: 14, textTransform: "uppercase" }} />
        </div>
      )}

      {/* ---------- 3. les quatre avantages */}
      {t >= EV.cards[0] - 0.1 && t < EV.dish + 0.2 && (
        <div style={{ position: "absolute", left: pick(820, 70), top: pick(130, 150), display: "flex", flexDirection: "column", gap: pick(46, 40), zIndex: 8 }}>
          {BENEFITS.map((b, i) => (
            <Benefit key={i} b={b} at={EV.cards[i]} exitAt={EV.dish - 0.6 + i * 0.05} scale={pick(1.22, 1.3)} />
          ))}
        </div>
      )}

      {/* ---------- 4. le plat : « Le vrai goût du couscous à la maison » */}
      {t >= EV.dish - 0.6 && t < EV.final + 0.4 && <DishScene />}

      {/* ---------- 5. signature */}
      {t >= EV.final - 0.2 && <FinalScene />}

      {/* grain pellicule + vignettage */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.35) 100%)", pointerEvents: "none", zIndex: 50 }} />
      <AbsoluteFill style={{ background: "#000", opacity: 1 - tw(f, 0, 0.5, 0, 1) + tw(f, 24.5, 25, 0, 1), zIndex: 60 }} />
      <Audio src={staticFile("music.wav")} />
    </AbsoluteFill>
  );
};

/** Scène du plat, entrée par un rideau de semoule en diagonale. */
const DishScene: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const { W, H, pick } = useLayout();
  const wipe = tw(f, EV.dish - 0.6, EV.dish + 0.2, 0, 1, EASE.inOut);
  const out = tw(f, EV.final - 0.5, EV.final + 0.3, 0, 1, EASE.inOut);
  const pw = pick(1200, 1080);
  const ph = (pw * PLATE.h) / PLATE.w;
  const push = 1 + tw(f, EV.dish, EV.final, 0, 0.06, EASE.soft);
  const x = -400 + wipe * (W + 800);
  const xo = -400 + out * (W + 800);
  return (
    <AbsoluteFill style={{ zIndex: 7, clipPath: `polygon(${xo - 300}px 0, ${x}px 0, ${x - 300}px ${H}px, ${xo - 600}px ${H}px)` }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 70% 55%, #8a3a12 0%, #4a0a0c 50%, #1a0203 100%)" }} />
      <Pattern draw={1} opacity={0.1} />
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "80% 70%" }}>
        <div style={{ position: "absolute", left: W - pw, top: pick(H - ph + 10, H - ph + 20) }}>
          <Plate width={pw} steamAt={99} />
        </div>
      </AbsoluteFill>
      <FloatingGrains seed="dish" count={30} />
      <div style={{ position: "absolute", left: pick(120, 0), top: pick(170, 230), width: pick(900, W), textAlign: pick("left", "center") as "left" }}>
        <Words text="Le vrai goût" at={EV.dishTitle} style={{ fontFamily: FONT.script, fontSize: pick(104, 108), color: C.goldLight, lineHeight: 1.05, textShadow: "0 6px 24px rgba(0,0,0,0.5)" }} />
        <Words text="du couscous" at={EV.dishTitle + 0.3} style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: pick(110, 112), color: C.cream, lineHeight: 1.05, textShadow: "0 6px 24px rgba(0,0,0,0.5)" }} />
        <Words text="à la maison" at={EV.dishTitle + 0.6} style={{ fontFamily: FONT.script, fontSize: pick(96, 100), color: C.goldLight, lineHeight: 1.1, textShadow: "0 6px 24px rgba(0,0,0,0.5)" }} />
        <div style={{ display: "flex", justifyContent: pick("flex-start", "center") }}><Swash at={EV.dishTitle + 1.1} width={pick(440, 420)} /></div>
      </div>
      {/* liseré de semoule le long du rideau */}
      {wipe < 1 && <div style={{ position: "absolute", left: x - 320, top: -100, width: 40, height: H + 200, transform: "skewX(-15.5deg)", background: `linear-gradient(90deg, transparent, ${C.semoule}, transparent)`, filter: "blur(4px)" }} />}
      {t < 0 && null}
    </AbsoluteFill>
  );
};

/** Signature : sachet + plat, logo, « Warda, la qualité dans votre assiette ! », badge 1 kg. */
const FinalScene: React.FC = () => {
  const f = useCurrentFrame();
  const { W, H, pick } = useLayout();
  const plateIn = spr(f, EV.final + 0.15, 15, 1, 90);
  const pw = pick(820, 1080);
  const ph = (pw * PLATE.h) / PLATE.w;
  const badge = spr(f, EV.badge, 11, 0.8, 140);
  return (
    <AbsoluteFill style={{ zIndex: 4, pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: W - pw + (1 - plateIn) * 500, top: pick(H - ((820 * PLATE.h) / PLATE.w) * 0.8, 1330) }}>
        <Plate width={pw} steamAt={99} />
      </div>
      <div style={{ position: "absolute", left: pick(W / 2 + 70, W / 2 - 150), top: pick(24, 70), zIndex: 9 }}>
        <Logo size={pick(205, 300)} at={EV.final + 0.4} shineAt={EV.final + 1.4} />
      </div>
      <div style={{ position: "absolute", left: pick(940, 0), top: pick(230, 380), width: pick(880, W), textAlign: pick("left", "center") as "left", zIndex: 9 }}>
        <Words text="Warda," at={EV.slogan} style={{ fontFamily: FONT.script, fontSize: pick(110, 120), color: C.cream, lineHeight: 1, textShadow: "0 6px 24px rgba(0,0,0,0.55)" }} />
        <Words text="la qualité dans" at={EV.slogan + 0.3} style={{ fontFamily: FONT.script, fontSize: pick(84, 92), color: C.goldLight, lineHeight: 1.1, textShadow: "0 6px 24px rgba(0,0,0,0.55)" }} />
        <Words text="votre assiette !" at={EV.slogan + 0.55} style={{ fontFamily: FONT.script, fontSize: pick(84, 92), color: C.goldLight, lineHeight: 1.1, textShadow: "0 6px 24px rgba(0,0,0,0.55)" }} />
        <div style={{ display: "flex", justifyContent: pick("flex-start", "center") }}><Swash at={EV.slogan + 1.0} width={pick(480, 460)} /></div>
      </div>
      {/* badge 1 kg */}
      <div style={{ position: "absolute", left: pick(W - 330, 50), top: pick(H - 250, H - 300), transform: `scale(${badge}) rotate(${(1 - badge) * 30 - 6}deg)`, zIndex: 10 }}>
        <div style={{ width: 250, height: 150, borderRadius: 75, background: `linear-gradient(180deg, ${C.goldLight}, ${C.gold})`, border: "5px solid #fff3c4", boxShadow: "0 14px 30px rgba(0,0,0,0.45)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 74, color: C.red, lineHeight: 1 }}>1kg</div>
          <div style={{ fontFamily: FONT.sans, fontWeight: 600, fontSize: 20, color: C.redDeep, letterSpacing: 2 }}>POIDS NET</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
