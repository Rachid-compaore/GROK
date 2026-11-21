import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { EASE, tw, useLayout } from "../theme";

/**
 * Vague de lait crémeux qui traverse l'écran de gauche à droite (transition).
 * Front de vague ondulé, dégradé crème, liseré brillant et gouttelettes.
 */
export const MilkWave: React.FC<{ at: number; dur?: number; color?: [string, string]; exit?: boolean }> = ({ at, dur = 1.0, color = ["#ffffff", "#f3e6cf"], exit = true }) => {
  const frame = useCurrentFrame();
  const { W, H } = useLayout();
  const t = frame / 60;
  const k = tw(frame, at, at + dur, 0, 1, EASE.inOut);
  const k2 = exit ? tw(frame, at + dur, at + dur + 0.7, 0, 1, EASE.in) : 0;
  if (k <= 0 || k2 >= 1) return null;
  const front = -0.35 * W + k * 1.55 * W; // bord d'attaque
  const back = -0.35 * W + k2 * 1.6 * W; // bord de fuite (la vague repart)
  const edge = (x0: number, dir: number) => {
    let d = "";
    for (let y = -40; y <= H + 40; y += 30) {
      const x = x0 + Math.sin(y / 140 + t * 5) * 60 + Math.sin(y / 60 - t * 3) * 18 + dir * Math.sin((y / H) * Math.PI) * 120;
      d += `L${x} ${y} `;
    }
    return d;
  };
  const path = `M${back - 300} -40 ${edge(front, 1)} L${back - 300} ${H + 40} Z`;
  const hole = k2 > 0 ? `M${back} -40 ${edge(back, -1).replace("L", "M")}` : "";
  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 40 }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs>
          <linearGradient id="milk" x1="0" y1="0" x2="1" y2="0.3">
            <stop offset="0" stopColor={color[1]} />
            <stop offset="0.85" stopColor={color[0]} />
            <stop offset="1" stopColor="#ffffff" />
          </linearGradient>
          <clipPath id="behind">
            <rect x={back} y={-100} width={W * 3} height={H + 200} />
          </clipPath>
        </defs>
        <g clipPath={k2 > 0 ? "url(#behind)" : undefined}>
          <path d={path} fill="url(#milk)" />
          <path d={`M${front} -40 ${edge(front, 1)}`} fill="none" stroke="rgba(255,255,255,0.95)" strokeWidth="14" style={{ filter: "blur(3px)" }} />
          <path d={`M${front - 40} -40 ${edge(front - 40, 1)}`} fill="none" stroke="rgba(200,170,130,0.35)" strokeWidth="26" style={{ filter: "blur(10px)" }} />
        </g>
        {hole && null}
        {/* gouttelettes projetées par le front */}
        {Array.from({ length: 22 }, (_, i) => {
          const r = (q: string) => random(`drop${at}${i}${q}`);
          const y = r("y") * H;
          const life = (k * 1.4 + r("d")) % 1;
          const x = front + 40 + life * (80 + r("v") * 220);
          const s = (6 + r("s") * 18) * (1 - life);
          return <circle key={i} cx={x} cy={y - life * 60} r={s} fill="#fff" opacity={0.9 * (1 - k2)} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

/** Couronne d'éclaboussure de lait au pied du produit. */
export const SplashCrown: React.FC<{ x: number; y: number; w: number; at: number; color?: string }> = ({ x, y, w, at, color = "#ffffff" }) => {
  const frame = useCurrentFrame();
  const t = frame / 60;
  const g = tw(frame, at, at + 0.6, 0, 1, EASE.out);
  if (g <= 0) return null;
  const h = w * 0.32;
  let d = `M0 ${h}`;
  const n = 11;
  for (let i = 0; i <= n; i++) {
    const px = (i / n) * w;
    const peak = (0.35 + 0.65 * Math.abs(Math.sin(i * 1.7))) * h * g * (0.92 + Math.sin(t * 3 + i) * 0.08);
    d += ` Q${px - w / n / 2} ${h - peak * 0.2} ${px} ${h - peak}`;
  }
  d += ` L${w} ${h} Z`;
  return (
    <svg width={w} height={h * 2} style={{ position: "absolute", left: x - w / 2, top: y - h, overflow: "visible" }}>
      <defs>
        <linearGradient id={`cr${at}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor={color} />
        </linearGradient>
      </defs>
      <ellipse cx={w / 2} cy={h} rx={w * 0.55 * g} ry={h * 0.32} fill={color} opacity="0.95" />
      <path d={d} fill={`url(#cr${at})`} />
      {Array.from({ length: 9 }, (_, i) => {
        const r = (q: string) => random(`crd${at}${i}${q}`);
        const px = r("x") * w, life = Math.min(1, Math.max(0, (t - at) * (1.2 + r("v")) - r("d") * 0.3));
        const py = h - h * 1.6 * Math.sin(Math.min(1, life) * Math.PI) - 10;
        return life > 0 && life < 1 ? <circle key={i} cx={px} cy={py} r={4 + r("s") * 9} fill="#fff" /> : null;
      })}
      <path d={d} fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="3" />
    </svg>
  );
};

/** Nuage de mousse : bulles crémeuses qui envahissent l'écran puis s'ouvrent (transition). */
export const FoamCover: React.FC<{ at: number; dur?: number }> = ({ at, dur = 0.8 }) => {
  const frame = useCurrentFrame();
  const { W, H } = useLayout();
  const inK = tw(frame, at, at + dur * 0.6, 0, 1, EASE.out);
  const outK = tw(frame, at + dur * 0.6, at + dur, 0, 1, EASE.in);
  if (inK <= 0 || outK >= 1) return null;
  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 40 }}>
      {Array.from({ length: 70 }, (_, i) => {
        const r = (q: string) => random(`foam${i}${q}`);
        const cx = r("x") * W, cy = r("y") * H;
        const base = (Math.max(W, H) / 7) * (0.6 + r("s") * 0.9);
        const s = base * Math.min(1, inK * (1.2 + r("d"))) * (1 - outK * (0.6 + r("o") * 0.6));
        const drift = outK * (r("v") - 0.5) * 300;
        if (s <= 1) return null;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: cx - s + drift,
              top: cy - s - outK * 200,
              width: s * 2,
              height: s * 2,
              borderRadius: "50%",
              background: "radial-gradient(circle at 35% 30%, #ffffff 0%, #fbf3e4 45%, #e9d8bb 100%)",
              boxShadow: "inset -10px -14px 30px rgba(160,120,70,0.18)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Explosion contrôlée de poudre de cacao (particules + nuage), centrée en (cx, cy). */
export const CocoaBurst: React.FC<{ at: number; cx: number; cy: number }> = ({ at, cx, cy }) => {
  const frame = useCurrentFrame();
  const t = frame / 60 - at;
  if (t < 0 || t > 2.6) return null;
  const cloud = Math.min(1, t / 0.4) * Math.max(0, 1 - (t - 0.4) / 2.0);
  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 30 }}>
      <div style={{ position: "absolute", left: cx - 700, top: cy - 700, width: 1400, height: 1400, borderRadius: "50%", background: "radial-gradient(circle, rgba(110,55,25,0.75) 0%, rgba(110,55,25,0) 65%)", transform: `scale(${0.3 + Math.min(1.6, t * 1.6)})`, opacity: cloud, filter: "blur(20px)" }} />
      {Array.from({ length: 160 }, (_, i) => {
        const r = (q: string) => random(`cocoa${i}${q}`);
        const a = r("a") * Math.PI * 2;
        const v = 500 + r("v") * 1500;
        const dist = (v / 3.2) * (1 - Math.exp(-3.2 * t)); // freinage de l'air
        const x = cx + Math.cos(a) * dist, y = cy + Math.sin(a) * dist + 80 * t * t;
        const s = 3 + r("s") * 9;
        const o = Math.max(0, 1 - t / (1.4 + r("l")));
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: s, height: s, borderRadius: "50%", background: r("c") > 0.5 ? "#6b3418" : "#8a4a22", opacity: o, filter: `blur(${r("b") * 2}px)` }} />;
      })}
    </AbsoluteFill>
  );
};

/** Tourbillon de caramel et de lait derrière le produit (rubans en spirale). */
export const CaramelSwirl: React.FC<{ cx: number; cy: number; r: number; opacity?: number }> = ({ cx, cy, r, opacity = 1 }) => {
  const frame = useCurrentFrame();
  const t = frame / 60;
  const ribbon = (phase: number, turns: number) => {
    const pts: string[] = [];
    for (let i = 0; i <= 160; i++) {
      const k = i / 160, a = phase + k * turns * Math.PI * 2 + t * 0.6;
      const rr = r * (0.35 + k * 0.75);
      pts.push(`${cx + Math.cos(a) * rr},${cy + Math.sin(a) * rr * 0.55}`);
    }
    return pts.join(" ");
  };
  return (
    <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity, overflow: "visible" }}>
      <defs>
        <linearGradient id="caramel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f6c27a" />
          <stop offset="0.5" stopColor="#c47a2c" />
          <stop offset="1" stopColor="#7a3f14" />
        </linearGradient>
      </defs>
      <polyline points={ribbon(0, 1.1)} fill="none" stroke="url(#caramel)" strokeWidth={r * 0.16} strokeLinecap="round" opacity="0.9" />
      <polyline points={ribbon(Math.PI, 1.1)} fill="none" stroke="#fff6e6" strokeWidth={r * 0.11} strokeLinecap="round" opacity="0.9" />
      <polyline points={ribbon(0, 1.1)} fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth={r * 0.025} strokeLinecap="round" />
    </svg>
  );
};

