import React from "react";
import { AbsoluteFill, random, useCurrentFrame, useVideoConfig } from "remotion";
import { Bean } from "../components/Bean";
import { BeanCloud, Glow, LightShafts, Particles, Sachet, Steam } from "../components/Effects";
import { CARAMEL, CocoaDust, GOLDEN, LiquidColors, LiquidRibbon, LiquidWipe, MILK } from "../components/Liquids";
import { BrandReveal, LetterReveal, Slogan } from "../components/Typo";
import { EASE, FONT, PRODUCTS, SLOGAN, spr, tw, useLayout, WORLD } from "../theme";

const WORDS = SLOGAN.split(" "); // ["CRÉMEUX", "ET", "DÉLICIEUX"]

/* ------------------------------------------------------------------ décor commun */
/** Sol brillant : la ligne d'horizon reçoit la lumière, le produit s'y reflète. */
const Floor: React.FC<{ y: number; tint: string; edge?: string; end?: string }> = ({ y, tint, edge = "rgba(255,225,170,0.55)", end = "rgba(0,0,0,0.88)" }) => (
  <>
    <div style={{ position: "absolute", left: -100, right: -100, top: y, bottom: -200, background: `linear-gradient(180deg, ${tint} 0%, ${end} 100%)` }} />
    <div style={{ position: "absolute", left: -100, right: -100, top: y - 1, height: 2, background: `linear-gradient(90deg, transparent 5%, ${edge} 50%, transparent 95%)` }} />
  </>
);

