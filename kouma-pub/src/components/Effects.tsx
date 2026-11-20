import React from "react";
import { AbsoluteFill, Img, random, staticFile, useCurrentFrame } from "remotion";
import { EASE, tw } from "../theme";

/* ------------------------------------------------------------- feuilles de thé */
export const Leaf: React.FC<{ size: number; id: string; tone?: number }> = ({ size, id, tone = 0 }) => (
  <svg width={size} height={size * 0.5} viewBox="0 0 120 60" style={{ overflow: "visible" }}>
    <defs>
      <linearGradient id={`lf${id}`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={tone ? "#9bd45a" : "#6cbf3a"} />
        <stop offset="1" stopColor={tone ? "#3d8a22" : "#1f6a17"} />
      </linearGradient>
    </defs>
    <path d="M2 30 C20 4 70 -2 118 30 C70 62 20 56 2 30Z" fill={`url(#lf${id})`} />
    <path d="M2 30 Q60 26 118 30" stroke="rgba(230,255,200,0.75)" strokeWidth="2" fill="none" />
    {[22, 40, 58, 76, 94].map((x) => (
      <path key={x} d={`M${x} 29 Q${x + 8} 18 ${x + 16} 12 M${x} 31 Q${x + 8} 42 ${x + 16} 48`} stroke="rgba(230,255,200,0.45)" strokeWidth="1.2" fill="none" />
    ))}
    <ellipse cx="50" cy="20" rx="26" ry="5" fill="rgba(255,255,255,0.18)" transform="rotate(-10 50 20)" />
  </svg>
);

/** Feuilles qui flottent en profondeur : flou selon la distance, dérive lente, rotation. */
export const FloatingLeaves: React.FC<{
  seed: string;
  count: number;
  depth?: [number, number];
  speed?: number;
  drift?: [number, number];
  sizeBase?: number;
  opacity?: number;
}> = ({ seed, count, depth = [0, 1], speed = 1, drift = [-40, -10], sizeBase = 120, opacity = 1 }) => {
  const frame = useCurrentFrame();
  const t = frame / 60;
  const items = Array.from({ length: count }, (_, i) => {
    const r = (k: string) => random(`${seed}${i}${k}`);
    const z = depth[0] + (depth[1] - depth[0]) * r("z");
    const size = sizeBase * (0.4 + z * 1.2);
    const x = ((r("x") * 2300 + t * drift[0] * (0.4 + z) * speed) % 2300 + 2300) % 2300 - 200;
    const y = ((r("y") * 1400 + t * drift[1] * (0.4 + z) * speed + Math.sin(t * 0.8 + r("p") * 6) * 40) % 1400 + 1400) % 1400 - 160;
    return { i, z, size, x, y, rot: r("r") * 360 + t * (r("v") - 0.5) * 60, flip: Math.cos(t * (0.6 + r("f")) + r("q") * 6), blur: Math.abs(z - 0.5) * 16, tone: r("t") > 0.5 ? 1 : 0 };
  }).sort((a, b) => a.z - b.z);
  return (
    <AbsoluteFill style={{ opacity, pointerEvents: "none" }}>
      {items.map((l) => (
        <div
          key={l.i}
          style={{
            position: "absolute",
            left: l.x,
            top: l.y,
            transform: `rotate(${l.rot}deg) scaleY(${0.35 + 0.65 * Math.abs(l.flip)})`,
            filter: `blur(${l.blur}px) drop-shadow(0 ${8 + l.z * 16}px ${10 + l.z * 12}px rgba(0,30,0,0.35))`,
          }}
        >
          <Leaf size={l.size} id={`${seed}${l.i}`} tone={l.tone} />
        </div>
      ))}
    </AbsoluteFill>
  );
};

/** Vague de feuilles qui balaie tout l'écran (transition « par particules »). */
export const LeafSweep: React.FC<{ at: number; dur?: number; dir?: 1 | -1 }> = ({ at, dur = 1.0, dir = -1 }) => {
  const frame = useCurrentFrame();
  const p = tw(frame, at, at + dur, 0, 1, EASE.inOut);
  if (p <= 0 || p >= 1) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 50 }}>
      {Array.from({ length: 46 }, (_, i) => {
        const r = (k: string) => random(`sw${at}${i}${k}`);
        const lag = r("l") * 0.35;
        const q = Math.min(1, Math.max(0, (p - lag) / 0.65));
        const x = dir < 0 ? 2300 - q * 3000 + r("x") * 300 : -380 + q * 3000 - r("x") * 300;
        const y = r("y") * 1300 - 150 + Math.sin(q * 6 + r("p") * 6) * 60;
        const size = 160 + r("s") * 260;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, transform: `rotate(${r("r") * 360 + q * 200 * dir}deg)`, filter: `blur(${r("b") * 4}px)` }}>
            <Leaf size={size} id={`sw${i}`} tone={i % 2} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------- lumière */
export const Glow: React.FC<{ x: number; y: number; r: number; color: string; opacity?: number }> = ({ x, y, r, color, opacity = 1 }) => (
  <div style={{ position: "absolute", left: x - r, top: y - r, width: 2 * r, height: 2 * r, borderRadius: "50%", background: `radial-gradient(circle, ${color} 0%, transparent 68%)`, opacity, pointerEvents: "none" }} />
);

export const Particles: React.FC<{ seed: string; count: number; color: string; speed?: number }> = ({ seed, count, color, speed = 1 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen", pointerEvents: "none" }}>
      {Array.from({ length: count }, (_, i) => {
        const r = (k: string) => random(`${seed}${i}${k}`);
        const sz = 2 + r("s") * 5;
        const x = r("x") * 1920 + Math.sin(frame / 80 + r("p") * 6) * 30;
        const y = ((r("y") * 1180 - frame * (0.25 + r("v") * 0.7) * speed) % 1180 + 1180) % 1180 - 50;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: sz, height: sz, borderRadius: "50%", background: color, boxShadow: `0 0 ${sz * 4}px ${color}`, opacity: 0.35 + r("o") * 0.5 }} />;
      })}
    </AbsoluteFill>
  );
};

