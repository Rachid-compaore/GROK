import React from "react";
import { random } from "remotion";
import type { FruitKind } from "../theme";

/** Fruits et feuilles dessinés en SVG (dégradés + reflets) pour un rendu net à toute taille. */
export const Fruit: React.FC<{ kind: FruitKind; size: number; id: string }> = ({ kind, size, id }) => {
  switch (kind) {
    case "cassis":
      return (
        <svg width={size} height={size} viewBox="0 0 100 100">
          <defs>
            <radialGradient id={`c${id}`} cx="35%" cy="30%" r="75%">
              <stop offset="0" stopColor="#7a5aa8" />
              <stop offset="0.35" stopColor="#3a1f5c" />
              <stop offset="1" stopColor="#0a0414" />
            </radialGradient>
          </defs>
          <circle cx="50" cy="52" r="44" fill={`url(#c${id})`} />
          <ellipse cx="35" cy="34" rx="12" ry="8" fill="rgba(255,255,255,0.55)" transform="rotate(-30 35 34)" />
          <ellipse cx="66" cy="72" rx="16" ry="7" fill="rgba(170,130,230,0.25)" transform="rotate(-30 66 72)" />
          <g transform="translate(62 14)" stroke="#2b1a10" strokeWidth="3" strokeLinecap="round">
            <path d="M0 0 L-6 -6 M0 0 L6 -5 M0 0 L1 -8 M0 0 L-7 2 M0 0 L7 3" />
          </g>
        </svg>
      );
    case "strawberry": {
      const seeds = Array.from({ length: 22 }, (_, i) => {
        const r = (k: string) => random(`s${id}${i}${k}`);
        const y = 38 + r("y") * 52, half = 34 * (1 - (y - 34) / 70);
        return { x: 50 + (r("x") - 0.5) * 2 * half * 0.8, y, rot: (r("r") - 0.5) * 40 };
      });
      return (
        <svg width={size} height={size * 1.15} viewBox="0 0 100 115">
          <defs>
            <radialGradient id={`s${id}`} cx="38%" cy="35%" r="80%">
              <stop offset="0" stopColor="#ff6b6b" />
              <stop offset="0.5" stopColor="#e3122d" />
              <stop offset="1" stopColor="#7a0012" />
            </radialGradient>
          </defs>
          <path d="M50 110 C30 98 10 70 12 46 C14 30 30 24 50 26 C70 24 86 30 88 46 C90 70 70 98 50 110Z" fill={`url(#s${id})`} />
          {seeds.map((s, i) => (
            <ellipse key={i} cx={s.x} cy={s.y} rx="1.8" ry="3" fill="#ffd84d" transform={`rotate(${s.rot} ${s.x} ${s.y})`} />
          ))}
          <ellipse cx="34" cy="44" rx="9" ry="14" fill="rgba(255,255,255,0.28)" transform="rotate(25 34 44)" />
          <path d="M50 30 L30 18 L42 26 L36 8 L50 24 L64 8 L58 26 L70 18 Z" fill="#2f9e44" />
          <path d="M50 26 L50 6" stroke="#2f7d32" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );
    }
    case "lemon":
      return (
        <svg width={size * 1.3} height={size} viewBox="0 0 130 100">
          <defs>
            <radialGradient id={`l${id}`} cx="40%" cy="35%" r="75%">
              <stop offset="0" stopColor="#fff9a8" />
              <stop offset="0.45" stopColor="#ffd60a" />
              <stop offset="1" stopColor="#d99100" />
            </radialGradient>
          </defs>
          <path d="M6 50 C10 40 16 34 24 30 C40 12 90 12 106 30 C114 34 120 40 124 50 C120 60 114 66 106 70 C90 88 40 88 24 70 C16 66 10 60 6 50Z" fill={`url(#l${id})`} />
          <ellipse cx="48" cy="34" rx="22" ry="8" fill="rgba(255,255,255,0.45)" transform="rotate(-8 48 34)" />
          <path d="M106 30 Q118 18 126 22" stroke="#3a8f2e" strokeWidth="0" />
        </svg>
      );
    case "lemonSlice":
      return (
        <svg width={size} height={size} viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="48" fill="#ffc400" />
          <circle cx="50" cy="50" r="43" fill="#fff8d6" />
          {Array.from({ length: 9 }, (_, i) => {
            const a0 = (i / 9) * Math.PI * 2 + 0.06, a1 = ((i + 1) / 9) * Math.PI * 2 - 0.06;
            const p = (a: number, r: number) => `${50 + Math.cos(a) * r},${50 + Math.sin(a) * r}`;
            return <path key={i} d={`M${p((a0 + a1) / 2, 6)} L${p(a0, 38)} A38 38 0 0 1 ${p(a1, 38)} Z`} fill="#ffe24a" stroke="#fff2a8" strokeWidth="1.5" />;
          })}
          <circle cx="50" cy="50" r="5" fill="#fff8d6" />
          <ellipse cx="34" cy="28" rx="16" ry="6" fill="rgba(255,255,255,0.4)" transform="rotate(-35 34 28)" />
        </svg>
      );
    case "raspberry":
    case "blackberry": {
      const dark = kind === "blackberry";
      const drupes: { x: number; y: number; r: number }[] = [];
      for (let row = 0; row < 6; row++) {
        const y = 22 + row * 13, n = [3, 5, 6, 6, 5, 3][row], w = [20, 32, 38, 38, 32, 18][row];
        for (let k = 0; k < n; k++) drupes.push({ x: 50 - w + (2 * w * (k + 0.5)) / n, y, r: 9.5 });
      }
      return (
        <svg width={size} height={size} viewBox="0 0 100 100">
          <defs>
            <radialGradient id={`r${id}`} cx="35%" cy="30%" r="70%">
              <stop offset="0" stopColor={dark ? "#6e4b8f" : "#ff8fb0"} />
              <stop offset="0.5" stopColor={dark ? "#2a0f3a" : "#e0245e"} />
              <stop offset="1" stopColor={dark ? "#0a0210" : "#8a0a33"} />
            </radialGradient>
          </defs>
          {drupes.map((d, i) => (
            <g key={i}>
              <circle cx={d.x} cy={d.y} r={d.r} fill={`url(#r${id})`} />
              <circle cx={d.x - 3} cy={d.y - 3} r={2.4} fill="rgba(255,255,255,0.5)" />
            </g>
          ))}
          {dark && <path d="M50 14 L42 6 M50 14 L58 6 M50 14 L50 3" stroke="#3f6b2a" strokeWidth="3" strokeLinecap="round" />}
        </svg>
      );
    }
    case "leaf":
    default:
      return (
        <svg width={size} height={size * 0.6} viewBox="0 0 100 60">
          <defs>
            <linearGradient id={`f${id}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#7cc242" />
              <stop offset="1" stopColor="#2e7d1f" />
            </linearGradient>
          </defs>
          <path d="M4 30 C26 2 74 2 96 30 C74 58 26 58 4 30Z" fill={`url(#f${id})`} />
          <path d="M4 30 L96 30" stroke="#d8f0b0" strokeWidth="2" opacity="0.7" />
          {[24, 42, 60, 78].map((x) => (
            <path key={x} d={`M${x} 30 L${x + 10} 16 M${x} 30 L${x + 10} 44`} stroke="#d8f0b0" strokeWidth="1.2" opacity="0.5" />
          ))}
        </svg>
      );
  }
};
