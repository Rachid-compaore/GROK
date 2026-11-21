import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Bean } from "../components/Bean";
import { BeanCloud, Glow, LightShafts, Particles, Sachet, Steam } from "../components/Effects";
import { CaramelSwirl, ClockWipe, CocoaBurst, SplashCrown } from "../components/Liquids";
import { BrandReveal, LetterReveal, Slogan } from "../components/Typo";
import { EASE, GOLD, PRODUCTS, SLOGAN, spr, tw, useLayout, WORLD } from "../theme";

const WORDS = SLOGAN.split(" "); // ["CRÉMEUX", "ET", "DÉLICIEUX"]

/* =================================================================== 01 — OUVERTURE */
export const Opening: React.FC = () => {
  const frame = useCurrentFrame();
  const { W, H, pick } = useLayout();
  const dolly = tw(frame, 0, 4.6, 0, 0.7, EASE.soft);
  // le grain héros traverse l'objectif ; la caméra le suit (léger pan)
  const hb = tw(frame, 2.2, 3.05, 0, 1, EASE.in);
  const follow = tw(frame, 2.2, 3.05, 0, 1, EASE.inOut);
  const flash = tw(frame, 2.9, 3.1, 0, 1) * (1 - tw(frame, 3.1, 3.8, 0, 1, EASE.out));
  const gold = tw(frame, 3.0, 3.4, 0, 1);
  const fadeIn = 1 - tw(frame, 0, 0.9, 0, 1, EASE.soft);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 55% 45%, #2a160a 0%, #0d0704 55%, #000 100%)" }}>
      <AbsoluteFill style={{ transform: `translateX(${-follow * W * 0.08}px)` }}>
        <LightShafts color="255,200,120" opacity={0.7} origin={[0.62, -0.15]} />
        <BeanCloud seed="open" count={pick(18, 14)} camZ={dolly} size={pick(90, 80)} />
        <Steam x={W * 0.5 - 150} y={H * 0.45} w={300} h={H * 0.45} from={0.6} />
        <Particles seed="open" count={60} speed={0.5} />
      </AbsoluteFill>
      {/* grain qui traverse le champ jusqu'à l'objectif */}
      {hb > 0 && hb < 1 && (
        <div
          style={{
            position: "absolute",
            left: W * (-0.05 + hb * 0.62),
            top: H * (0.62 - hb * 0.2),
            transform: `translate(-50%,-50%) rotate(${hb * 220}deg) scale(${0.4 + Math.pow(hb, 3) * 16})`,
            filter: `blur(${Math.pow(hb, 2) * 8}px) drop-shadow(0 20px 30px rgba(0,0,0,0.6))`,
          }}
        >
          <Bean size={140} id="hero" spin={hb * 5} />
        </div>
      )}
      {/* éclat doré puis TOPCAFÉ */}
      <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, rgba(255,214,140,${0.55 * gold}) 0%, rgba(120,60,10,${0.35 * gold}) 45%, rgba(0,0,0,0) 75%)` }} />
      <AbsoluteFill style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <BrandReveal at={3.1} size={pick(210, 150)} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(circle, rgba(255,240,200,1) 0%, rgba(255,200,110,0.9) 40%, rgba(255,170,60,0) 80%)", opacity: flash, mixBlendMode: "screen" }} />
      <AbsoluteFill style={{ background: "#000", opacity: fadeIn }} />
    </AbsoluteFill>
  );
};

/* =================================================================== SCÈNE PRODUIT (3 IN 1, CAPPUCCINO, CAFÉ LATTE) */
type ProductKey = keyof typeof PRODUCTS;
type Cfg = {
  product: ProductKey;
  world: keyof typeof WORLD;
  entryAt: number;
  entry: "rise" | "slam" | "orbit";
  camera: "dolly" | "travel" | "orbit";
  nameAt: number;
  sloganAt: number;
  extras?: "splash" | "cocoa" | "caramel";
};

export const ProductScene: React.FC<{ cfg: Cfg }> = ({ cfg }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const dur = durationInFrames / 60;
  const t = frame / 60;
  const { W, H, portrait, pick } = useLayout();
  const P = PRODUCTS[cfg.product];
  const w = WORLD[cfg.world];

  // --- caméra
  const camP = tw(frame, 0, dur, 0, 1, EASE.soft);
  const sceneScale = cfg.camera === "dolly" ? 1.18 - camP * 0.18 : cfg.camera === "travel" ? 1.04 + camP * 0.06 : 1.05;
  const camX = cfg.camera === "travel" ? -1 + camP * 2 : cfg.camera === "orbit" ? Math.sin(camP * Math.PI) * 0.6 : 0;
  const rack = cfg.camera === "orbit" ? tw(frame, 0.4, 2.4, 9, 2, EASE.inOut) : 0; // mise au point qui glisse vers le produit

  // --- produit
  const PH = pick(720, 840);
  const pan = portrait ? 0 : tw(frame, 1.3, 2.2, 0, 1, EASE.inOut);
  const cx = portrait ? W / 2 : W / 2 + (600 - W / 2) * pan;
  const cy = portrait ? 740 - tw(frame, 1.3, 2.2, 0, 60, EASE.inOut) : H / 2 + 20;
  let tf = "";
  if (cfg.entry === "rise") {
    const p = spr(frame, cfg.entryAt, 14, 1, 90);
    tf = `translateY(${(1 - p) * H * 0.7}px) rotate(${(1 - p) * -10 - 2 + Math.sin(t * 1.2) * 1}deg) scale(${0.85 + p * 0.15})`;
  } else if (cfg.entry === "slam") {
    const p = spr(frame, cfg.entryAt, 11, 0.9, 170);
    tf = `scale(${2.2 - p * 1.2}) rotate(${(1 - p) * 14 + 2 + Math.sin(t * 1.3) * 1}deg)`;
  } else {
    const p = spr(frame, cfg.entryAt, 15, 1, 80);
    const a = (1 - p) * Math.PI * 0.9;
    tf = `translate(${-Math.sin(a) * W * 0.5}px, ${(1 - Math.cos(a)) * H * 0.25}px) rotate(${(1 - p) * -40 + Math.sin(t * 1.1)}deg) scale(${0.75 + p * 0.25})`;
  }
  const slamBlur = cfg.entry === "slam" ? Math.max(0, 1 - spr(frame, cfg.entryAt, 11, 0.9, 170)) * 14 : 0;
  const float = Math.sin(t * 1.4) * 6;

  // --- textes
  const tx = portrait ? 0 : 1020;
  const ty = portrait ? 1235 : 340;
  const sloganLines = portrait ? [[WORDS[0], WORDS[1]], [WORDS[2]]] : [[WORDS[0]], [WORDS[1], WORDS[2]]];

  const body = (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at ${portrait ? 50 : 35}% 45%, ${w.bg[0]} 0%, ${w.bg[1]} 45%, ${w.bg[2]} 100%)` }}>
      <AbsoluteFill style={{ transform: `scale(${sceneScale})` }}>
        <LightShafts color={cfg.world === "cream" ? "255,240,210" : "255,215,150"} opacity={0.8} origin={[portrait ? 0.5 : 0.3, -0.2]} />
        <AbsoluteFill style={{ filter: rack ? `blur(${rack}px)` : undefined }}>
          <BeanCloud seed={`${cfg.product}-back`} count={pick(14, 12)} depth={[0, 0.55]} camX={camX} size={pick(85, 80)} />
        </AbsoluteFill>
        {cfg.extras === "caramel" && <CaramelSwirl cx={cx} cy={cy + 40} r={pick(560, 520)} opacity={tw(frame, 0.2, 1.0, 0, 0.9)} />}
        <Glow x={cx} y={cy} r={pick(560, 620)} color={w.light} />
        <Particles seed={`${cfg.product}-p`} count={50} color={cfg.world === "orange" ? "#ffe2b0" : GOLD.light} speed={0.5} />
        {/* produit */}
        <div style={{ position: "absolute", left: cx - (PH * P.ratio) / 2, top: cy - PH / 2 + float, transform: tf, filter: slamBlur ? `blur(${slamBlur}px)` : undefined }}>
          <Steam x={PH * P.ratio * 0.3} y={-PH * 0.42} w={PH * P.ratio * 0.4} h={PH * 0.5} from={cfg.entryAt + 0.8} />
          {cfg.extras === "splash" && <SplashCrown x={(PH * P.ratio) / 2} y={PH * 1.02} w={PH * P.ratio * pick(1.35, 1.12)} at={cfg.entryAt + 0.15} />}
          {cfg.extras === "caramel" && <SplashCrown x={(PH * P.ratio) / 2} y={PH * 1.02} w={PH * P.ratio * pick(1.3, 1.1)} at={cfg.entryAt + 0.2} color="#e9c08a" />}
          <Sachet src={P.src} ratio={P.ratio} height={PH} shineAt={[cfg.entryAt + 1.0, cfg.sloganAt + 0.6]} />
        </div>
        {cfg.extras === "cocoa" && <CocoaBurst at={0.05} cx={W / 2} cy={H / 2} />}
        <BeanCloud seed={`${cfg.product}-front`} count={4} depth={[0.85, 1]} camX={camX * 1.6} size={pick(110, 100)} edges />
      </AbsoluteFill>
      {/* textes */}
      <div style={{ position: "absolute", left: tx, top: ty, width: portrait ? W : 860, display: "flex", flexDirection: "column", alignItems: portrait ? "center" : "flex-start" }}>
        <LetterReveal text={P.name} at={cfg.nameAt} style={{ fontFamily: "Montserrat", fontWeight: 800, fontSize: pick(58, 54), color: cfg.world === "cream" ? "#5a2e10" : "#ffffff", textShadow: cfg.world === "cream" ? "none" : "0 6px 24px rgba(0,0,0,0.45)" }} />
        <div style={{ height: pick(26, 22) }} />
        <Slogan at={cfg.sloganAt} size={pick(84, 100)} lines={sloganLines} align={portrait ? "center" : "left"} dark={cfg.world === "cream"} />
      </div>
    </AbsoluteFill>
  );
  return cfg.entry === "orbit" ? <ClockWipe>{body}</ClockWipe> : body;
};

