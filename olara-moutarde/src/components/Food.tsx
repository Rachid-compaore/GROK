import React from "react";
import { random } from "remotion";
import { C } from "../theme";

/* Éléments culinaires en vue de dessus, dessinés en SVG (dégradés, reflets, ombres)
 * pour une mise en scène « flat-lay » éditoriale. Coordonnées locales, centre (0,0). */

export const Plate: React.FC<{ r: number }> = ({ r }) => (
  <g>
    <circle cx={r * 0.04} cy={r * 0.07} r={r * 1.02} fill="rgba(0,0,0,0.55)" style={{ filter: `blur(${r * 0.06}px)` }} />
    <circle r={r} fill="url(#plateRim)" />
    <circle r={r * 0.74} fill="url(#plateWell)" />
    <circle r={r * 0.74} fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth={r * 0.02} />
    <ellipse cx={-r * 0.45} cy={-r * 0.55} rx={r * 0.32} ry={r * 0.08} fill="rgba(255,255,255,0.6)" transform={`rotate(-38 ${-r * 0.45} ${-r * 0.55})`} style={{ filter: "blur(4px)" }} />
  </g>
);

export const FoodDefs: React.FC = () => (
  <defs>
    <radialGradient id="plateRim" cx="40%" cy="35%">
      <stop offset="0" stopColor="#ffffff" />
      <stop offset="0.8" stopColor="#ece9e2" />
      <stop offset="1" stopColor="#c9c4b8" />
    </radialGradient>
    <radialGradient id="plateWell" cx="55%" cy="60%">
      <stop offset="0" stopColor="#fbfaf6" />
      <stop offset="1" stopColor="#e3dfd4" />
    </radialGradient>
    <linearGradient id="grill" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#e3a45c" />
      <stop offset="0.5" stopColor="#b8692a" />
      <stop offset="1" stopColor="#7a3e14" />
    </linearGradient>
    <radialGradient id="tomato" cx="35%" cy="30%">
      <stop offset="0" stopColor="#ff7a6a" />
      <stop offset="0.55" stopColor="#e0261c" />
      <stop offset="1" stopColor="#8a0c08" />
    </radialGradient>
    <radialGradient id="tomatoIn" cx="50%" cy="50%">
      <stop offset="0" stopColor="#ffb3a0" />
      <stop offset="1" stopColor="#e5402e" />
    </radialGradient>
    <radialGradient id="cucumber" cx="50%" cy="50%">
      <stop offset="0" stopColor="#f3f7d6" />
      <stop offset="0.75" stopColor="#d4e3a2" />
      <stop offset="0.86" stopColor="#7fae45" />
      <stop offset="1" stopColor="#2f5e1a" />
    </radialGradient>
    <linearGradient id="leaf" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#7cc042" />
      <stop offset="1" stopColor="#2b6a18" />
    </linearGradient>
    <linearGradient id="wood" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#8a5a2b" />
      <stop offset="0.5" stopColor="#b9814a" />
      <stop offset="1" stopColor="#7a4a20" />
    </linearGradient>
    <radialGradient id="seed" cx="35%" cy="30%">
      <stop offset="0" stopColor="#f6dc7a" />
      <stop offset="1" stopColor="#a8761a" />
    </radialGradient>
  </defs>
);

/** Tranche de poulet grillé : marques de grill, bord doré, reflet. */
export const GrilledSlice: React.FC<{ w: number; h: number; rot: number; x: number; y: number; id: string }> = ({ w, h, rot, x, y, id }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <rect x={-w / 2 + 4} y={-h / 2 + 8} width={w} height={h} rx={h * 0.2} fill="rgba(0,0,0,0.3)" style={{ filter: "blur(6px)" }} />
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h * 0.2} fill="url(#grill)" />
    <clipPath id={`gs${id}`}><rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h * 0.2} /></clipPath>
    <g clipPath={`url(#gs${id})`}>
      {[-0.32, -0.08, 0.16, 0.4].map((k, i) => (
        <rect key={i} x={k * w - 6} y={-h} width={12} height={h * 2} fill="#3a1806" opacity={0.75} transform={`rotate(28 ${k * w} 0)`} />
      ))}
      <rect x={-w / 2} y={-h / 2} width={w} height={h * 0.3} fill="rgba(255,220,170,0.25)" />
    </g>
  </g>
);

