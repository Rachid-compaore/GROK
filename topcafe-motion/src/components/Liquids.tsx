import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { EASE, tw, useLayout } from "../theme";

/* ============================================================================
 * Transition liquide : la scène entrante est révélée derrière un front de
 * liquide lisse et brillant qui traverse l'écran. Le front est un ruban épais
 * (lait, mousse, caramel, or) avec reflet spéculaire. Aucun écran vide : on
 * passe directement d'une scène à l'autre.
 * ========================================================================== */
type Dir = "right" | "up" | "radial" | "diagonal";
export type LiquidColors = { body: string; shade: string; shine: string };

export const LiquidWipe: React.FC<{ children: React.ReactNode; dir: Dir; colors: LiquidColors; dur?: number; band?: number }> = ({ children, dir, colors, dur = 0.75, band = 150 }) => {
  const frame = useCurrentFrame();
  const { W, H } = useLayout();
  const t = frame / 60;
  const k = tw(frame, 0, dur, 0, 1, EASE.inOut);
  if (k >= 1) return <AbsoluteFill style={{ isolation: "isolate" }}>{children}</AbsoluteFill>;

  // front ondulé, lisse (2 harmoniques lentes)
  const wobble = (s: number, amp: number) => Math.sin(s / 260 + t * 4) * amp + Math.sin(s / 110 - t * 2.6) * amp * 0.28;
  let front: [number, number][] = [];
  let clip = "";
  if (dir === "radial") {
    const R = Math.hypot(W, H) * 0.62 + band;
    const r = k * R;
    for (let i = 0; i <= 90; i++) {
      const a = (i / 90) * Math.PI * 2;
      const rr = Math.max(0, r + Math.sin(a * 5 + t * 3) * 26 * Math.sin(Math.PI * k));
      front.push([W / 2 + Math.cos(a) * rr, H / 2 + Math.sin(a) * rr]);
    }
    clip = `path('M${front.map((p) => p.join(" ")).join(" L")} Z')`;
  } else {
    const along = dir === "up" ? W : dir === "right" ? H : W + H;
    const span = (dir === "up" ? H : dir === "right" ? W : W + H) + band * 2 + 200;
    const pos = -band - 100 + k * span;
    for (let s = -60; s <= along + 60; s += 30) {
      const off = wobble(s, 46 * Math.sin(Math.PI * k) + 10);
      if (dir === "right") front.push([pos + off, s]);
      else if (dir === "up") front.push([s, H - pos + off]);
      else front.push([pos - s * 0.5 + off, s * 0.85]);
    }
    const tail =
      dir === "right" ? `L-200 ${H + 100} L-200 -100` : dir === "up" ? `L${W + 100} ${H + 200} L-100 ${H + 200}` : `L-${W} ${H * 2} L-${W} -200`;
    clip = `path('M${front.map((p) => p.join(" ")).join(" L")} ${tail} Z')`;
  }
  // ruban de liquide le long du front
  const ribbon = front.map((p) => p.join(",")).join(" ");
  return (
    <AbsoluteFill style={{ isolation: "isolate" }}>
      <AbsoluteFill style={{ clipPath: clip }}>{children}</AbsoluteFill>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}>
        <polyline points={ribbon} fill="none" stroke={colors.shade} strokeWidth={band + 40} strokeLinejoin="round" style={{ filter: "blur(14px)" }} opacity={0.55} />
        <polyline points={ribbon} fill="none" stroke={colors.body} strokeWidth={band} strokeLinejoin="round" />
        <polyline points={ribbon} fill="none" stroke={colors.shine} strokeWidth={band * 0.18} strokeLinejoin="round" transform={`translate(${dir === "up" ? 0 : -band * 0.2} ${dir === "up" ? band * 0.2 : -band * 0.12})`} style={{ filter: "blur(3px)" }} opacity={0.9} />
        {/* gouttelettes */}
        {Array.from({ length: 14 }, (_, i) => {
          const r = (q: string) => random(`wd${dir}${i}${q}`);
          const p = front[Math.floor(r("i") * front.length)];
          const life = (k * 2 + r("d")) % 1;
          const dx = dir === "up" ? (r("x") - 0.5) * 40 : (60 + r("v") * 120) * life;
          const dy = dir === "up" ? -(60 + r("v") * 140) * life : (r("y") - 0.5) * 40 - 40 * life;
          return <circle key={i} cx={p[0] + dx} cy={p[1] + dy} r={(5 + r("s") * 12) * (1 - life)} fill={colors.body} />;
        })}
      </svg>
    </AbsoluteFill>
  );
};

