import { loadFont } from "@remotion/fonts";
import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, random, Sequence, spring, staticFile, useCurrentFrame } from "remotion";

export const FPS = 24; // cadence cinéma de la vidéo source : aucune saccade de conversion
export const TOTAL = Math.round(16.5 * FPS);
const sec = (s: number) => Math.round(s * FPS);

/** Le slogan — jamais modifié. */
export const SLOGAN = "LE SECRET DES CHEFS";

const C = { mustard: "#d9a514", mustardDeep: "#a86f05", mustardLight: "#f4cf4a", gold: "#e9c46a", cream: "#fbf3dc", red: "#d9161c", green: "#0f6b2e" };
const FONT = { display: "Bodoni Moda", sans: "Montserrat" };
for (const [family, file, weight, style] of [
  [FONT.display, "bodoni-moda-latin-700-normal.woff2", "700", "normal"],
  [FONT.display, "bodoni-moda-latin-900-normal.woff2", "900", "normal"],
  [FONT.display, "bodoni-moda-latin-500-italic.woff2", "500", "italic"],
  [FONT.sans, "montserrat-latin-500-normal.woff2", "500", "normal"],
  [FONT.sans, "montserrat-latin-600-normal.woff2", "600", "normal"],
] as const)
  loadFont({ family, url: staticFile(`fonts/${file}`), weight, style });

const EASE = { inOut: Easing.bezier(0.65, 0, 0.35, 1), out: Easing.bezier(0.16, 1, 0.3, 1), in: Easing.bezier(0.55, 0, 1, 0.45), soft: Easing.bezier(0.45, 0, 0.55, 1) };
const tw = (f: number, a: number, b: number, x: number, y: number, e = EASE.inOut) => interpolate(f, [sec(a), sec(b)], [x, y], { easing: e, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
const spr = (f: number, at: number, damping = 15, mass = 0.9, stiffness = 100) => spring({ frame: f - sec(at), fps: FPS, config: { damping, mass, stiffness } });

/* ============================================================================
 * PARTIE 1 (0–10 s) : la vidéo Gemini, étalonnée et habillée comme un film :
 * bandes cinéma, vignettage, grain, signature OLARA discrète, sous-titre élégant,
 * poussée de caméra et voile de lumière sur le dernier plan.
 * ========================================================================== */
const Film: React.FC = () => {
  const f = useCurrentFrame();
  const push = tw(f, 9.2, 10.4, 1, 1.12, EASE.in);
  const bloom = tw(f, 9.45, 10.0, 0, 1, EASE.in);
  const bars = tw(f, 0, 1.0, 140, 72, EASE.out); // bandes cinéma qui s'ouvrent au début
  const lower = tw(f, 2.6, 3.2, 0, 1, EASE.out) * (1 - tw(f, 5.2, 5.7, 0, 1, EASE.in));
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ transform: `scale(${push})` }}>
        <OffthreadVideo src={staticFile("media/gemini-1080p.mp4")} muted style={{ width: 1920, height: 1080 }} />
      </AbsoluteFill>
      {/* étalonnage : lumière chaude en haut, ombres plus profondes en bas */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(255,190,110,0.10) 0%, rgba(0,0,0,0) 45%, rgba(20,8,0,0.18) 100%)", mixBlendMode: "soft-light" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.42) 100%)" }} />
      {/* sous-titre élégant au moment où la moutarde entre en scène */}
      <div style={{ position: "absolute", left: 120, bottom: 150, opacity: lower, transform: `translateY(${(1 - lower) * 16}px)` }}>
        <div style={{ width: 70 * lower, height: 2, background: C.gold, marginBottom: 14 }} />
        <div style={{ fontFamily: FONT.display, fontStyle: "italic", fontWeight: 500, fontSize: 54, color: C.cream, textShadow: "0 2px 18px rgba(0,0,0,0.6)" }}>Moutarde de Dijon</div>
        <div style={{ fontFamily: FONT.sans, fontWeight: 600, fontSize: 22, letterSpacing: 10, color: C.gold, marginTop: 8, textShadow: "0 2px 12px rgba(0,0,0,0.6)" }}>OLARA</div>
      </div>
      {/* voile lumineux qui annonce la transition */}
      <AbsoluteFill style={{ background: "radial-gradient(circle at 22% 55%, rgba(255,226,160,1) 0%, rgba(255,180,70,0.7) 35%, rgba(0,0,0,0) 75%)", opacity: bloom * 0.85, mixBlendMode: "screen" }} />
      <Bars h={bars} />
    </AbsoluteFill>
  );
};

