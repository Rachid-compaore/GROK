import React from "react";
import { AbsoluteFill, Audio, Easing, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Bars, Grain, Packshot } from "./OlaraChefs";

/**
 * OLARA — « LE SECRET DES CHEFS », version longue (22 s, 24 i/s).
 * Uniquement des images réelles : la photo du pot et les plans de la vidéo Gemini,
 * recadrés, ralentis (interpolation de mouvement) et étalonnés, puis le packshot final.
 * Le texte à l'écran reprend le texte de la voix off (scripts/voix-off.md).
 */
export const FPS = 24;
const s = (x: number) => Math.round(x * FPS);
const EASE = { inOut: Easing.bezier(0.65, 0, 0.35, 1), out: Easing.bezier(0.16, 1, 0.3, 1), in: Easing.bezier(0.55, 0, 1, 0.45), soft: Easing.bezier(0.45, 0, 0.55, 1) };
const tw = (f: number, a: number, b: number, x: number, y: number, e = EASE.inOut) => interpolate(f, [s(a), s(b)], [x, y], { easing: e, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

/** Plans (secondes) : [début, durée]. */
export const SHOTS = {
  macro: [0.0, 2.7],     // photo du pot : macro de la moutarde puis du logo
  kitchen: [2.7, 2.0],   // plan A : la cuisinière
  spoon: [4.7, 3.85],    // plan B ralenti : la cuillère dans le pot
  texture: [8.55, 1.7],  // photo du pot : texture crémeuse en très gros plan
  pan: [10.25, 2.75],    // plan C ralenti : la poêle
  family: [13.0, 2.85],  // plan D : le repas en famille
  table: [15.85, 1.6],   // plan E : le pot et l'assiette
  pack: [16.85, 6.4],    // packshot + slogan
};
export const TOTAL_LONG = s(23.25);

/** Titre éditorial : filet doré, phrase en Didone italique révélée mot à mot. */
const Title: React.FC<{ text: string; at: number; out: number; align?: "left" | "center" }> = ({ text, at, out, align = "left" }) => {
  const f = useCurrentFrame();
  const o = 1 - tw(f, out - 0.3, out, 0, 1, EASE.in);
  return (
    <div style={{ position: "absolute", left: align === "left" ? 130 : 0, right: align === "left" ? undefined : 0, bottom: 150, textAlign: align, opacity: o }}>
      <div style={{ width: tw(f, at, at + 0.5, 0, 80, EASE.out), height: 2, background: "#e9c46a", marginBottom: 16, marginLeft: align === "center" ? "auto" : 0, marginRight: align === "center" ? "auto" : 0 }} />
      <div style={{ fontFamily: "Bodoni Moda", fontStyle: "italic", fontWeight: 500, fontSize: 58, color: "#fbf3dc", textShadow: "0 3px 22px rgba(0,0,0,0.65)" }}>
        {text.split(" ").map((w, i) => {
          const p = tw(f, at + i * 0.09, at + i * 0.09 + 0.5, 0, 1, EASE.out);
          return (
            <span key={i} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top", marginRight: "0.26em", paddingBottom: "0.1em" }}>
              <span style={{ display: "inline-block", transform: `translateY(${(1 - p) * 105}%)` }}>{w}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
};

/** Plan vidéo réel, avec mouvement de caméra lent (poussée / glissement) et étalonnage. */
const Clip: React.FC<{ src: string; dur: number; from?: [number, number, number]; to?: [number, number, number] }> = ({ src, dur, from = [1, 0, 0], to = [1.06, 0, 0] }) => {
  const f = useCurrentFrame();
  const k = tw(f, 0, dur, 0, 1, EASE.soft);
  const z = from[0] + (to[0] - from[0]) * k, x = from[1] + (to[1] - from[1]) * k, y = from[2] + (to[2] - from[2]) * k;
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
      <AbsoluteFill style={{ transform: `scale(${z}) translate(${x}px, ${y}px)` }}>
        <OffthreadVideo src={staticFile(src)} muted style={{ width: 1920, height: 1080 }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** Photo réelle du pot, cadrée en macro : panoramique lent sur la matière ou l'étiquette. */
const PhotoMacro: React.FC<{ dur: number; from: [number, number, number]; to: [number, number, number]; blur?: number }> = ({ dur, from, to, blur = 0 }) => {
  const f = useCurrentFrame();
  const k = tw(f, 0, dur, 0, 1, EASE.soft);
  // photo 1070×1536 ; [x, y, largeur visible] dans les coordonnées de la photo
  const cx = from[0] + (to[0] - from[0]) * k, cy = from[1] + (to[1] - from[1]) * k, vw = from[2] + (to[2] - from[2]) * k;
  const scale = 1920 / vw;
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
      <Img src={staticFile("media/original-pot.jpg")} style={{ position: "absolute", left: 960 - cx * scale, top: 540 - cy * scale, width: 1070 * scale, height: 1536 * scale, filter: `saturate(1.05) contrast(1.04) ${blur ? `blur(${blur}px)` : ""}` }} />
      {/* lumière rasante qui balaie la matière */}
      <AbsoluteFill style={{ background: `linear-gradient(105deg, rgba(255,255,255,0) ${-20 + k * 90}%, rgba(255,240,200,0.22) ${-5 + k * 90}%, rgba(255,255,255,0) ${10 + k * 90}%)`, mixBlendMode: "screen" }} />
    </AbsoluteFill>
  );
};

/** Fuite de lumière chaude (raccord entre deux plans). */
const LightLeak: React.FC<{ at: number; dur?: number }> = ({ at, dur = 0.6 }) => {
  const f = useCurrentFrame();
  const k = tw(f, at, at + dur / 2, 0, 1, EASE.in) * (1 - tw(f, at + dur / 2, at + dur, 0, 1, EASE.out));
  if (k <= 0) return null;
  return <AbsoluteFill style={{ background: "radial-gradient(ellipse 70% 90% at 85% 40%, rgba(255,200,110,1) 0%, rgba(255,140,40,0.6) 35%, rgba(0,0,0,0) 75%)", opacity: k * 0.9, mixBlendMode: "screen", pointerEvents: "none" }} />;
};

const Grade: React.FC = () => (
  <>
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(255,190,110,0.08) 0%, rgba(0,0,0,0) 45%, rgba(20,8,0,0.16) 100%)", mixBlendMode: "soft-light", pointerEvents: "none" }} />
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 48%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.42) 100%)", pointerEvents: "none" }} />
  </>
);

const Shot: React.FC<{ k: keyof typeof SHOTS; children: React.ReactNode }> = ({ k, children }) => (
  <Sequence from={s(SHOTS[k][0])} durationInFrames={s(SHOTS[k][1])} name={k}>{children}</Sequence>
);

export const OlaraChefsLong: React.FC = () => {
  const f = useCurrentFrame();
  const t = f / FPS;
  const bars = t < SHOTS.pack[0] ? 72 : 0;
  const fadeIn = 1 - tw(f, 0, 0.7, 0, 1, EASE.soft);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Shot k="macro"><PhotoMacro dur={2.7} from={[520, 330, 420]} to={[560, 640, 760]} /></Shot>
      <Shot k="kitchen"><Clip src="clips/A.mp4" dur={2.0} from={[1.0, 0, 0]} to={[1.08, -40, 0]} /></Shot>
      <Shot k="spoon"><Clip src="clips/Bslow.mp4" dur={3.85} from={[1.04, 0, 0]} to={[1.14, 20, 10]} /></Shot>
      <Shot k="texture"><PhotoMacro dur={1.7} from={[420, 420, 360]} to={[620, 380, 330]} /></Shot>
      <Shot k="pan"><Clip src="clips/Cslow.mp4" dur={2.75} from={[1.0, 0, 0]} to={[1.16, 0, -20]} /></Shot>
      <Shot k="family"><Clip src="clips/D.mp4" dur={2.85} from={[1.12, 40, 0]} to={[1.0, 0, 0]} /></Shot>
      <Shot k="table"><Clip src="clips/E.mp4" dur={1.6} from={[1.0, 0, 0]} to={[1.1, 60, 0]} /></Shot>
      <Grade />
      {/* voile sombre discret sous les titres (lisibilité) */}
      <AbsoluteFill style={{ background: "linear-gradient(0deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 22%, rgba(0,0,0,0) 40%)", opacity: t > 2.8 && t < 15.9 ? 1 : 0, pointerEvents: "none" }} />
      {/* titres (= texte de la voix off) */}
      <Sequence from={s(2.95)} durationInFrames={s(1.75)}><Title text="Chaque grand plat commence par un geste." at={0} out={1.75} /></Sequence>
      <Sequence from={s(5.2)} durationInFrames={s(3.3)}><Title text="Une touche de Moutarde de Dijon OLARA…" at={0} out={3.3} /></Sequence>
      <Sequence from={s(8.75)} durationInFrames={s(1.45)}><Title text="Crémeuse. Intense." at={0} out={1.45} align="center" /></Sequence>
      <Sequence from={s(10.5)} durationInFrames={s(2.45)}><Title text="Saisir. Napper. Sublimer." at={0} out={2.45} /></Sequence>
      <Sequence from={s(13.3)} durationInFrames={s(2.5)}><Title text="Et toute la table le ressent." at={0} out={2.5} /></Sequence>
      <LightLeak at={8.3} />
      <LightLeak at={10.0} />
      <LightLeak at={15.6} dur={0.5} />
      {/* raccord vers le packshot : même transition que la version courte */}
      <Sequence from={s(SHOTS.pack[0])} durationInFrames={s(SHOTS.pack[1])} name="packshot"><Packshot /></Sequence>
      {bars > 0 && <Bars h={bars} />}
      <Grain />
      <AbsoluteFill style={{ background: "#000", opacity: fadeIn, pointerEvents: "none" }} />
      <Audio src={staticFile("music-long.wav")} />
    </AbsoluteFill>
  );
};
