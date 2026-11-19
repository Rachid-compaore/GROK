import React from "react";
import { AbsoluteFill, Img, random, staticFile, useCurrentFrame } from "remotion";
import { Fruit } from "./Fruits";
import { EASE, FONT, FruitKind, sec, spr, tw } from "../theme";

/* ------------------------------------------------------------------ emballage */
/** Emballage original (image fournie) : jamais redessiné ni déformé. Ombre, reflet lumineux, reflet au sol. */
export const Pack: React.FC<{ src: string; height: number; shineAt?: number; reflection?: boolean }> = ({ src, height, shineAt, reflection = true }) => {
  const frame = useCurrentFrame();
  const width = height * 0.41;
  const shine = shineAt === undefined ? -1 : tw(frame, shineAt, shineAt + 0.8, -0.4, 1.4);
  return (
    <div style={{ position: "relative", width, height }}>
      <Img
        src={staticFile(src)}
        style={{ width, height, display: "block", borderRadius: 4, boxShadow: "0 40px 60px rgba(0,0,0,0.45), 0 10px 20px rgba(0,0,0,0.3)" }}
      />
      {shine > -0.4 && shine < 1.4 && (
        <div style={{ position: "absolute", inset: 0, overflow: "hidden", borderRadius: 4, mixBlendMode: "screen" }}>
          <div
            style={{
              position: "absolute",
              top: "-20%",
              height: "140%",
              left: `${shine * 100}%`,
              width: width * 0.35,
              transform: "translateX(-50%) rotate(16deg)",
              background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.5), rgba(255,255,255,0))",
            }}
          />
        </div>
      )}
      {reflection && (
        <Img
          src={staticFile(src)}
          style={{
            position: "absolute",
            top: height + 6,
            left: 0,
            width,
            height,
            transform: "scaleY(-1)",
            opacity: 0.18,
            WebkitMaskImage: "linear-gradient(0deg, rgba(0,0,0,0) 72%, rgba(0,0,0,1) 100%)",
            maskImage: "linear-gradient(0deg, rgba(0,0,0,0) 72%, rgba(0,0,0,1) 100%)",
          }}
        />
      )}
    </div>
  );
};

/* ------------------------------------------------------------------ tasse */
/** Tasse en verre de thé noir ambré, avec vapeur. */
export const TeaCup: React.FC<{ size: number; steamFrom?: number; fill?: number }> = ({ size, steamFrom = 0, fill = 1 }) => {
  const frame = useCurrentFrame();
  const t = frame / 60;
  const level = 32 + (1 - fill) * 60;
  return (
    <div style={{ position: "relative", width: size, height: size * 0.8 }}>
      <svg width={size} height={size * 0.8} viewBox="0 0 200 160" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs>
          <linearGradient id="tea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#d9481a" />
            <stop offset="0.5" stopColor="#a8260c" />
            <stop offset="1" stopColor="#5e1104" />
          </linearGradient>
          <linearGradient id="glass" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="rgba(255,255,255,0.55)" />
            <stop offset="0.15" stopColor="rgba(255,255,255,0.08)" />
            <stop offset="0.8" stopColor="rgba(255,255,255,0.05)" />
            <stop offset="1" stopColor="rgba(255,255,255,0.4)" />
          </linearGradient>
          <clipPath id="cupIn">
            <path d="M30 30 L170 30 L160 120 Q155 140 130 142 L70 142 Q45 140 40 120 Z" />
          </clipPath>
        </defs>
        <ellipse cx="100" cy="150" rx="92" ry="10" fill="rgba(255,255,255,0.18)" />
        <ellipse cx="100" cy="148" rx="80" ry="7" fill="rgba(0,0,0,0.25)" />
        <g clipPath="url(#cupIn)">
          <rect x="0" y={level} width="200" height="140" fill="url(#tea)" />
          <ellipse cx="100" cy={level} rx="80" ry="7" fill="#e8642e" opacity="0.9" />
          <ellipse cx={80 + Math.sin(t * 1.5) * 10} cy={level + 1} rx="26" ry="2.5" fill="rgba(255,220,180,0.55)" />
          <rect x="44" y={level + 20} width="10" height="80" fill="rgba(255,190,140,0.18)" />
        </g>
        <path d="M30 30 L170 30 L160 120 Q155 140 130 142 L70 142 Q45 140 40 120 Z" fill="url(#glass)" stroke="rgba(255,255,255,0.65)" strokeWidth="2.5" />
        <path d="M166 50 C200 48 202 100 160 104" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="9" strokeLinecap="round" />
        <path d="M166 50 C200 48 202 100 160 104" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="16" strokeLinecap="round" />
        <ellipse cx="100" cy="30" rx="70" ry="6" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2" />
      </svg>
      <Steam size={size} from={steamFrom} />
    </div>
  );
};

