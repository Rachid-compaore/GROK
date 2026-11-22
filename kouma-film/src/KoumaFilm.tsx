import { loadFont } from "@remotion/fonts";
import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, random, Sequence, spring, staticFile, useCurrentFrame } from "remotion";

/**
 * KOUMA — Thé Vert de Chine · « Le goût qui rassemble » (41 s, 1920×1080, 24 i/s cinéma).
 * Images réelles uniquement : plans de la vidéo Gemini (ralentis par interpolation, recadrés),
 * puis packshot avec les VRAIES boîtes et les vrais verres découpés de l'affiche fournie.
 * Les gros plans sur la boîte tenue par l'homme sont volontairement exclus : la boîte générée par
 * Gemini est surdimensionnée et ses textes sont faux.
 */
export const FPS = 24;
export const TOTAL = 40 * FPS;
const s = (x: number) => Math.round(x * FPS);
const EASE = { inOut: Easing.bezier(0.65, 0, 0.35, 1), out: Easing.bezier(0.16, 1, 0.3, 1), in: Easing.bezier(0.55, 0, 1, 0.45), soft: Easing.bezier(0.45, 0, 0.55, 1) };
const tw = (f: number, a: number, b: number, x: number, y: number, e = EASE.inOut) => interpolate(f, [s(a), s(b)], [x, y], { easing: e, extrapolateLeft: "clamp", extrapolateRight: "clamp" });
const spr = (f: number, at: number, damping = 15, mass = 0.9, stiffness = 100) => spring({ frame: f - s(at), fps: FPS, config: { damping, mass, stiffness } });

const C = { red: "#e01016", gold: "#f6c445", goldDeep: "#c98a12", cream: "#fff6e2", green: "#1f7a1a", greenDeep: "#0b3a0c" };
for (const [family, file, weight, style] of [
  ["Montserrat", "montserrat-latin-600-normal.woff2", "600", "normal"],
  ["Montserrat", "montserrat-latin-800-normal.woff2", "800", "normal"],
  ["Roboto Condensed", "roboto-condensed-latin-800-normal.woff2", "800", "normal"],
  ["Playfair Display", "playfair-display-latin-400-italic.woff2", "400", "italic"],
  ["Playfair Display", "playfair-display-latin-600-italic.woff2", "600", "italic"],
] as const)
  loadFont({ family, url: staticFile(`fonts/${file}`), weight, style });

/* ------------------------------------------------------------------ plans */
type Shot = { src: string; from: number; dur: number; start?: number; z: [number, number]; fx: number; fy: number; drift?: [number, number] };
/** Découpage : [début, durée] dans le film ; `start` = position dans le clip ; zoom de/à ; point de cadrage (1920×1080). */
export const SHOTS: Shot[] = [
  { src: "clips/aube.mp4", from: 0, dur: 3.7, z: [1.0, 1.08], fx: 960, fy: 520 },                     // l'aube se lève, fondu vers la cour
  { src: "clips/homme.mp4", from: 3.7, dur: 2.9, z: [2.0, 2.14], fx: 1300, fy: 260, drift: [0, -8] },   // le visage de l'homme, serein
  { src: "clips/versage.mp4", from: 6.6, dur: 3.7, z: [1.0, 1.1], fx: 1150, fy: 560 },                 // le thé est versé
  { src: "clips/versage.mp4", from: 10.3, dur: 3.7, z: [2.1, 2.3], fx: 1150, fy: 660 },                // la mousse se forme (macro)
  { src: "clips/partage.mp4", from: 14.0, dur: 3.9, z: [1.0, 1.08], fx: 960, fy: 540 },                // le partage
  { src: "clips/partage.mp4", from: 17.9, dur: 2.7, start: 1.0, z: [2.0, 2.12], fx: 1210, fy: 470 },  // un sourire, un verre
  { src: "clips/partage.mp4", from: 20.6, dur: 2.0, start: 0.2, z: [2.1, 2.2], fx: 1000, fy: 640 },   // le verre passe de main en main
  { src: "clips/partage.mp4", from: 22.6, dur: 2.4, start: 1.4, z: [1.8, 1.9], fx: 560, fy: 400 },    // l'hôte sourit
];
export const PACK_AT = 25.0;