const Bars: React.FC<{ h: number }> = ({ h }) => (
  <>
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: h, background: "#000" }} />
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: h, background: "#000" }} />
  </>
);

/* ============================================================================
 * PARTIE 2 (10–16,5 s) : packshot « LE SECRET DES CHEFS ».
 * ========================================================================== */
const Ribbon: React.FC<{ pts: [number, number][]; width: number; draw: number; phase?: number }> = ({ pts, width, draw, phase = 0 }) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  if (draw <= 0) return null;
  const P = pts.map(([x, y], i) => [x, y + Math.sin(t * 1.1 + i * 1.3 + phase) * 16] as [number, number]);
  const out: string[] = [];
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
    for (let s = 0; s < 1; s += 0.04) {
      const s2 = s * s, s3 = s2 * s;
      out.push(`${0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * s + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * s2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * s3)},${0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * s + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * s2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * s3)}`);
    }
  }
  const pl = out.join(" ");
  const len = 6000;
  const dash = { strokeDasharray: len, strokeDashoffset: len * (1 - Math.min(1, draw)) };
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <polyline points={pl} fill="none" stroke="rgba(30,12,0,0.6)" strokeWidth={width} strokeLinecap="round" transform={`translate(0 ${width * 0.3})`} style={{ filter: `blur(${width * 0.2}px)`, ...dash }} />
      <polyline points={pl} fill="none" stroke={C.mustardDeep} strokeWidth={width} strokeLinecap="round" style={dash} />
      <polyline points={pl} fill="none" stroke={C.mustard} strokeWidth={width * 0.78} strokeLinecap="round" transform={`translate(0 ${-width * 0.06})`} style={dash} />
      <polyline points={pl} fill="none" stroke="#fff1b8" strokeWidth={width * 0.12} strokeLinecap="round" transform={`translate(0 ${-width * 0.22})`} style={{ filter: "blur(1.5px)", ...dash }} />
    </svg>
  );
};