export const Tomato: React.FC<{ x: number; y: number; r: number; half?: boolean; id: string }> = ({ x, y, r, half = false, id }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle cx={r * 0.1} cy={r * 0.15} r={r} fill="rgba(0,0,0,0.35)" style={{ filter: "blur(5px)" }} />
    {half ? (
      <>
        <circle r={r} fill="#c81e14" />
        <circle r={r * 0.88} fill="url(#tomatoIn)" />
        {[0, 1, 2].map((k) => {
          const a = (k / 3) * Math.PI * 2 + 0.4;
          return (
            <g key={k}>
              <ellipse cx={Math.cos(a) * r * 0.45} cy={Math.sin(a) * r * 0.45} rx={r * 0.28} ry={r * 0.2} transform={`rotate(${(a * 180) / Math.PI} ${Math.cos(a) * r * 0.45} ${Math.sin(a) * r * 0.45})`} fill="#f7c7a8" opacity={0.85} />
              {[0, 1, 2].map((s) => (
                <ellipse key={s} cx={Math.cos(a) * r * (0.35 + s * 0.1)} cy={Math.sin(a) * r * (0.35 + s * 0.1)} rx={r * 0.05} ry={r * 0.035} fill="#f5e6a0" />
              ))}
            </g>
          );
        })}
        <circle r={r * 0.16} fill="#ffd2bd" />
      </>
    ) : (
      <>
        <circle r={r} fill="url(#tomato)" />
        <path d={`M0 ${-r * 0.1} l${r * 0.35} ${-r * 0.12} l${-r * 0.3} ${r * 0.02} l${r * 0.05} ${-r * 0.32} l${-r * 0.12} ${r * 0.3} l${-r * 0.25} ${-r * 0.22} l${r * 0.15} ${r * 0.28} l${-r * 0.35} ${r * 0.05}Z`} fill="#3f8a22" />
        <ellipse cx={-r * 0.38} cy={-r * 0.38} rx={r * 0.22} ry={r * 0.12} fill="rgba(255,255,255,0.65)" transform={`rotate(-40 ${-r * 0.38} ${-r * 0.38})`} />
      </>
    )}
  </g>
);

export const Cucumber: React.FC<{ x: number; y: number; r: number }> = ({ x, y, r }) => (
  <g transform={`translate(${x} ${y})`}>
    <circle cx={r * 0.08} cy={r * 0.12} r={r} fill="rgba(0,0,0,0.3)" style={{ filter: "blur(4px)" }} />
    <circle r={r} fill="url(#cucumber)" />
    {Array.from({ length: 7 }, (_, k) => {
      const a = (k / 7) * Math.PI * 2;
      return <ellipse key={k} cx={Math.cos(a) * r * 0.32} cy={Math.sin(a) * r * 0.32} rx={r * 0.07} ry={r * 0.04} transform={`rotate(${(a * 180) / Math.PI} ${Math.cos(a) * r * 0.32} ${Math.sin(a) * r * 0.32})`} fill="#e9efc4" />;
    })}
  </g>
);

export const Leaf: React.FC<{ x: number; y: number; s: number; rot: number }> = ({ x, y, s, rot }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M0 0 C20 -30 70 -34 110 -6 C70 22 22 22 0 0Z" fill="rgba(0,0,0,0.25)" transform="translate(4 6)" style={{ filter: "blur(4px)" }} />
    <path d="M0 0 C20 -30 70 -34 110 -6 C70 22 22 22 0 0Z" fill="url(#leaf)" />
    <path d="M0 0 Q55 -6 110 -6" stroke="rgba(230,255,200,0.7)" strokeWidth="1.6" fill="none" />
    {[22, 44, 66, 86].map((k) => (
      <path key={k} d={`M${k} ${-k * 0.05} q8 -8 14 -14 M${k} ${-k * 0.05} q8 6 14 10`} stroke="rgba(230,255,200,0.45)" strokeWidth="1" fill="none" />
    ))}
  </g>
);

/** Graines de moutarde éparpillées. */
export const Seeds: React.FC<{ x: number; y: number; spread: number; count: number; seed: string }> = ({ x, y, spread, count, seed }) => (
  <g>
    {Array.from({ length: count }, (_, i) => {
      const r = (k: string) => random(`${seed}${i}${k}`);
      const a = r("a") * Math.PI * 2, d = Math.pow(r("d"), 0.7) * spread;
      const s = 4 + r("s") * 3;
      return <circle key={i} cx={x + Math.cos(a) * d} cy={y + Math.sin(a) * d * 0.8} r={s} fill="url(#seed)" stroke="rgba(80,50,0,0.3)" strokeWidth="0.6" />;
    })}
  </g>
);

/** Cuillère en bois portant une généreuse noisette de moutarde en spirale. */
export const SpoonDollop: React.FC<{ x: number; y: number; s: number; rot: number }> = ({ x, y, s, rot }) => (
  <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${s})`}>
    <path d="M-60 -48 C-10 -62 30 -40 34 0 C30 40 -10 62 -60 48 C-96 36 -110 -36 -60 -48Z M30 -10 L300 -14 Q312 0 300 14 L30 10Z" fill="rgba(0,0,0,0.4)" transform="translate(8 12)" style={{ filter: "blur(8px)" }} />
    <path d="M30 -10 L300 -14 Q312 0 300 14 L30 10Z" fill="url(#wood)" />
    <path d="M-60 -48 C-10 -62 30 -40 34 0 C30 40 -10 62 -60 48 C-96 36 -110 -36 -60 -48Z" fill="url(#wood)" />
    <ellipse cx={-38} cy={0} rx={56} ry={40} fill="#6e4320" opacity={0.5} />
    {/* noisette de moutarde en spirale */}
    <ellipse cx={-38} cy={2} rx={50} ry={36} fill={C.mustardDeep} />
    <ellipse cx={-40} cy={-2} rx={44} ry={31} fill={C.mustard} />
    <path d="M-40 -2 m-30 0 a30 22 0 1 0 60 0 a24 16 0 1 0 -46 2 a16 10 0 1 0 30 -2" fill="none" stroke={C.mustardLight} strokeWidth={6} strokeLinecap="round" />
    <ellipse cx={-56} cy={-14} rx={12} ry={5} fill="rgba(255,255,255,0.75)" transform="rotate(-20 -56 -14)" />
  </g>
);