const Clip: React.FC<{ shot: Shot }> = ({ shot }) => {
  const f = useCurrentFrame();
  const k = tw(f, 0, shot.dur, 0, 1, EASE.soft);
  const z = shot.z[0] + (shot.z[1] - shot.z[0]) * k;
  const dx = (shot.drift?.[0] ?? 0) * k, dy = (shot.drift?.[1] ?? 0) * k;
  // cadrage : le point (fx, fy) est amené au centre, sans jamais sortir de l'image
  const tx = Math.min(0, Math.max(1920 - 1920 * z, 960 - shot.fx * z)) + dx;
  const ty = Math.min(0, Math.max(1080 - 1080 * z, 540 - shot.fy * z)) + dy;
  const fadeIn = tw(f, 0, 0.5, 0, 1, EASE.soft);
  return (
    <AbsoluteFill style={{ overflow: "hidden", opacity: fadeIn }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, transformOrigin: "0 0", transform: `translate(${tx}px, ${ty}px) scale(${z})` }}>
        <OffthreadVideo src={staticFile(shot.src)} startFrom={s(shot.start ?? 0)} muted style={{ width: 1920, height: 1080 }} />
      </div>
    </AbsoluteFill>
  );
};

/** Sous-titre de la voix off (texte de la publicité), sobre et lisible. */
const Line: React.FC<{ text: string; dur: number; italic?: boolean }> = ({ text, dur, italic = true }) => {
  const f = useCurrentFrame();
  const o = tw(f, 0, 0.5, 0, 1, EASE.out) * (1 - tw(f, dur - 0.5, dur, 0, 1, EASE.in));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 118, textAlign: "center", opacity: o, transform: `translateY(${(1 - Math.min(1, o * 1.5)) * 10}px)` }}>
      <span style={{ fontFamily: "Playfair Display", fontStyle: italic ? "italic" : "normal", fontWeight: 400, fontSize: 50, color: C.cream, textShadow: "0 2px 18px rgba(0,0,0,0.75), 0 0 2px rgba(0,0,0,0.6)" }}>{text}</span>
    </div>
  );
};

/* ------------------------------------------------------------------ packshot */
const BOXES = { src: "media/boites.png", w: 1064, h: 1016 };
const GLASSES = { src: "media/verres.png", w: 852, h: 888 };
const LOGO = { src: "media/logo-kouma.png", w: 1400, h: 600 };

const Shine: React.FC<{ url: string; w: number; h: number; at: number }> = ({ url, w, h, at }) => {
  const f = useCurrentFrame();
  const x = tw(f, at, at + 1.1, -0.3, 1.3);
  if (x <= -0.3 || x >= 1.3) return null;
  return (
    <div style={{ position: "absolute", inset: 0, WebkitMaskImage: `url(${url})`, WebkitMaskSize: "100% 100%", maskImage: `url(${url})`, maskSize: "100% 100%", overflow: "hidden", mixBlendMode: "screen" }}>
      <div style={{ position: "absolute", top: "-20%", height: "140%", left: `${x * 100}%`, width: w * 0.2, transform: "translateX(-50%) rotate(16deg)", background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,250,225,0.5), rgba(255,255,255,0))" }} />
    </div>
  );
};

const Steam: React.FC<{ x: number; y: number; w: number; h: number }> = ({ x, y, w, h }) => {
  const f = useCurrentFrame();
  const t = f / FPS;
  return (
    <svg width={w} height={h} style={{ position: "absolute", left: x, top: y, opacity: tw(f, 1.2, 2.4, 0, 0.7), overflow: "visible", WebkitMaskImage: "linear-gradient(0deg, transparent 0%, #000 22%, #000 50%, transparent 100%)", maskImage: "linear-gradient(0deg, transparent 0%, #000 22%, #000 50%, transparent 100%)" }}>
      {[0, 1, 2].map((k) => {
        const p: string[] = [];
        for (let i = 0; i <= 26; i++) {
          const hh = i / 26;
          p.push(`${w * (0.25 + k * 0.25) + Math.sin(hh * 5 + t * (1.1 + k * 0.2) + k * 2) * w * 0.08 * (0.3 + hh)},${h * (1 - hh)}`);
        }
        return <polyline key={k} points={p.join(" ")} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={w * 0.09} strokeLinecap="round" style={{ filter: `blur(${w * 0.045}px)` }} />;
      })}
    </svg>
  );
};