/** Toque de chef dessinée au trait (icône de signature). */
const Toque: React.FC<{ at: number; size: number }> = ({ at, size }) => {
  const f = useCurrentFrame();
  const d = tw(f, at, at + 0.9, 0, 1, EASE.out);
  const len = 600;
  return (
    <svg width={size} height={size * 0.82} viewBox="0 0 120 98" style={{ overflow: "visible", filter: "drop-shadow(0 4px 10px rgba(0,0,0,0.5))" }}>
      <path
        d="M30 66 C12 66 4 50 12 38 C18 28 30 26 36 30 C38 16 52 8 62 10 C74 12 80 20 82 28 C92 22 108 28 110 42 C112 56 100 66 90 66 Z M32 66 L32 86 Q60 92 88 86 L88 66 M32 76 Q60 81 88 76"
        fill="none"
        stroke={C.gold}
        strokeWidth={3.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={len}
        strokeDashoffset={len * (1 - d)}
      />
    </svg>
  );
};

/** Lettres du slogan : tracé doré puis remplissage crème-or, montée douce. */
const SloganLetters: React.FC<{ at: number; size: number }> = ({ at, size }) => {
  const f = useCurrentFrame();
  const words = SLOGAN.split(" ");
  let k = 0;
  return (
    <div style={{ fontFamily: FONT.display, fontWeight: 900, fontSize: size, lineHeight: 1.05, letterSpacing: size * 0.04, whiteSpace: "nowrap", display: "flex", justifyContent: "center", gap: size * 0.32 }}>
      {words.map((w, wi) => (
        <span key={wi} style={{ display: "inline-flex" }}>
          {Array.from(w).map((ch, i) => {
            const s = at + k++ * 0.04;
            const stroke = tw(f, s, s + 0.4, 0, 1, EASE.out);
            const fill = tw(f, s + 0.3, s + 0.8, 0, 1, EASE.inOut);
            return (
              <span key={i} style={{ position: "relative", display: "inline-block", transform: `translateY(${(1 - stroke) * 0.25}em)`, opacity: Math.min(1, stroke * 1.5) }}>
                <span style={{ WebkitTextStroke: `${size * 0.012}px rgba(244,207,74,${1 - fill * 0.7})`, color: "transparent" }}>{ch}</span>
                <span style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(180deg, #fff6da 0%, ${C.mustardLight} 45%, ${C.gold} 70%, #b9852a 100%)`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", clipPath: `inset(${(1 - fill) * 100}% 0 0 0)` }}>{ch}</span>
              </span>
            );
          })}
        </span>
      ))}
    </div>
  );
};

const Packshot: React.FC = () => {
  const f = useCurrentFrame(); // temps local : 0 = 9,9 s
  const t = f / FPS;
  const reveal = tw(f, 0.0, 0.6, 0, 1, EASE.inOut);
  const jar = spr(f, 0.25, 15, 1, 80);
  const push = tw(f, 0, 6.6, 1.04, 1.0, EASE.out) + Math.max(0, t - 2.5) * 0.004;
  const textIn = tw(f, 1.3, 1.8, 0, 1, EASE.out);
  const shine = tw(f, 1.0, 2.1, -0.3, 1.3);
  const JH = 760, JW = JH * (820 / 1466);
  const jx = 470; // même place que le pot dans le dernier plan Gemini : raccord parfait
  const SLOGAN_AT = 1.8;
  return (
    <AbsoluteFill style={{ clipPath: reveal < 1 ? `circle(${reveal * 1900}px at 22% 55%)` : "none" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 38% 48%, #6a3c10 0%, #2a1606 45%, #090503 100%)" }} />
      {/* faisceau et halo */}
      <AbsoluteFill style={{ background: `radial-gradient(ellipse 30% 70% at ${(jx / 1920) * 100}% 20%, rgba(255,214,140,0.28) 0%, rgba(255,214,140,0) 70%)`, mixBlendMode: "screen" }} />
      {/* bokeh chaud */}
      {Array.from({ length: 10 }, (_, i) => {
        const r = (q: string) => random(`bk${i}${q}`);
        const s = 120 + r("s") * 260;
        return <div key={i} style={{ position: "absolute", left: r("x") * 1920 - s / 2 + Math.sin(t * 0.4 + i) * 20, top: r("y") * 800 - s / 2, width: s, height: s, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,190,90,0.35) 0%, transparent 70%)", mixBlendMode: "screen", opacity: 0.4 + r("o") * 0.4 }} />;
      })}
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "25% 80%" }}>
        {/* plateau en bois sombre et brillant */}
        <div style={{ position: "absolute", left: -100, right: -100, top: 900, bottom: -200, background: "linear-gradient(180deg, rgba(80,44,14,0.95) 0%, rgba(14,6,2,1) 100%)" }} />
        <div style={{ position: "absolute", left: -100, right: -100, top: 899, height: 2, background: "linear-gradient(90deg, transparent 10%, rgba(255,210,140,0.6) 45%, transparent 90%)" }} />
        <Ribbon pts={[[-150, 820], [350, 760], [800, 840], [1300, 770], [2080, 830]]} width={70} draw={tw(f, 0.3, 1.6, 0, 1, EASE.out)} />
        {/* graines de moutarde qui tombent au ralenti */}
        {Array.from({ length: 26 }, (_, i) => {
          const r = (q: string) => random(`sd${i}${q}`);
          const y = ((r("y") * 1100 + t * (60 + r("v") * 60)) % 1100) - 50;
          const s = 7 + r("s") * 8;
          return <div key={i} style={{ position: "absolute", left: r("x") * 1920, top: y, width: s, height: s, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%, #f6dc7a, #a8761a)", filter: r("b") > 0.6 ? "blur(3px)" : undefined, opacity: tw(f, 0.4, 1.0, 0, 0.9) }} />;
        })}
        {/* pot OLARA (photo fournie, détourée, proportions intactes) */}
        <div style={{ position: "absolute", left: jx - JW / 2, top: 905 - JH + (1 - jar) * 220, width: JW, height: JH, transform: `scale(${0.94 + jar * 0.06})`, transformOrigin: "50% 100%" }}>
          <div style={{ position: "absolute", left: JW * 0.06, right: JW * 0.06, bottom: -16, height: 38, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 70%)", filter: "blur(6px)" }} />
          <div style={{ position: "absolute", top: JH - 3, left: 0, width: JW, height: JH, opacity: 0.22, WebkitMaskImage: "linear-gradient(180deg, #000 0%, transparent 30%)", maskImage: "linear-gradient(180deg, #000 0%, transparent 30%)" }}>
            <Img src={staticFile("media/pot-olara.png")} style={{ width: JW, height: JH, transform: "scaleY(-1)" }} />
          </div>
          <Img src={staticFile("media/pot-olara.png")} style={{ position: "absolute", inset: 0, width: JW, height: JH }} />
          <div style={{ position: "absolute", inset: 0, WebkitMaskImage: `url(${staticFile("media/pot-olara.png")})`, WebkitMaskSize: "100% 100%", maskImage: `url(${staticFile("media/pot-olara.png")})`, maskSize: "100% 100%", overflow: "hidden", mixBlendMode: "screen" }}>
            {shine > -0.3 && shine < 1.3 && <div style={{ position: "absolute", top: "-10%", height: "120%", left: `${shine * 100}%`, width: JW * 0.18, transform: "translateX(-50%) rotate(8deg)", background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,250,225,0.55), rgba(255,255,255,0))" }} />}
          </div>
        </div>
      </AbsoluteFill>
      {/* signature */}
      <div style={{ position: "absolute", left: 900, top: 300, width: 940, display: "flex", flexDirection: "column", alignItems: "center", opacity: textIn }}>
        <div style={{ transform: `scale(${spr(f, SLOGAN_AT - 0.35, 13, 0.8, 120)})` }}>
          <Img src={staticFile("media/logo-olara.png")} style={{ width: 230, filter: "drop-shadow(0 8px 18px rgba(0,0,0,0.5))" }} />
        </div>
        <div style={{ height: 34 }} />
        <Toque at={SLOGAN_AT - 0.1} size={130} />
        <div style={{ height: 18 }} />
        <div style={{ filter: `drop-shadow(0 0 ${22 * tw(f, SLOGAN_AT + 0.6, SLOGAN_AT + 1.2, 0, 1) * (1 - tw(f, SLOGAN_AT + 1.4, SLOGAN_AT + 2.6, 0, 0.6))}px rgba(244,207,74,0.6)) drop-shadow(0 6px 14px rgba(0,0,0,0.6))` }}>
          <SloganLetters at={SLOGAN_AT} size={80} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 26, opacity: tw(f, SLOGAN_AT + 1.4, SLOGAN_AT + 2.0, 0, 1) }}>
          <span style={{ width: 70, height: 1.5, background: C.gold }} />
          <span style={{ fontFamily: FONT.display, fontStyle: "italic", fontWeight: 500, fontSize: 34, color: C.cream }}>Moutarde de Dijon</span>
          <span style={{ width: 70, height: 1.5, background: C.gold }} />
        </div>
      </div>
      <Bars h={tw(f, 0, 1.0, 72, 0, EASE.inOut)} />
      <AbsoluteFill style={{ background: "#000", opacity: tw(f, 6.15, 6.6, 0, 1) }} />
    </AbsoluteFill>
  );
};

/** Grain pellicule sur tout le film. */
const Grain: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: 0.05, mixBlendMode: "overlay" }}>
      <svg width="100%" height="100%">
        <filter id={`g${f}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={f} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#g${f})`} />
      </svg>
    </AbsoluteFill>
  );
};

export const OlaraChefs: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Sequence from={0} durationInFrames={sec(10.6)} name="Film Gemini habillé"><Film /></Sequence>
    <Sequence from={sec(9.9)} durationInFrames={TOTAL - sec(9.9)} name="Packshot : LE SECRET DES CHEFS"><Packshot /></Sequence>
    <Grain />
    <Audio src={staticFile("music.wav")} />
  </AbsoluteFill>
);
