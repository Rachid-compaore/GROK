import React from "react";
import { AbsoluteFill, Img, random, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { FloatingLeaves, Glow, Hero, Particles, Steam, Streak } from "../components/Effects";
import { Landscape } from "../components/Landscape";
import { GlowLine, GoldBadge, LetterReveal } from "../components/Typo";
import { C, EASE, FONT, spr, tw } from "../theme";

const BOXES = { src: "img/boites.png", ratio: 1064 / 1016 };
const GLASSES = { src: "img/verres.png", ratio: 852 / 888 };
const LOGO = { src: "img/logo-kouma.png", ratio: 1400 / 600 };

/** Masque d'ouverture en iris avec éclat de lumière (début de scène). */
const Iris: React.FC<{ children: React.ReactNode; dur?: number; at?: [number, number]; flash?: boolean }> = ({ children, dur = 0.7, at = [50, 50], flash = true }) => {
  const frame = useCurrentFrame();
  const k = tw(frame, 0, dur, 0, 1, EASE.inOut);
  const f = flash ? tw(frame, dur * 0.5, dur * 0.8, 0, 1) * (1 - tw(frame, dur * 0.8, dur + 0.4, 0, 1)) : 0;
  return (
    <AbsoluteFill style={{ clipPath: k < 1 ? `circle(${k * 1200}px at ${at[0]}% ${at[1]}%)` : "none" }}>
      {children}
      {f > 0 && <AbsoluteFill style={{ background: "radial-gradient(circle, rgba(255,245,210,0.95) 0%, transparent 65%)", opacity: f * 0.7, mixBlendMode: "screen" }} />}
    </AbsoluteFill>
  );
};

/** Logo Kouma (image originale) : pop en ressort + reflet. */
const KoumaLogo: React.FC<{ at: number; width: number; shineAt: number }> = ({ at, width, shineAt }) => {
  const frame = useCurrentFrame();
  const p = spr(frame, at, 12, 0.8, 130);
  return (
    <div style={{ transform: `scale(${p}) rotate(${(1 - p) * -6}deg)`, transformOrigin: "50% 60%", filter: "drop-shadow(0 18px 24px rgba(60,0,0,0.35))" }}>
      <Hero src={LOGO.src} width={width} height={width / LOGO.ratio} shineAt={[shineAt]} shadow={false} />
    </div>
  );
};

/* =============================================================== SCÈNE 1 — INTRO (0–4 s) */
export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const cam = tw(frame, 0, 4.4, 0, 0.45, EASE.soft);
  const fadeIn = 1 - tw(frame, 0, 1.0, 0, 1, EASE.soft);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${1.12 - cam * 0.12}) translateY(${-cam * 30}px)` }}>
        <Landscape cam={cam} sunY={tw(frame, 0, 4.4, 430, 360, EASE.soft)} rays={tw(frame, 0.3, 2.0, 0, 1)} />
      </AbsoluteFill>
      <FloatingLeaves seed="intro" count={7} depth={[0.2, 0.8]} drift={[-60, -15]} sizeBase={70} />
      <Particles seed="intro" count={30} color="#fff2c0" speed={0.4} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(40,5,0,0.45) 100%)" }} />
      <div style={{ position: "absolute", top: 390, left: 0, width: 1920, display: "flex", justifyContent: "center" }}>
        <LetterReveal
          text="L'essence d'un thé authentique…"
          at={1.0}
          stagger={0.035}
          exitAt={3.5}
          style={{ fontFamily: FONT.serif, fontStyle: "italic", fontWeight: 600, fontSize: 92, color: C.cream, textShadow: "0 6px 30px rgba(80,20,0,0.6)" }}
        />
      </div>
      <AbsoluteFill style={{ background: "#000", opacity: fadeIn }} />
    </AbsoluteFill>
  );
};

/* =============================================================== SCÈNE 2 — IMMERSION (4–8 s) */
export const Immersion: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 60;
  const push = tw(frame, 0, 4.7, 1.0, 1.12, EASE.soft);
  const phrases = ["Un goût.", "Une tradition.", "Une qualité."];
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, #5aa82c 0%, #2b7a1a 35%, #0b3a0c 100%)" }}>
      {/* bokeh */}
      {Array.from({ length: 16 }, (_, i) => {
        const r = (k: string) => random(`bk${i}${k}`);
        const s = 60 + r("s") * 180;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: r("x") * 1920 + Math.sin(t * 0.4 + i) * 30,
              top: r("y") * 1080 + Math.cos(t * 0.3 + i) * 20,
              width: s,
              height: s,
              borderRadius: "50%",
              background: i % 3 ? "radial-gradient(circle, rgba(220,255,160,0.35), rgba(220,255,160,0) 70%)" : "radial-gradient(circle, rgba(255,220,130,0.4), rgba(255,220,130,0) 70%)",
              filter: "blur(6px)",
            }}
          />
        );
      })}
      <AbsoluteFill style={{ transform: `scale(${push})` }}>
        <FloatingLeaves seed="imm-back" count={14} depth={[0, 0.45]} drift={[-30, -20]} sizeBase={120} />
        <Glow x={960} y={540} r={620} color="rgba(255,240,170,0.35)" />
        <FloatingLeaves seed="imm-front" count={6} depth={[0.8, 1]} drift={[-80, -30]} sizeBase={190} />
      </AbsoluteFill>
      <Streak at={1.2} y={300} />
      <Streak at={2.6} y={720} />
      <div style={{ position: "absolute", top: 470, left: 0, width: 1920, display: "flex", justifyContent: "center", gap: 36 }}>
        {phrases.map((p, i) => (
          <GlowLine key={p} text={p} at={0.7 + i * 0.75} exitAt={3.9} style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 76, color: "#ffffff", textShadow: "0 6px 26px rgba(0,40,0,0.5)" }} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

/* =============================================================== SCÈNE 3 — REVEAL (8–14 s) */
export const Reveal: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const dur = durationInFrames / 60;
  const orbit = tw(frame, 0, dur, 0, 1, EASE.soft); // caméra « circulaire » simulée
  const rise = spr(frame, 0.45, 15, 1.1, 80);
  const BH = 660, BW = BH * BOXES.ratio;
  return (
    <Iris dur={0.75}>
      <AbsoluteFill>
        <AbsoluteFill style={{ transform: `translateX(${orbit * 90}px) scale(1.08)`, filter: "blur(3px) saturate(1.1)" }}>
          <Landscape cam={0.55 + orbit * 0.15} sunY={330} />
        </AbsoluteFill>
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at 32% 55%, rgba(0,0,0,0) 30%, rgba(20,10,0,0.55) 100%)" }} />
        <Glow x={640} y={560} r={620} color="rgba(255,236,170,0.75)" opacity={rise} />
        <Particles seed="reveal" count={40} color="#ffe9a8" speed={0.5} />
        <div
          style={{
            position: "absolute",
            left: 640 - BW / 2,
            top: 560 - BH / 2,
            transform: `translateY(${(1 - rise) * 520}px) translateX(${(0.5 - orbit) * 70}px) scale(${(0.9 + rise * 0.1) * (1 + orbit * 0.06)}) rotate(${(1 - rise) * -4}deg)`,
          }}
        >
          <Hero src={BOXES.src} width={BW} height={BH} shineAt={[1.9, 4.6]} reflection />
        </div>
        <FloatingLeaves seed="rev-front" count={4} depth={[0.85, 1]} drift={[-50, -15]} sizeBase={150} />
        <Streak at={1.4} y={180} />
        <div style={{ position: "absolute", left: 1110, top: 210, width: 680, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <KoumaLogo at={1.6} width={640} shineAt={2.6} />
          <div style={{ height: 40 }} />
          <LetterReveal
            text="THÉ VERT DE CHINE"
            at={2.4}
            stagger={0.035}
            style={{ fontFamily: FONT.cond, fontWeight: 800, fontSize: 92, color: "#ffffff", textShadow: "3px 5px 0 #1d2a10, 0 10px 30px rgba(0,0,0,0.45)" }}
          />
        </div>
      </AbsoluteFill>
    </Iris>
  );
};

/* =============================================================== SCÈNE 4 — EXPÉRIENCE (14–19 s) */
export const Experience: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const dur = durationInFrames / 60;
  const wipe = tw(frame, 0, 0.75, 0, 1, EASE.inOut);
  const push = tw(frame, 0, dur, 1.0, 1.07, EASE.soft);
  const g = spr(frame, 0.3, 16, 1, 80);
  const GH = 740, GW = GH * GLASSES.ratio;
  const gx = 1390 - GW / 2, gy = 560 - GH / 2;
  const x = -400 + wipe * 3000;
  return (
    <AbsoluteFill style={{ clipPath: wipe < 1 ? `polygon(0 0, ${x}px 0, ${x - 500}px 1080px, 0 1080px)` : "none" }}>
      <AbsoluteFill style={{ filter: "blur(7px) brightness(0.8)", transform: "scale(1.1)" }}>
        <Landscape cam={0.8} sunY={300} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(10,30,5,0.75) 0%, rgba(10,30,5,0.35) 45%, rgba(60,20,0,0.1) 100%)" }} />
      <FloatingLeaves seed="exp-back" count={10} depth={[0, 0.4]} drift={[-25, -18]} sizeBase={110} />
      <Glow x={1390} y={600} r={560} color="rgba(255,170,60,0.55)" />
      <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "72% 55%" }}>
        <div style={{ position: "absolute", left: gx, top: gy + (1 - g) * 300, transform: `scale(${0.92 + g * 0.08})` }}>
          <Hero src={GLASSES.src} width={GW} height={GH} shineAt={[1.0, 3.3]} reflection />
          <Steam x={GW * 0.27 - 90} y={-200} w={180} h={300} from={0.9} />
          <Steam x={GW * 0.71 - 100} y={GH * 0.28 - 280} w={200} h={320} from={1.2} />
        </div>
      </AbsoluteFill>
      <Particles seed="exp" count={26} color="#ffd890" speed={0.5} />
      <div style={{ position: "absolute", left: 140, top: 360 }}>
        <GlowLine text="Une expérience unique" at={1.0} style={{ fontFamily: FONT.serif, fontStyle: "italic", fontWeight: 600, fontSize: 86, color: C.cream, textShadow: "0 6px 26px rgba(0,0,0,0.5)" }} />
        <GlowLine text="à chaque tasse." at={1.35} style={{ fontFamily: FONT.serif, fontStyle: "italic", fontWeight: 600, fontSize: 86, color: C.gold, textShadow: "0 6px 26px rgba(0,0,0,0.5)" }} />
        <div style={{ height: 4, width: tw(frame, 1.9, 2.6, 0, 260, EASE.out), background: C.gold, marginTop: 24, borderRadius: 2 }} />
      </div>
    </AbsoluteFill>
  );
};

/* =============================================================== SCÈNE 5 — FINAL (19–25 s) */
export const Final: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const dur = durationInFrames / 60;
  const t = frame / 60;
  const travel = tw(frame, 0, dur, 1.0, 1.05, EASE.soft);
  const boxes = spr(frame, 0.35, 15, 1, 90);
  const glasses = spr(frame, 0.6, 15, 1, 90);
  const DISP = 3.0;
  const d = spr(frame, DISP, 10, 0.9, 140);
  const band = tw(frame, DISP - 0.15, DISP + 0.35, 0, 1, EASE.out);
  const ring = tw(frame, DISP, DISP + 0.8, 0, 1, EASE.out);
  const BH = 560, BW = BH * BOXES.ratio, GH = 470, GW = GH * GLASSES.ratio;
  return (
    <Iris dur={0.7} at={[35, 60]}>
      <AbsoluteFill>
        <AbsoluteFill style={{ transform: `scale(${travel * 1.05})` }}>
          <Landscape cam={0.25 + (travel - 1) * 4} sunY={340} />
        </AbsoluteFill>
        <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(0,0,0,0) 45%, rgba(10,40,5,0.55) 100%)" }} />
        {/* lumière animée derrière le produit */}
        <AbsoluteFill
          style={{
            background: "repeating-conic-gradient(from 0deg at 33% 62%, rgba(255,245,200,0.22) 0deg 4deg, rgba(255,245,200,0) 4deg 12deg)",
            transform: `rotate(${t * 4}deg)`,
            transformOrigin: "33% 62%",
            mixBlendMode: "screen",
            WebkitMaskImage: "radial-gradient(circle at 33% 62%, #000 0%, transparent 55%)",
            maskImage: "radial-gradient(circle at 33% 62%, #000 0%, transparent 55%)",
          }}
        />
        <Glow x={620} y={640} r={560} color="rgba(255,240,180,0.7)" />
        <Particles seed="final" count={36} color="#fff0c0" speed={0.5} />
        <AbsoluteFill style={{ transform: `scale(${travel})`, transformOrigin: "33% 62%" }}>
          <div style={{ position: "absolute", left: 90, top: 380 + (1 - boxes) * 500, transform: `rotate(${(1 - boxes) * -5}deg)` }}>
            <Hero src={BOXES.src} width={BW} height={BH} shineAt={[1.3, 3.4]} reflection />
          </div>
          <div style={{ position: "absolute", left: 700, top: 520 + (1 - glasses) * 500 }}>
            <Hero src={GLASSES.src} width={GW} height={GH} shineAt={[1.6]} reflection />
            <Steam x={GW * 0.27 - 60} y={-150} w={120} h={210} from={1.2} />
            <Steam x={GW * 0.71 - 70} y={GH * 0.28 - 200} w={140} h={230} from={1.4} />
          </div>
        </AbsoluteFill>
        {/* colonne de textes */}
        <div style={{ position: "absolute", left: 1120, top: 90, width: 740, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <KoumaLogo at={0.8} width={560} shineAt={1.8} />
          <div style={{ height: 22 }} />
          <LetterReveal text="THÉ VERT DE CHINE" at={1.3} stagger={0.03} style={{ fontFamily: FONT.cond, fontWeight: 800, fontSize: 82, color: "#ffffff", textShadow: "3px 5px 0 #1d2a10, 0 10px 30px rgba(0,0,0,0.45)" }} />
          <div style={{ height: 18 }} />
          <GoldBadge at={1.9} text="QUALITÉ SUPÉRIEUR" />
          <div style={{ height: 50 }} />
          {/* DISPONIBLE : bandeau vert, frappe en ressort, onde de choc */}
          <div style={{ position: "relative", width: 740, height: 150, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ position: "absolute", inset: "14px 0", background: `linear-gradient(180deg, ${C.green}, ${C.greenDeep})`, borderRadius: 18, transform: `scaleX(${band})`, boxShadow: "0 18px 40px rgba(0,30,0,0.45)", border: `3px solid ${C.gold}` }} />
            {ring > 0 && ring < 1 && (
              <div style={{ position: "absolute", left: "50%", top: "50%", width: 700 * ring + 200, height: 700 * ring + 200, marginLeft: -(350 * ring + 100), marginTop: -(350 * ring + 100), borderRadius: "50%", border: `${6 * (1 - ring)}px solid rgba(255,240,180,${1 - ring})` }} />
            )}
            <div style={{ position: "relative", fontFamily: FONT.sans, fontWeight: 900, fontSize: 96, color: "#ffffff", letterSpacing: 3, transform: `scale(${d})`, textShadow: "0 6px 0 rgba(0,40,0,0.5)" }}>
              DISPONIBLE
            </div>
          </div>
        </div>
        <div style={{ position: "absolute", right: 40, top: 30, transform: `scale(${spr(frame, 2.4, 14, 0.8, 120)})` }}>
          <Img src={staticFile("img/logo-distributeur.png")} style={{ width: 92 }} />
        </div>
        <AbsoluteFill style={{ background: "#000", opacity: tw(frame, dur - 0.35, dur, 0, 1) }} />
      </AbsoluteFill>
    </Iris>
  );
};