const Packshot: React.FC = () => {
  const f = useCurrentFrame(); // 0 = PACK_AT
  const t = f / FPS;
  // caméra : arc lent (parallaxe entre plans), puis stabilisation
  const orbit = 1 - tw(f, 0, 5.5, 0, 1, EASE.out);
  const push = tw(f, 0, 14, 1.06, 1.0, EASE.out) + Math.max(0, t - 6) * 0.002;
  const boxesIn = spr(f, 0.5, 16, 1, 80);
  const glassIn = spr(f, 0.9, 16, 1, 80);
  // même facteur d'échelle pour les boîtes et les verres : proportions de l'affiche respectées
  const scale = 0.55;
  const BW = BOXES.w * scale, BH = BOXES.h * scale, GW = GLASSES.w * scale, GH = GLASSES.h * scale;
  const floorY = 965;
  const logoIn = spr(f, 3.2, 12, 0.8, 120);
  const t1 = tw(f, 4.0, 4.7, 0, 1, EASE.out);
  const badge = spr(f, 4.6, 12, 0.8, 130);
  const slogan = tw(f, 6.6, 7.6, 0, 1, EASE.out);
  const fadeOut = tw(f, 14.2, 15.0, 0, 1, EASE.inOut);
  return (
    <AbsoluteFill style={{ background: "#0b1a06" }}>
      {/* plantation au soleil couchant, floue (profondeur de champ) */}
      <AbsoluteFill style={{ transform: `scale(${1.15 + orbit * 0.04}) translateX(${orbit * 50}px)`, filter: "blur(5px) saturate(1.1)" }}>
        <Img src={staticFile("media/plantation.png")} style={{ width: 1920, height: 1080, objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(20,10,0,0.25) 0%, rgba(0,0,0,0) 40%, rgba(10,40,5,0.55) 100%)" }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 55% 60% at 50% 55%, rgba(255,215,140,0.35) 0%, rgba(255,215,140,0) 70%)", mixBlendMode: "screen" }} />
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "50% 85%" }}>
        {/* plateau de bois clair */}
        <div style={{ position: "absolute", left: -100, right: -100, top: floorY - 30, bottom: -100, background: "linear-gradient(180deg, #8a5a2e 0%, #5a3418 60%, #2a1608 100%)", boxShadow: "0 -2px 0 rgba(255,220,160,0.4)" }} />
        {/* boîtes (vraies, découpées de l'affiche) */}
        <div style={{ position: "absolute", left: 430 + orbit * -120, top: floorY - BH + (1 - boxesIn) * 400, width: BW, height: BH, zIndex: 3 }}>
          <div style={{ position: "absolute", left: BW * 0.05, right: BW * 0.05, bottom: -18, height: 40, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0) 70%)", filter: "blur(6px)" }} />
          <Img src={staticFile(BOXES.src)} style={{ position: "absolute", inset: 0, width: BW, height: BH, filter: "drop-shadow(0 24px 30px rgba(0,0,0,0.45))" }} />
          <Shine url={staticFile(BOXES.src)} w={BW} h={BH} at={2.0} />
          <Shine url={staticFile(BOXES.src)} w={BW} h={BH} at={9.0} />
        </div>
        {/* verres de thé mousseux (vrais, découpés de l'affiche) */}
        <div style={{ position: "absolute", left: 1010 + orbit * 90, top: floorY - GH + 12 + (1 - glassIn) * 400, width: GW, height: GH, zIndex: 4 }}>
          <div style={{ position: "absolute", left: GW * 0.08, right: GW * 0.08, bottom: -14, height: 36, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 70%)", filter: "blur(6px)" }} />
          <Img src={staticFile(GLASSES.src)} style={{ position: "absolute", inset: 0, width: GW, height: GH, filter: "drop-shadow(0 24px 30px rgba(0,0,0,0.45))" }} />
        </div>
      </AbsoluteFill>
      {/* signature */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 36, display: "flex", flexDirection: "column", alignItems: "center", zIndex: 10 }}>
        <div style={{ transform: `scale(${logoIn})`, filter: "drop-shadow(0 12px 22px rgba(60,0,0,0.45))" }}>
          <Img src={staticFile(LOGO.src)} style={{ width: 360, height: (360 * LOGO.h) / LOGO.w }} />
        </div>
        <div style={{ fontFamily: "Roboto Condensed", fontWeight: 800, fontSize: 62, color: "#fff", letterSpacing: 2, marginTop: 2, opacity: t1, transform: `translateY(${(1 - t1) * 20}px)`, textShadow: "3px 4px 0 #1d2a10, 0 8px 24px rgba(0,0,0,0.5)" }}>THÉ VERT DE CHINE</div>
        <div style={{ marginTop: 8, transform: `scale(${badge})` }}>
          <div style={{ padding: "8px 46px", background: `linear-gradient(180deg, #fff2b0, ${C.gold} 45%, ${C.goldDeep})`, clipPath: "polygon(6% 0, 94% 0, 100% 50%, 94% 100%, 6% 100%, 0 50%)", fontFamily: "Roboto Condensed", fontWeight: 800, fontSize: 36, color: "#2a1a00", letterSpacing: 1 }}>QUALITÉ SUPÉRIEURE</div>
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, textAlign: "center", top: 986, zIndex: 10, opacity: slogan, transform: `translateY(${(1 - slogan) * 16}px)` }}>
        <span style={{ fontFamily: "Playfair Display", fontStyle: "italic", fontWeight: 600, fontSize: 50, color: C.cream, textShadow: "0 3px 20px rgba(0,0,0,0.8)" }}>« Le goût qui rassemble. »</span>
      </div>
      <AbsoluteFill style={{ background: "#000", opacity: fadeOut }} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ film */