/** Vapeur : volutes recalculées à chaque image, douces et continues. */
export const Steam: React.FC<{ size: number; from: number }> = ({ size, from }) => {
  const frame = useCurrentFrame();
  const t = frame / 60 - from;
  const a = tw(frame, from, from + 0.8, 0, 1);
  if (a <= 0) return null;
  const Wd = size * 0.8, Hd = size * 0.9;
  return (
    <svg
      width={Wd}
      height={Hd}
      style={{
        position: "absolute",
        left: (size - Wd) / 2,
        top: -Hd + size * 0.14,
        opacity: a,
        overflow: "visible",
        WebkitMaskImage: "linear-gradient(0deg, transparent 0%, #000 20%, #000 45%, transparent 100%)",
        maskImage: "linear-gradient(0deg, transparent 0%, #000 20%, #000 45%, transparent 100%)",
      }}
    >
      {[0, 1, 2].map((k) => {
        const pts: string[] = [];
        for (let i = 0; i <= 30; i++) {
          const h = i / 30;
          const x = Wd * (0.33 + k * 0.17) + Math.sin(h * 6 + t * (1.2 + k * 0.2) + k * 2) * size * 0.05 * (0.3 + h);
          pts.push(`${x},${Hd - h * Hd}`);
        }
        return (
          <polyline
            key={k}
            points={pts.join(" ")}
            fill="none"
            stroke="rgba(255,255,255,0.55)"
            strokeWidth={size * 0.05}
            strokeLinecap="round"
            style={{ filter: `blur(${size * 0.025}px)` }}
          />
        );
      })}
    </svg>
  );
};

/* ------------------------------------------------------------------ fruits en mouvement */
type FlyProps = {
  seed: string;
  kinds: FruitKind[];
  count: number;
  at: number;
  /** zone de repos des fruits */
  area: { x: number; y: number; w: number; h: number };
  /** zone à laisser libre (le produit) */
  avoid?: { x: number; y: number; w: number; h: number };
  depth?: [number, number];
  sizeBase?: number;
  /** entrée depuis la gauche (1) ou la droite (-1) */
  dir?: number;
};

/**
 * Fruits qui traversent l'espace en « ralenti » puis flottent : arrivée sur une
 * trajectoire courbe avec ressort, rotation lente, profondeur de champ (flou selon z)
 * et parallaxe (les plus proches bougent plus).
 */
export const FruitFlight: React.FC<FlyProps> = ({ seed, kinds, count, at, area, avoid, depth = [0, 1], sizeBase = 120, dir = 1 }) => {
  const frame = useCurrentFrame();
  const t = frame / 60;
  const items = Array.from({ length: count }, (_, i) => {
    const r = (k: string) => random(`${seed}-${i}-${k}`);
    const z = depth[0] + (depth[1] - depth[0]) * r("z");
    let x = area.x + r("x") * area.w, y = area.y + r("y") * area.h;
    if (avoid && x > avoid.x && x < avoid.x + avoid.w && y > avoid.y && y < avoid.y + avoid.h) {
      x = x < avoid.x + avoid.w / 2 ? avoid.x - 40 - r("o") * 80 : avoid.x + avoid.w + 40 + r("o") * 80;
    }
    const delay = at + r("d") * 0.5;
    const p = spr(frame, delay, 18, 1.1, 60);
    const fromX = x - dir * (900 + z * 600), fromY = y + (r("fy") - 0.5) * 700;
    const cx = fromX + (x - fromX) * p, cy = fromY + (y - fromY) * p - Math.sin(Math.min(1, p) * Math.PI) * 120;
    const floatY = Math.sin(t * (0.8 + r("f") * 0.6) + r("ph") * 6) * (10 + z * 16);
    const par = (t - at) * (z - 0.5) * 24 * dir; // parallaxe
    const size = sizeBase * (0.45 + z * 0.9);
    const blur = Math.abs(z - 0.55) * 14 + (1 - Math.min(1, p)) * 8;
    const rot = r("r") * 360 + (t - at) * (r("vr") - 0.5) * 50 + (1 - p) * 140 * dir;
    return { i, z, x: cx + par, y: cy + floatY, size, blur, rot, kind: kinds[i % kinds.length], visible: frame >= sec(delay) };
  }).sort((a, b) => a.z - b.z);
  return (
    <>
      {items.map((it) =>
        it.visible ? (
          <div
            key={it.i}
            style={{
              position: "absolute",
              left: it.x - it.size / 2,
              top: it.y - it.size / 2,
              transform: `rotate(${it.rot}deg)`,
              filter: `blur(${it.blur}px) drop-shadow(0 ${12 + it.z * 20}px ${16 + it.z * 14}px rgba(0,0,0,0.35))`,
              zIndex: it.z > 0.7 ? 20 : 1,
            }}
          >
            <Fruit kind={it.kind} size={it.size} id={`${seed}${it.i}`} />
          </div>
        ) : null,
      )}
    </>
  );
};

