import React from "react";
import { AbsoluteFill, Img, random, staticFile, useCurrentFrame } from "remotion";
import { Bean } from "./Bean";
import { EASE, tw, useLayout } from "../theme";

/* --------------------------------------------------------------- lumière */
export const Glow: React.FC<{ x: number; y: number; r: number; color: string; opacity?: number }> = ({ x, y, r, color, opacity = 1 }) => (
  <div style={{ position: "absolute", left: x - r, top: y - r, width: 2 * r, height: 2 * r, borderRadius: "50%", background: `radial-gradient(circle, ${color} 0%, transparent 68%)`, opacity, pointerEvents: "none" }} />
);

/** Lumière volumétrique : faisceaux obliques qui respirent lentement. */
export const LightShafts: React.FC<{ color?: string; opacity?: number; origin?: [number, number] }> = ({ color = "255,220,150", opacity = 1, origin = [0.7, -0.1] }) => {
  const frame = useCurrentFrame();
  const { W, H } = useLayout();
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen", opacity, pointerEvents: "none", overflow: "hidden" }}>
      {[0, 1, 2, 3, 4].map((i) => {
        const a = 18 + i * 9 + Math.sin(frame / 90 + i) * 2;
        const w = 90 + i * 40;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: W * origin[0] - w / 2,
              top: H * origin[1],
              width: w,
              height: Math.hypot(W, H) * 1.2,
              transformOrigin: "50% 0",
              transform: `rotate(${a}deg)`,
              background: `linear-gradient(180deg, rgba(${color},${0.28 - i * 0.03}) 0%, rgba(${color},0) 85%)`,
              filter: "blur(18px)",
              opacity: 0.6 + Math.sin(frame / 50 + i * 1.7) * 0.25,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Particules dorées en suspension. */
export const Particles: React.FC<{ seed: string; count: number; color?: string; speed?: number }> = ({ seed, count, color = "#ffe39a", speed = 1 }) => {
  const frame = useCurrentFrame();
  const { W, H } = useLayout();
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen", pointerEvents: "none" }}>
      {Array.from({ length: count }, (_, i) => {
        const r = (k: string) => random(`${seed}${i}${k}`);
        const sz = 2 + r("s") * 5;
        const x = r("x") * W + Math.sin(frame / 80 + r("p") * 6) * 30;
        const y = ((r("y") * (H + 100) - frame * (0.25 + r("v") * 0.7) * speed) % (H + 100) + H + 100) % (H + 100) - 50;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: sz, height: sz, borderRadius: "50%", background: color, boxShadow: `0 0 ${sz * 4}px ${color}`, opacity: 0.35 + r("o") * 0.55 }} />;
      })}
    </AbsoluteFill>
  );
};

/** Grains de café en suspension, profondeur de champ (flou selon z) et parallaxe. */
export const BeanCloud: React.FC<{ seed: string; count: number; depth?: [number, number]; drift?: number; camX?: number; camZ?: number; size?: number; edges?: boolean }> = ({
  seed,
  edges = false,
  count,
  depth = [0, 1],
  drift = 1,
  camX = 0,
  camZ = 0,
  size = 90,
}) => {
  const frame = useCurrentFrame();
  const { W, H } = useLayout();
  const t = frame / 60;
  const items = Array.from({ length: count }, (_, i) => {
    const r = (k: string) => random(`${seed}${i}${k}`);
    const z = depth[0] + (depth[1] - depth[0]) * r("z");
    const persp = 1 + camZ * (0.3 + z * 1.4); // dolly : les grains proches grossissent plus vite
    const bx = (r("x") - 0.5) * W * 1.3;
    let by = (r("y") - 0.5) * H * 1.2;
    if (edges) by = Math.sign(by || 1) * (H * 0.43 + Math.abs(by) * 0.15); // bandes haute et basse : jamais devant le produit
    const x = W / 2 + bx * persp - camX * (0.3 + z) * 300 + Math.sin(t * 0.5 + r("p") * 6) * 20 * drift;
    const y = H / 2 + by * persp - t * (6 + z * 10) * drift + Math.cos(t * 0.4 + r("q") * 6) * 14 * drift;
    const s = size * (0.35 + z * 1.0) * persp;
    return { i, z, x, y, s, blur: Math.abs(z - 0.5) * 14, rot: r("r") * 360 + t * (r("v") - 0.5) * 40 * drift, spin: r("sp") * 6 + t * (r("vs") - 0.5) * drift };
  }).sort((a, b) => a.z - b.z);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {items.map((b) => (
        <div key={b.i} style={{ position: "absolute", left: b.x - b.s / 2, top: b.y - b.s * 0.65, transform: `rotate(${b.rot}deg)`, filter: `blur(${b.blur}px) drop-shadow(0 ${8 + b.z * 16}px ${10 + b.z * 12}px rgba(0,0,0,0.45))` }}>
          <Bean size={b.s} id={`${seed}${b.i}`} spin={b.spin} />
        </div>
      ))}
    </AbsoluteFill>
  );
};