const LINES: [number, number, string][] = [
  [1.2, 3.4, "Au Burkina, certains moments ne se racontent pas…"],
  [4.8, 1.8, "…ils se partagent."],
  [6.9, 3.2, "Le plaisir d'un thé préparé avec soin."],
  [10.5, 1.8, "Un goût authentique."],
  [12.4, 1.6, "Une mousse généreuse."],
  [14.6, 5.4, "Et ces instants précieux qui rapprochent."],
];

export const KoumaFilm: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const fadeIn = 1 - tw(f, 0, 1.0, 0, 1, EASE.soft);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {SHOTS.map((sh, i) => (
        <Sequence key={i} from={s(sh.from)} durationInFrames={s(sh.dur + (i < SHOTS.length - 1 ? 0.5 : 0.6))} name={`plan ${i + 1}`}>
          <Clip shot={sh} />
        </Sequence>
      ))}
      {/* étalonnage chaud + vignettage, sur les plans réels */}
      {t < PACK_AT + 0.6 && (
        <>
          <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(255,190,110,0.09) 0%, rgba(0,0,0,0) 45%, rgba(20,8,0,0.2) 100%)", mixBlendMode: "soft-light" }} />
          <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)" }} />
          <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0) 28%)" }} />
        </>
      )}
      {LINES.map(([at, dur, text], i) => (
        <Sequence key={`l${i}`} from={s(at)} durationInFrames={s(dur)}>
          <Line text={text} dur={dur} />
        </Sequence>
      ))}
      <Sequence from={s(PACK_AT)} durationInFrames={TOTAL - s(PACK_AT)} name="packshot">
        <PackshotIn />
      </Sequence>
      {/* bandes cinéma sur les plans réels */}
      {t < PACK_AT + 0.8 && (
        <>
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 64, background: "#000" }} />
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 64, background: "#000" }} />
        </>
      )}
      <Grain />
      <AbsoluteFill style={{ background: "#000", opacity: fadeIn }} />
      <Audio src={staticFile("music.wav")} />
    </AbsoluteFill>
  );
};

/** Entrée du packshot : fondu enchaîné doux avec une lumière dorée. */
const PackshotIn: React.FC = () => {
  const f = useCurrentFrame();
  const o = tw(f, 0, 0.9, 0, 1, EASE.inOut);
  const glow = tw(f, 0, 0.45, 0, 1) * (1 - tw(f, 0.45, 1.3, 0, 1));
  return (
    <AbsoluteFill style={{ opacity: o }}>
      <Packshot />
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 50%, rgba(255,226,160,1) 0%, rgba(255,180,70,0.6) 40%, rgba(0,0,0,0) 75%)", opacity: glow * 0.7, mixBlendMode: "screen" }} />
    </AbsoluteFill>
  );
};

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