/** Ouverture circulaire « horloge » bordée d'un ruban caramel et lait (transition). */
export const ClockWipe: React.FC<{ children: React.ReactNode; dur?: number }> = ({ children, dur = 0.85 }) => {
  const frame = useCurrentFrame();
  const { W, H } = useLayout();
  const k = tw(frame, 0, dur, 0, 1, EASE.inOut);
  if (k >= 1) return <AbsoluteFill>{children}</AbsoluteFill>;
  const cx = W / 2, cy = H / 2, R = Math.hypot(W, H);
  const a1 = -Math.PI / 2 + k * Math.PI * 2;
  const pts = [`${cx}px ${cy}px`];
  for (let i = 0; i <= 40; i++) {
    const a = -Math.PI / 2 + (i / 40) * (a1 + Math.PI / 2);
    pts.push(`${cx + Math.cos(a) * R}px ${cy + Math.sin(a) * R}px`);
  }
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ clipPath: `polygon(${pts.join(",")})` }}>{children}</AbsoluteFill>
      <div style={{ position: "absolute", left: cx, top: cy - 30, width: R, height: 60, transformOrigin: "0 50%", transform: `rotate(${(a1 * 180) / Math.PI}deg)`, background: "linear-gradient(180deg, #fff6e6 0%, #fff6e6 40%, #c47a2c 41%, #7a3f14 100%)", boxShadow: "0 0 40px rgba(120,60,20,0.5)", borderRadius: 30 }} />
    </AbsoluteFill>
  );
};