/** Grandes taches de lumière floues (profondeur), qui dérivent lentement. */
const Bokeh: React.FC<{ seed: string; color: string; count?: number; camX?: number }> = ({ seed, color, count = 9, camX = 0 }) => {
  const frame = useCurrentFrame();
  const { W, H } = useLayout();
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen", pointerEvents: "none" }}>
      {Array.from({ length: count }, (_, i) => {
        const r = (k: string) => random(`${seed}${i}${k}`);
        const s = 120 + r("s") * 260;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: r("x") * W - s / 2 - camX * 60 + Math.sin(frame / 120 + i) * 20,
              top: r("y") * H * 0.7 - s / 2 + Math.cos(frame / 140 + i) * 14,
              width: s,
              height: s,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
              opacity: 0.35 + r("o") * 0.35,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Grains posés sur le sol, au pied du produit (nets), plus deux grains flous au premier plan. */
const FloorBeans: React.FC<{ seed: string; cx: number; y: number; spread: number; camX?: number }> = ({ seed, cx, y, spread, camX = 0 }) => {
  const { W } = useLayout();
  const spots = [-0.62, -0.48, -0.36, 0.4, 0.55, 0.68];
  return (
    <>
      {spots.map((s, i) => {
        const r = (k: string) => random(`${seed}${i}${k}`);
        const size = 54 + r("s") * 26;
        return (
          <div key={i} style={{ position: "absolute", left: cx + s * spread - size / 2 - camX * 20, top: y - size * 0.55 + r("y") * 24, transform: `rotate(${r("r") * 180 - 90}deg)`, filter: "drop-shadow(0 10px 8px rgba(0,0,0,0.55))", zIndex: 4 }}>
            <Bean size={size} id={`${seed}${i}`} spin={r("sp") * 2} />
          </div>
        );
      })}
      {[0, 1].map((i) => (
        <div key={`f${i}`} style={{ position: "absolute", left: i ? W - 220 - camX * 90 : 40 - camX * 90, top: y + 90, transform: `rotate(${i ? 30 : -40}deg)`, filter: "blur(10px)", zIndex: 6 }}>
          <Bean size={190} id={`${seed}f${i}`} spin={i} />
        </div>
      ))}
    </>
  );
};

/* =================================================================== 01 — OUVERTURE (0–4 s) */
export const Opening: React.FC = () => {
  const frame = useCurrentFrame();
  const { W, H, pick } = useLayout();
  const t = frame / 60;
  const light = tw(frame, 0.1, 1.4, 0, 1, EASE.soft);
  const push = tw(frame, 0, 4.4, 1.0, 1.12, EASE.soft);
  const hb = tw(frame, 1.0, 1.65, 0, 1, EASE.in); // le grain traverse l'objectif
  const follow = tw(frame, 1.0, 1.75, 0, 1, EASE.inOut); // la caméra le suit
  const flash = tw(frame, 1.55, 1.72, 0, 1) * (1 - tw(frame, 1.72, 2.4, 0, 1, EASE.out));
  const fadeIn = 1 - tw(frame, 0, 0.8, 0, 1, EASE.soft);
  const floorY = pick(760, 1260);
  return (
    <AbsoluteFill style={{ background: "#050302", isolation: "isolate" }}>
      <AbsoluteFill style={{ transform: `scale(${push}) translateX(${-follow * W * 0.06}px)` }}>
        <Glow x={W / 2} y={floorY - 120} r={pick(900, 800)} color={`rgba(255,170,70,${0.42 * light})`} />
        <LightShafts color="255,205,130" opacity={0.85 * light} origin={[0.55, -0.2]} />
        <BeanCloud seed="open-far" count={pick(8, 7)} depth={[0, 0.35]} size={80} camZ={push - 1} />
        <Floor y={floorY} tint="rgba(60,30,12,0.9)" edge={`rgba(255,200,130,${0.6 * light})`} />
        {[-1, 0, 1].map((k) => (
          <div key={k} style={{ position: "absolute", left: W / 2 + k * 120 - 50, top: floorY - 62 + Math.abs(k) * 8, transform: `rotate(${k * 35 + 10}deg)`, filter: `brightness(${0.4 + light * 0.7}) drop-shadow(0 12px 10px rgba(0,0,0,0.6))` }}>
            <Bean size={100} id={`ob${k}`} spin={k} />
          </div>
        ))}
        <Particles seed="open" count={70} speed={0.35} />
      </AbsoluteFill>
      {hb > 0 && hb < 1 && (
        <div style={{ position: "absolute", left: W * (1.05 - hb * 1.3), top: H * (0.35 + Math.sin(hb * Math.PI) * 0.08), transform: `translate(-50%,-50%) rotate(${-hb * 260}deg) scale(${1.2 + hb * 4})`, filter: `blur(${4 + hb * 10}px)` }}>
          <Bean size={220} id="hero" spin={hb * 4} />
        </div>
      )}
      <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center", transform: `translateY(${pick(-60, -160)}px) scale(${1 + Math.max(0, t - 1.8) * 0.02})` }}>
        <BrandReveal at={1.75} size={pick(220, 160)} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(circle at 15% 40%, rgba(255,235,190,1) 0%, rgba(255,190,100,0.75) 35%, rgba(0,0,0,0) 75%)", opacity: flash, mixBlendMode: "screen" }} />
      <AbsoluteFill style={{ background: "#000", opacity: fadeIn }} />
    </AbsoluteFill>
  );
};

/* =================================================================== SCÈNES PRODUIT */
type ProductKey = keyof typeof PRODUCTS;
export type Cfg = {
  product: ProductKey;
  world: keyof typeof WORLD;
  wipe: { dir: "right" | "up" | "radial" | "diagonal"; colors: LiquidColors };
  entry: "rise" | "slam" | "swing";
  entryAt: number;
  nameAt: number;
  sloganAt: number;
  accent: "milk" | "cocoa" | "caramel";
};

export const ProductScene: React.FC<{ cfg: Cfg }> = ({ cfg }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const dur = durationInFrames / 60;
  const t = frame / 60;
  const { W, portrait, pick } = useLayout();
  const P = PRODUCTS[cfg.product];
  const w = WORLD[cfg.world];
  const dark = cfg.world === "cream";

  // caméra : dolly avant continu + léger travelling ; le produit glisse à gauche pour laisser place au texte
  const dolly = tw(frame, 0, dur, 1.0, 1.08, EASE.soft);
  const camX = tw(frame, 0, dur, -0.5, 0.5, EASE.soft);
  const truck = portrait ? 0 : tw(frame, cfg.nameAt - 0.7, cfg.nameAt + 0.2, 0, 1, EASE.inOut);
  const PH = pick(700, 840);
  const PW = PH * P.ratio;
  const floorY = pick(900, 1200);
  const cx = portrait ? W / 2 : W / 2 + (600 - W / 2) * truck;
  const top = floorY - PH - 6;

  let tf = "";
  let blur = 0;
  if (cfg.entry === "rise") {
    const p = spr(frame, cfg.entryAt, 15, 1, 85);
    tf = `translateY(${(1 - p) * 140}px) scale(${0.9 + p * 0.1})`;
    blur = (1 - Math.min(1, p)) * 10;
  } else if (cfg.entry === "slam") {
    const p = spr(frame, cfg.entryAt, 12, 0.9, 160);
    tf = `scale(${1.7 - p * 0.7}) translateY(${(1 - p) * -60}px)`;
    blur = Math.max(0, 1 - p) * 16;
  } else {
    const p = spr(frame, cfg.entryAt, 14, 1, 90);
    tf = `rotate(${(1 - p) * -16}deg) translateX(${(1 - p) * -W * 0.35}px) scale(${0.86 + p * 0.14})`;
    blur = (1 - Math.min(1, p)) * 8;
  }
  const breathe = Math.sin(t * 1.3) * 3;

  const ribbonPts: [number, number][] = portrait
    ? [[-150, 1000], [200, 820], [540, 900], [880, 640], [1240, 760]]
    : [[-200, 700], [300, 520], [cx, 640], [cx + 520, 420], [W + 200, 520]];

  const sloganLines = portrait ? [[WORDS[0], WORDS[1]], [WORDS[2]]] : [[WORDS[0]], [WORDS[1], WORDS[2]]];
  const nameColor = dark ? "#5a2e10" : "#ffffff";

  return (
    <LiquidWipe dir={cfg.wipe.dir} colors={cfg.wipe.colors}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at ${portrait ? 50 : 38}% 40%, ${w.bg[0]} 0%, ${w.bg[1]} 48%, ${w.bg[2]} 100%)` }}>
        <AbsoluteFill style={{ transform: `scale(${dolly})`, transformOrigin: `${(cx / W) * 100}% 60%` }}>
          <Bokeh seed={`${cfg.product}-bk`} color={dark ? "rgba(255,255,240,0.55)" : "rgba(255,230,180,0.35)"} camX={camX} />
          <LightShafts color={dark ? "255,248,230" : "255,220,160"} opacity={0.75} origin={[portrait ? 0.5 : 0.32, -0.25]} />
          <BeanCloud seed={`${cfg.product}-far`} count={6} depth={[0, 0.3]} camX={camX} size={70} />
          {cfg.accent === "milk" && <LiquidRibbon pts={ribbonPts} width={pick(110, 100)} colors={MILK} drawAt={cfg.entryAt + 0.1} />}
          {cfg.accent === "caramel" && (
            <>
              <LiquidRibbon pts={ribbonPts} width={pick(96, 90)} colors={CARAMEL} drawAt={cfg.entryAt} />
              <LiquidRibbon pts={ribbonPts.map(([x, y]) => [x, y + 120] as [number, number])} width={pick(70, 64)} colors={MILK} drawAt={cfg.entryAt + 0.25} sway={30} />
            </>
          )}
          <Glow x={cx} y={floorY - PH * 0.5} r={pick(560, 640)} color={w.light} />
          <Floor y={floorY} tint={dark ? "rgba(225,195,150,0.75)" : "rgba(0,0,0,0.35)"} end={dark ? "rgba(205,165,115,0.95)" : "rgba(0,0,0,0.88)"} edge={dark ? "rgba(255,255,255,0.7)" : "rgba(255,225,170,0.55)"} />
          {cfg.accent === "cocoa" && <CocoaDust burstAt={0.15} cx={W / 2} cy={floorY - PH * 0.55} />}
          <div style={{ position: "absolute", left: cx - PW / 2, top: top + breathe, width: PW, height: PH, transform: tf, transformOrigin: "50% 100%", filter: blur ? `blur(${blur}px)` : undefined, zIndex: 3 }}>
            {(cfg.accent === "caramel" || cfg.accent === "milk") && <Steam x={PW * 0.3} y={-PH * 0.36} w={PW * 0.4} h={PH * 0.42} from={cfg.entryAt + 1.0} />}
            <Sachet src={P.src} ratio={P.ratio} height={PH} shineAt={[cfg.entryAt + 0.9, cfg.sloganAt + 0.5]} reflection={0.26} shadow={1} />
          </div>
          <FloorBeans seed={`${cfg.product}-fb`} cx={cx} y={floorY + 10} spread={PW * 0.95} camX={camX} />
        </AbsoluteFill>
        <Particles seed={`${cfg.product}-pt`} count={40} color={dark ? "#fffaf0" : "#ffe7b0"} speed={0.4} />
        <div style={{ position: "absolute", left: portrait ? 0 : 1030, top: portrait ? floorY + 70 : 330, width: portrait ? W : 820, display: "flex", flexDirection: "column", alignItems: portrait ? "center" : "flex-start", zIndex: 8 }}>
          <LetterReveal text={P.name} at={cfg.nameAt} style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: pick(46, 44), color: nameColor, textShadow: dark ? "none" : "0 4px 20px rgba(0,0,0,0.5)" }} />
          <div style={{ height: pick(22, 18) }} />
          <Slogan at={cfg.sloganAt} size={pick(92, 104)} lines={sloganLines} align={portrait ? "center" : "left"} dark={dark} />
        </div>
      </AbsoluteFill>
    </LiquidWipe>
  );
};

/* =================================================================== 05 — PACKSHOT FINAL */
export const Final: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 60;
  const { W, portrait, pick } = useLayout();
  const orbit = 1 - tw(frame, 0.3, 3.0, 0, 1, EASE.out); // la caméra tourne autour, puis se stabilise
  const push = tw(frame, 0, 7.3, 1.03, 1.0, EASE.out) + Math.max(0, t - 3) * 0.004;
  const floorY = pick(900, 1480);
  const items = portrait
    ? [
        { k: "threeInOne" as const, x: 285, b: 860, h: 500, z: 0.6, at: 0.55 },
        { k: "cappuccino" as const, x: 795, b: 860, h: 500, z: 0.6, at: 0.7 },
        { k: "latte" as const, x: 540, b: floorY, h: 600, z: 1, at: 0.85 },
      ]
    : [
        { k: "threeInOne" as const, x: 420, b: floorY - 14, h: 580, z: 0.6, at: 0.55 },
        { k: "cappuccino" as const, x: 1500, b: floorY - 14, h: 580, z: 0.6, at: 0.7 },
        { k: "latte" as const, x: 960, b: floorY, h: 680, z: 1, at: 0.85 },
      ];
  const ribbon: [number, number][] = portrait
    ? [[-150, 560], [300, 420], [700, 520], [1230, 380]]
    : [[-200, 520], [500, 330], [1100, 470], [2120, 300]];
  return (
    <LiquidWipe dir="diagonal" colors={GOLDEN} dur={0.8}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 38%, #5a3416 0%, #241208 48%, #070403 100%)" }}>
        <AbsoluteFill style={{ transform: `scale(${push})` }}>
          <AbsoluteFill style={{ background: "repeating-conic-gradient(from 0deg at 50% 45%, rgba(255,215,150,0.07) 0deg 4deg, rgba(255,215,150,0) 4deg 12deg)", transform: `rotate(${t * 3}deg) scale(2)`, mixBlendMode: "screen" }} />
          <Bokeh seed="fin-bk" color="rgba(255,210,140,0.35)" count={10} camX={orbit} />
          <LightShafts color="255,210,140" opacity={0.9} origin={[0.5, -0.3]} />
          <LiquidRibbon pts={ribbon} width={pick(90, 80)} colors={CARAMEL} drawAt={0.4} />
          <LiquidRibbon pts={ribbon.map(([x, y]) => [x, y + 110] as [number, number])} width={pick(70, 60)} colors={MILK} drawAt={0.6} sway={28} />
          <Glow x={W / 2} y={floorY - 300} r={900} color="rgba(255,205,130,0.5)" />
          <Floor y={floorY} tint="rgba(70,36,14,0.85)" />
          <BeanCloud seed="fin-far" count={7} depth={[0, 0.3]} camX={orbit} size={70} />
          {items.map((it, i) => {
            const P = PRODUCTS[it.k];
            const p = spr(frame, it.at, 14, 1, 95);
            const ox = orbit * (it.z - 0.8) * pick(-600, -320);
            const sc = 1 + orbit * (it.z - 0.8) * 0.2;
            const PW = it.h * P.ratio;
            return (
              <div key={i} style={{ position: "absolute", left: it.x - PW / 2 + ox, top: it.b - it.h + (1 - p) * 260, width: PW, height: it.h, transform: `scale(${sc * (0.92 + p * 0.08)})`, transformOrigin: "50% 100%", filter: `blur(${(1 - Math.min(1, p)) * 10}px)`, zIndex: it.z === 1 ? 4 : 3 }}>
                {i === 2 && <Steam x={PW * 0.3} y={-it.h * 0.34} w={PW * 0.4} h={it.h * 0.4} from={1.6} />}
                <Sachet src={P.src} ratio={P.ratio} height={it.h} shineAt={[2.0 + i * 0.15, 4.6 + i * 0.15]} reflection={portrait && it.z < 1 ? 0 : 0.24} />
              </div>
            );
          })}
          <FloorBeans seed="fin-fb" cx={W / 2} y={floorY + 10} spread={pick(880, 470)} camX={orbit} />
        </AbsoluteFill>
        <Particles seed="fin-pt" count={70} speed={0.35} />
        <div style={{ position: "absolute", left: 0, width: W, top: pick(28, 120), zIndex: 9 }}>
          <BrandReveal at={1.7} size={pick(128, 150)} />
        </div>
        <div style={{ position: "absolute", left: 0, width: W, top: pick(938, 1560), zIndex: 9 }}>
          <Slogan at={2.5} size={pick(86, 112)} lines={portrait ? [[WORDS[0], WORDS[1]], [WORDS[2]]] : [WORDS]} align="center" />
        </div>
      </AbsoluteFill>
    </LiquidWipe>
  );
};