/* ------------------------------------------------------------------ atmosphère */
/** Particules lumineuses qui dérivent lentement. */
export const Particles: React.FC<{ seed: string; count: number; color: string; speed?: number }> = ({ seed, count, color, speed = 1 }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen", pointerEvents: "none" }}>
      {Array.from({ length: count }, (_, i) => {
        const r = (k: string) => random(`${seed}${i}${k}`);
        const sz = 2 + r("s") * 6;
        const x = r("x") * 1920 + Math.sin(frame / 70 + r("p") * 6) * 30;
        const y = ((r("y") * 1180 - frame * (0.3 + r("v") * 0.9) * speed) % 1180 + 1180) % 1180 - 50;
        return (
          <div
            key={i}
            style={{ position: "absolute", left: x, top: y, width: sz, height: sz, borderRadius: "50%", background: color, boxShadow: `0 0 ${sz * 4}px ${color}`, opacity: 0.3 + r("o") * 0.5 }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Traînées de lumière fines qui traversent en diagonale. */
export const LightStreaks: React.FC<{ seed: string; at: number[]; color?: string }> = ({ seed, at, color = "255,240,200" }) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen", pointerEvents: "none", overflow: "hidden" }}>
      {at.map((a, i) => {
        const p = tw(frame, a, a + 0.9, 0, 1, EASE.inOut);
        if (p <= 0 || p >= 1) return null;
        const y = 150 + random(`${seed}${i}`) * 700;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: -600 + p * 3000,
              top: y,
              width: 600,
              height: 3,
              transform: "rotate(-14deg)",
              background: `linear-gradient(90deg, rgba(${color},0), rgba(${color},0.9), rgba(${color},0))`,
              boxShadow: `0 0 18px rgba(${color},0.8)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Halo de lumière. */
export const Glow: React.FC<{ x: number; y: number; r: number; color: string; opacity?: number }> = ({ x, y, r, color, opacity = 1 }) => (
  <div style={{ position: "absolute", left: x - r, top: y - r, width: 2 * r, height: 2 * r, borderRadius: "50%", background: `radial-gradient(circle, ${color} 0%, transparent 68%)`, opacity }} />
);

/* ------------------------------------------------------------------ typographie */
/** Lettres révélées une à une depuis un masque, avec espacement qui se resserre. */
export const LetterReveal: React.FC<{ text: string; at: number; style: React.CSSProperties; stagger?: number }> = ({ text, at, style, stagger = 0.035 }) => {
  const frame = useCurrentFrame();
  const track = tw(frame, at, at + 1.2, 0.25, 0, EASE.out);
  return (
    <div style={{ ...style, whiteSpace: "nowrap", letterSpacing: `${track}em` }}>
      {Array.from(text).map((ch, i) => {
        const p = tw(frame, at + i * stagger, at + i * stagger + 0.5, 0, 1, EASE.out);
        return (
          <span key={i} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top" }}>
            <span style={{ display: "inline-block", transform: `translateY(${(1 - p) * 110}%)` }}>{ch === " " ? " " : ch}</span>
          </span>
        );
      })}
    </div>
  );
};

/** Mots révélés par un masque, pour les accroches. */
export const WordReveal: React.FC<{ text: string; at: number; style: React.CSSProperties; stagger?: number }> = ({ text, at, style, stagger = 0.08 }) => {
  const frame = useCurrentFrame();
  return (
    <div style={style}>
      {text.split(" ").map((w, i) => {
        const p = tw(frame, at + i * stagger, at + i * stagger + 0.55, 0, 1, EASE.out);
        return (
          <span key={i} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top", marginRight: "0.28em", paddingBottom: "0.1em" }}>
            <span style={{ display: "inline-block", transform: `translateY(${(1 - p) * 110}%)` }}>{w}</span>
          </span>
        );
      })}
    </div>
  );
};

export { FONT };