/** Vapeur douce. */
export const Steam: React.FC<{ x: number; y: number; w: number; h: number; from?: number; strands?: number }> = ({ x, y, w, h, from = 0, strands = 3 }) => {
  const frame = useCurrentFrame();
  const t = frame / 60 - from;
  const a = tw(frame, from, from + 1.0, 0, 1);
  if (a <= 0) return null;
  return (
    <svg width={w} height={h} style={{ position: "absolute", left: x, top: y, opacity: a, overflow: "visible", WebkitMaskImage: "linear-gradient(0deg, transparent 0%, #000 20%, #000 45%, transparent 100%)", maskImage: "linear-gradient(0deg, transparent 0%, #000 20%, #000 45%, transparent 100%)" }}>
      {Array.from({ length: strands }, (_, k) => {
        const pts: string[] = [];
        for (let i = 0; i <= 30; i++) {
          const hh = i / 30;
          pts.push(`${w * ((k + 0.5) / strands) + Math.sin(hh * 6 + t * (1.1 + k * 0.17) + k * 2.3) * w * 0.09 * (0.3 + hh)},${h - hh * h}`);
        }
        return <polyline key={k} points={pts.join(" ")} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={w * 0.08} strokeLinecap="round" style={{ filter: `blur(${w * 0.04}px)` }} />;
      })}
    </svg>
  );
};

/* --------------------------------------------------------------- produit */
/** Sachet original : ombre au sol, reflet, balayage lumineux masqué par sa forme. Aucune retouche. */
export const Sachet: React.FC<{ src: string; ratio: number; height: number; shineAt?: number[]; reflection?: number; shadow?: number }> = ({ src, ratio, height, shineAt = [], reflection = 0, shadow = 1 }) => {
  const frame = useCurrentFrame();
  const url = staticFile(src);
  const width = height * ratio;
  return (
    <div style={{ position: "relative", width, height }}>
      <div style={{ position: "absolute", left: width * 0.08, right: width * 0.08, bottom: -height * 0.05, height: height * 0.1, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 70%)", filter: "blur(10px)", opacity: shadow }} />
      {reflection > 0 && (
        <div style={{ position: "absolute", top: height - 2, left: 0, width, height, opacity: reflection, WebkitMaskImage: "linear-gradient(180deg, #000 0%, transparent 32%)", maskImage: "linear-gradient(180deg, #000 0%, transparent 32%)" }}>
          <Img src={url} style={{ width, height, transform: "scaleY(-1)" }} />
        </div>
      )}
      <Img src={url} style={{ position: "absolute", inset: 0, width, height, filter: `drop-shadow(0 ${height * 0.04}px ${height * 0.05}px rgba(0,0,0,0.5))` }} />
      <div style={{ position: "absolute", inset: 0, WebkitMaskImage: `url(${url})`, WebkitMaskSize: "100% 100%", maskImage: `url(${url})`, maskSize: "100% 100%", overflow: "hidden", mixBlendMode: "screen" }}>
        {shineAt.map((a, i) => {
          const x = tw(frame, a, a + 0.9, -0.4, 1.4);
          if (x <= -0.4 || x >= 1.4) return null;
          return <div key={i} style={{ position: "absolute", top: "-30%", height: "160%", left: `${x * 100}%`, width: width * 0.28, transform: "translateX(-50%) rotate(20deg)", background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,250,235,0.6), rgba(255,255,255,0))" }} />;
        })}
      </div>
    </div>
  );
};

export { EASE };