/** Image découpée (produit, verres) avec reflet lumineux qui la balaie, masqué par sa propre forme. */
export const Hero: React.FC<{ src: string; width: number; height: number; shineAt?: number[]; reflection?: boolean; shadow?: boolean }> = ({
  src,
  width,
  height,
  shineAt = [],
  reflection = false,
  shadow = true,
}) => {
  const frame = useCurrentFrame();
  const url = staticFile(src);
  return (
    <div style={{ position: "relative", width, height }}>
      {shadow && (
        <div style={{ position: "absolute", left: width * 0.06, right: width * 0.06, bottom: -height * 0.03, height: height * 0.08, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(0,20,0,0.5) 0%, rgba(0,20,0,0) 70%)", filter: "blur(6px)" }} />
      )}
      {reflection && (
        <Img
          src={url}
          style={{
            position: "absolute",
            top: height - 4,
            left: 0,
            width,
            height,
            transform: "scaleY(-1)",
            opacity: 0.2,
            WebkitMaskImage: "linear-gradient(0deg, transparent 75%, #000 100%)",
            maskImage: "linear-gradient(0deg, transparent 75%, #000 100%)",
          }}
        />
      )}
      <Img src={url} style={{ position: "absolute", inset: 0, width, height }} />
      <div style={{ position: "absolute", inset: 0, WebkitMaskImage: `url(${url})`, WebkitMaskSize: "100% 100%", maskImage: `url(${url})`, maskSize: "100% 100%", overflow: "hidden", mixBlendMode: "screen" }}>
        {shineAt.map((a, i) => {
          const x = tw(frame, a, a + 0.9, -0.4, 1.4);
          if (x <= -0.4 || x >= 1.4) return null;
          return (
            <div key={i} style={{ position: "absolute", top: "-20%", height: "140%", left: `${x * 100}%`, width: width * 0.25, transform: "translateX(-50%) rotate(18deg)", background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,250,230,0.55), rgba(255,255,255,0))" }} />
          );
        })}
      </div>
    </div>
  );
};

/** Vapeur : volutes douces recalculées à chaque image. */
export const Steam: React.FC<{ x: number; y: number; w: number; h: number; from: number; strands?: number }> = ({ x, y, w, h, from, strands = 3 }) => {
  const frame = useCurrentFrame();
  const t = frame / 60 - from;
  const a = tw(frame, from, from + 1.0, 0, 1);
  if (a <= 0) return null;
  return (
    <svg
      width={w}
      height={h}
      style={{ position: "absolute", left: x, top: y, opacity: a, overflow: "visible", WebkitMaskImage: "linear-gradient(0deg, transparent 0%, #000 18%, #000 45%, transparent 100%)", maskImage: "linear-gradient(0deg, transparent 0%, #000 18%, #000 45%, transparent 100%)" }}
    >
      {Array.from({ length: strands }, (_, k) => {
        const pts: string[] = [];
        for (let i = 0; i <= 32; i++) {
          const hh = i / 32;
          const px = w * ((k + 0.5) / strands) + Math.sin(hh * 6 + t * (1.1 + k * 0.17) + k * 2.3) * w * 0.08 * (0.3 + hh);
          pts.push(`${px},${h - hh * h}`);
        }
        return <polyline key={k} points={pts.join(" ")} fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth={w * 0.07} strokeLinecap="round" style={{ filter: `blur(${w * 0.035}px)` }} />;
      })}
    </svg>
  );
};

/** Traînée de lumière fine qui traverse en diagonale. */
export const Streak: React.FC<{ at: number; y: number }> = ({ at, y }) => {
  const frame = useCurrentFrame();
  const p = tw(frame, at, at + 0.9, 0, 1);
  if (p <= 0 || p >= 1) return null;
  return (
    <div style={{ position: "absolute", left: -700 + p * 3200, top: y, width: 700, height: 3, transform: "rotate(-12deg)", background: "linear-gradient(90deg, rgba(255,240,200,0), rgba(255,240,200,0.9), rgba(255,240,200,0))", boxShadow: "0 0 18px rgba(255,230,170,0.8)", mixBlendMode: "screen", pointerEvents: "none" }} />
  );
};