export const MILK: LiquidColors = { body: "#fbf6ec", shade: "#c9b28a", shine: "#ffffff" };
export const FOAM: LiquidColors = { body: "#f3e2c6", shade: "#7a4a22", shine: "#fffaf0" };
export const CARAMEL: LiquidColors = { body: "#c9832f", shade: "#5a2a0c", shine: "#ffd89a" };
export const GOLDEN: LiquidColors = { body: "#e9b44c", shade: "#5a3208", shine: "#fff1c4" };

/* ============================================================================
 * Ruban liquide qui ondule derrière le produit (lait ou caramel).
 * Corps + ombre + reflet spéculaire ; il se dessine à l'apparition.
 * ========================================================================== */
export const LiquidRibbon: React.FC<{
  pts: [number, number][];
  width: number;
  colors: LiquidColors;
  drawAt: number;
  sway?: number;
}> = ({ pts, width, colors, drawAt, sway = 24 }) => {
  const frame = useCurrentFrame();
  const { W, H } = useLayout();
  const t = frame / 60;
  const draw = tw(frame, drawAt, drawAt + 1.1, 0, 1, EASE.out);
  if (draw <= 0) return null;
  // courbe de Catmull-Rom échantillonnée
  const P = pts.map(([x, y], i) => [x, y + Math.sin(t * 1.1 + i * 1.3) * sway] as [number, number]);
  const out: string[] = [];
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
    for (let s = 0; s < 1; s += 0.05) {
      const s2 = s * s, s3 = s2 * s;
      const x = 0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * s + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * s2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * s3);
      const y = 0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * s + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * s2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * s3);
      out.push(`${x},${y}`);
    }
  }
  out.push(P[P.length - 1].join(","));
  const len = 6000;
  const dash = { strokeDasharray: len, strokeDashoffset: len * (1 - draw) };
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}>
      <polyline points={out.join(" ")} fill="none" stroke={colors.shade} strokeWidth={width * 1.1} strokeLinecap="round" strokeLinejoin="round" opacity={0.45} transform={`translate(0 ${width * 0.18})`} style={{ filter: "blur(16px)", ...dash }} />
      <polyline points={out.join(" ")} fill="none" stroke={colors.body} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" style={dash} />
      <polyline points={out.join(" ")} fill="none" stroke={colors.shade} strokeWidth={width * 0.35} strokeLinecap="round" strokeLinejoin="round" opacity={0.22} transform={`translate(0 ${width * 0.3})`} style={{ filter: "blur(6px)", ...dash }} />
      <polyline points={out.join(" ")} fill="none" stroke={colors.shine} strokeWidth={width * 0.14} strokeLinecap="round" strokeLinejoin="round" transform={`translate(0 ${-width * 0.26})`} style={{ filter: "blur(2px)", ...dash }} />
    </svg>
  );
};

/* ============================================================================
 * Poudre de cacao qui tombe lentement dans le faisceau de lumière,
 * avec une bouffée initiale (explosion contrôlée) au centre.
 * ========================================================================== */
export const CocoaDust: React.FC<{ burstAt: number; cx: number; cy: number }> = ({ burstAt, cx, cy }) => {
  const frame = useCurrentFrame();
  const { W, H } = useLayout();
  const t = frame / 60;
  const bt = t - burstAt;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {bt > 0 && bt < 2.2 && (
        <div style={{ position: "absolute", left: cx - 600, top: cy - 600, width: 1200, height: 1200, borderRadius: "50%", background: "radial-gradient(circle, rgba(105,52,22,0.6) 0%, rgba(105,52,22,0) 62%)", transform: `scale(${0.2 + Math.min(1.5, bt * 1.8)})`, opacity: Math.min(1, bt * 4) * Math.max(0, 1 - bt / 2.2), filter: "blur(24px)" }} />
      )}
      {Array.from({ length: 130 }, (_, i) => {
        const r = (q: string) => random(`cd${i}${q}`);
        let x: number, y: number, o: number;
        if (i < 70) {
          if (bt < 0) return null;
          const a = r("a") * Math.PI * 2, v = 400 + r("v") * 1300;
          const d = (v / 3) * (1 - Math.exp(-3 * bt));
          x = cx + Math.cos(a) * d; y = cy + Math.sin(a) * d + 60 * bt * bt; o = Math.max(0, 1 - bt / (1.2 + r("l")));
        } else {
          x = r("x") * W + Math.sin(t * 0.7 + r("p") * 6) * 20;
          y = ((r("y") * H + t * (20 + r("v") * 30)) % H);
          o = 0.35 + r("o") * 0.4;
        }
        const s = 2 + r("s") * (i < 70 ? 7 : 4);
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: s, height: s, borderRadius: "50%", background: r("c") > 0.5 ? "#6b3418" : "#9a5a2c", opacity: o, filter: i >= 70 && r("b") > 0.6 ? "blur(2px)" : undefined }} />;
      })}
    </AbsoluteFill>
  );
};