/* =================================================================== 05 — PACKSHOT FINAL */
export const Final: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 60;
  const { W, H, portrait, pick } = useLayout();
  const iris = tw(frame, 0, 0.7, 0, 1, EASE.inOut);
  const flash = tw(frame, 0.35, 0.55, 0, 1) * (1 - tw(frame, 0.55, 1.1, 0, 1));
  const orbit = 1 - tw(frame, 0, 2.6, 0, 1, EASE.out); // la caméra tourne puis se stabilise
  const items = portrait
    ? [
        { k: "threeInOne" as const, x: 290, y: 565, h: 470, z: 0.6, at: 0.25 },
        { k: "cappuccino" as const, x: 790, y: 565, h: 470, z: 0.6, at: 0.4 },
        { k: "latte" as const, x: 540, y: 1130, h: 580, z: 1, at: 0.55 },
      ]
    : [
        { k: "threeInOne" as const, x: 520, y: 550, h: 500, z: 0.6, at: 0.25 },
        { k: "cappuccino" as const, x: 1400, y: 550, h: 500, z: 0.6, at: 0.4 },
        { k: "latte" as const, x: 960, y: 560, h: 600, z: 1, at: 0.55 },
      ];
  const floorY = pick(860, 1440);
  return (
    <AbsoluteFill style={{ clipPath: iris < 1 ? `circle(${iris * Math.hypot(W, H)}px at 50% 50%)` : "none" }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 40%, #3a2010 0%, #160b05 50%, #050302 100%)" }} />
      <LightShafts color="255,210,140" opacity={0.9} origin={[0.5, -0.25]} />
      <Glow x={W / 2} y={pick(560, 900)} r={pick(820, 900)} color="rgba(255,200,120,0.45)" />
      {/* sol réfléchissant */}
      <div style={{ position: "absolute", left: 0, right: 0, top: floorY, bottom: 0, background: "linear-gradient(180deg, rgba(90,50,20,0.55) 0%, rgba(20,10,4,0.95) 100%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: floorY - 1, height: 2, background: "linear-gradient(90deg, transparent, rgba(255,215,150,0.6), transparent)" }} />
      {/* vagues de lait au sol */}
      <svg width={W} height={260} style={{ position: "absolute", left: 0, top: floorY - 60, overflow: "visible" }}>
        {[0, 1].map((k) => {
          let d = `M0 ${120}`;
          for (let x = 0; x <= W; x += 40) d += ` L${x} ${90 + k * 40 + Math.sin(x / 160 + t * (1.2 + k * 0.4) + k * 2) * 18}`;
          return <path key={k} d={`${d} L${W} 260 L0 260 Z`} fill={k ? "rgba(233,210,170,0.55)" : "rgba(255,250,240,0.35)"} />;
        })}
      </svg>
      <BeanCloud seed="final-back" count={pick(14, 12)} depth={[0, 0.45]} camX={orbit * 0.8} size={pick(80, 75)} />
      <Particles seed="final" count={60} speed={0.45} />
      {items.map((it, i) => {
        const P = PRODUCTS[it.k];
        const p = spr(frame, it.at, 14, 1, 95);
        const ox = orbit * (it.z - 0.8) * pick(-520, -300); // parallaxe : avant/arrière bougent différemment
        const sc = 1 + orbit * (it.z - 0.8) * 0.25;
        return (
          <div key={i} style={{ position: "absolute", left: it.x - (it.h * P.ratio) / 2 + ox, top: it.y - it.h / 2 + (1 - p) * H * 0.6 + Math.sin(t * 1.2 + i) * 4, transform: `scale(${sc * (0.9 + p * 0.1)})`, zIndex: it.z === 1 ? 3 : 2 }}>
            {i === 2 && <Steam x={it.h * P.ratio * 0.3} y={-it.h * 0.4} w={it.h * P.ratio * 0.4} h={it.h * 0.45} from={1.2} />}
            <Sachet src={P.src} ratio={P.ratio} height={it.h} shineAt={[1.6 + i * 0.15, 3.5]} reflection={portrait && it.z < 1 ? 0 : 0.22} />
          </div>
        );
      })}
      <BeanCloud seed="final-front" count={4} depth={[0.88, 1]} camX={orbit * 1.4} size={pick(100, 95)} edges />
      <div style={{ position: "absolute", left: 0, width: W, top: pick(40, 110), zIndex: 5 }}>
        <BrandReveal at={2.4} size={pick(118, 140)} />
      </div>
      <div style={{ position: "absolute", left: 0, width: W, top: pick(905, 1520), zIndex: 5 }}>
        <Slogan at={3.1} size={pick(96, 112)} lines={portrait ? [[WORDS[0], WORDS[1]], [WORDS[2]]] : [WORDS]} align="center" />
      </div>
      <AbsoluteFill style={{ background: "radial-gradient(circle, rgba(255,235,190,1) 0%, rgba(255,190,100,0.6) 45%, rgba(0,0,0,0) 80%)", opacity: flash, mixBlendMode: "screen" }} />
    </AbsoluteFill>
  );
};
