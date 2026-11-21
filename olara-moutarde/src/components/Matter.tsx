import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { C, EASE, tw, useLayout } from "../theme";

/* ============================================================================
 * Texture de moutarde « macro » : bruit fractal transformé en relief, éclairé
 * par une lumière spéculaire (filtre SVG). Le relief dérive lentement : la
 * matière paraît crémeuse et vivante. `light` (0→1) révèle la texture.
 * ========================================================================== */
export const MustardSurface: React.FC<{ id: string; light: number; drift?: number; scale?: number; lightX?: number; lightY?: number; freq?: number }> = ({
  id,
  light,
  drift = 1,
  scale = 1,
  lightX = 0.62,
  lightY = 0.2,
  freq = 0.0045,
}) => {
  const frame = useCurrentFrame();
  const { W, H } = useLayout();
  const t = frame / 60;
  const ox = -t * 18 * drift, oy = -t * 7 * drift;
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <filter id={`mus${id}`} x={-W * 1.5} y={-H * 1.5} width={W * 4} height={H * 4} filterUnits="userSpaceOnUse">
          <feTurbulence type="fractalNoise" baseFrequency={`${freq} ${freq * 1.6}`} numOctaves={3} seed={7} result="n" />
          <feGaussianBlur in="n" stdDeviation="3" result="nb" />
          <feSpecularLighting in="nb" surfaceScale={14} specularConstant={1.1 * light} specularExponent={28} lightingColor="#fff3cf" result="spec">
            <fePointLight x={W * lightX - ox} y={H * lightY - oy} z={420} />
          </feSpecularLighting>
          <feDiffuseLighting in="nb" surfaceScale={10} diffuseConstant={1.0} lightingColor="#ffd25a" result="diff">
            <fePointLight x={W * lightX - ox} y={H * lightY - oy} z={360} />
          </feDiffuseLighting>
          <feComposite in="diff" in2="SourceGraphic" operator="arithmetic" k1={0.9} k2={0.25} k3={0} k4={0} result="lit" />
          <feComposite in="spec" in2="lit" operator="arithmetic" k1={0} k2={0.75} k3={1} k4={0} />
        </filter>
      </defs>
      <g transform={`translate(${ox} ${oy}) scale(${scale})`}>
        <rect x={-W * 1.5} y={-H * 1.5} width={W * 4} height={H * 4} fill={C.mustard} filter={`url(#mus${id})`} />
      </g>
    </svg>
  );
};

/* ============================================================================
 * Goutte de moutarde suspendue : forme qui respire (ralenti), dégradé épais,
 * reflet spéculaire, liseré lumineux, petite réfraction.
 * ========================================================================== */
export const Drop: React.FC<{ size: number; stretch?: number; id: string }> = ({ size, stretch = 0, id }) => {
  const frame = useCurrentFrame();
  const t = frame / 60;
  const wob = (k: number) => Math.sin(t * 1.7 + k) * 2.2;
  const s = stretch; // 0 = goutte au repos, 1 = étirée par la chute
  const d = `M50 ${4 - s * 30} C${56 + wob(1)} ${26 - s * 20} ${86 + wob(2)} ${52 + s * 4} ${86} ${74 + s * 6} C${86} ${98 + s * 4} ${70} ${112} 50 ${112} C${30} ${112} ${14} ${98 + s * 4} ${14} ${74 + s * 6} C${14 + wob(3)} ${52 + s * 4} ${44 + wob(4)} ${26 - s * 20} 50 ${4 - s * 30}Z`;
  return (
    <svg width={size} height={size * 1.2} viewBox="0 -30 100 150" style={{ overflow: "visible" }}>
      <defs>
        <radialGradient id={`dg${id}`} cx="38%" cy="58%" r="70%">
          <stop offset="0" stopColor="#ffe48a" />
          <stop offset="0.35" stopColor={C.mustardLight} />
          <stop offset="0.75" stopColor={C.mustard} />
          <stop offset="1" stopColor={C.mustardDeep} />
        </radialGradient>
        <radialGradient id={`dr${id}`} cx="70%" cy="82%" r="40%">
          <stop offset="0" stopColor="rgba(255,250,220,0.75)" />
          <stop offset="1" stopColor="rgba(255,250,220,0)" />
        </radialGradient>
      </defs>
      <path d={d} fill={`url(#dg${id})`} />
      <path d={d} fill={`url(#dr${id})`} />
      <path d={d} fill="none" stroke="rgba(255,240,190,0.55)" strokeWidth="1.4" />
      <ellipse cx="36" cy="60" rx="9" ry="16" fill="rgba(255,255,255,0.85)" transform="rotate(-18 36 60)" style={{ filter: "blur(1.2px)" }} />
      <ellipse cx="40" cy="86" rx="3" ry="4" fill="rgba(255,255,255,0.7)" />
    </svg>
  );
};

/* ============================================================================
 * Ondes d'impact : anneaux en perspective qui se propagent sur la surface.
 * ========================================================================== */
export const Ripples: React.FC<{ at: number; cx: number; cy: number; persp?: number }> = ({ at, cx, cy, persp = 0.28 }) => {
  const frame = useCurrentFrame();
  const t = frame / 60 - at;
  if (t < 0) return null;
  return (
    <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}>
      {[0, 0.18, 0.36, 0.6, 0.85].map((d, i) => {
        const k = t - d;
        if (k <= 0) return null;
        const r = 40 + k * 900 * (1 - Math.exp(-k * 0.6)) + k * 260;
        const o = Math.max(0, 1 - k / 2.6) * (1 - i * 0.12);
        return (
          <g key={i} opacity={o}>
            <ellipse cx={cx} cy={cy} rx={r} ry={r * persp} fill="none" stroke="rgba(255,240,190,0.8)" strokeWidth={6 - i * 0.6} style={{ filter: "blur(1px)" }} />
            <ellipse cx={cx} cy={cy + 8} rx={r} ry={r * persp} fill="none" stroke="rgba(110,65,0,0.45)" strokeWidth={10 - i} style={{ filter: "blur(4px)" }} />
          </g>
        );
      })}
    </svg>
  );
};

/* ============================================================================
 * Couronne d'impact : la matière s'élève en pétales lisses puis retombe.
 * ========================================================================== */
export const Crown: React.FC<{ at: number; cx: number; cy: number; w: number }> = ({ at, cx, cy, w }) => {
  const frame = useCurrentFrame();
  const t = frame / 60 - at;
  if (t < 0 || t > 2.4) return null;
  const rise = Math.sin(Math.min(1, t / 1.6) * Math.PI) * (1 - Math.max(0, t - 1.6) / 0.8);
  const h = w * 0.34 * rise;
  const jet = w * 0.62 * Math.sin(Math.min(1, Math.max(0, t - 0.15) / 1.4) * Math.PI);
  // dôme lisse (cloche) et jet central (colonne de Worthington) — aucune pointe artificielle
  const d = `M${-w / 2} 0 C${-w * 0.28} 0 ${-w * 0.16} ${-h} 0 ${-h} C${w * 0.16} ${-h} ${w * 0.28} 0 ${w / 2} 0 Q0 ${w * 0.08} ${-w / 2} 0Z`;
  const jw = w * 0.07;
  const jd = jet > 4 ? `M${-jw} ${-h * 0.6} C${-jw * 0.8} ${-h - jet * 0.5} ${-jw * 0.6} ${-h - jet} 0 ${-h - jet} C${jw * 0.6} ${-h - jet} ${jw * 0.8} ${-h - jet * 0.5} ${jw} ${-h * 0.6}Z` : "";
  return (
    <svg width={w * 1.6} height={w} viewBox={`${-w * 0.8} ${-w * 0.7} ${w * 1.6} ${w}`} style={{ position: "absolute", left: cx - w * 0.8, top: cy - w * 0.7, overflow: "visible" }}>
      <defs>
        <linearGradient id={`cg${at}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffe48a" />
          <stop offset="0.5" stopColor={C.mustardLight} />
          <stop offset="1" stopColor={C.mustardDeep} />
        </linearGradient>
      </defs>
      <path d={d} fill={`url(#cg${at})`} />
      {jd && <path d={jd} fill={`url(#cg${at})`} />}
      {jd && <circle cx={0} cy={-h - jet - jw * 1.6} r={jw * 1.1 * Math.min(1, jet / (w * 0.3))} fill={C.mustardLight} />}
      <path d={d} fill="none" stroke="rgba(255,248,215,0.55)" strokeWidth="2" />
      <ellipse cx={-w * 0.08} cy={-h * 0.72} rx={w * 0.06} ry={h * 0.12} fill="rgba(255,255,255,0.6)" style={{ filter: "blur(2px)" }} />
      {Array.from({ length: 12 }, (_, i) => {
        const r = (q: string) => random(`cr${i}${q}`);
        const a = -Math.PI / 2 + (r("a") - 0.5) * 2.4;
        const v = 500 + r("v") * 700;
        const x = Math.cos(a) * v * t * 0.6, y = Math.sin(a) * v * t + 900 * t * t;
        const s = (5 + r("s") * 9) * Math.max(0, 1 - t / 1.6);
        return s > 0.5 ? <circle key={i} cx={x} cy={y} r={s} fill={C.mustardLight} stroke="rgba(255,250,220,0.7)" strokeWidth="1" /> : null;
      })}
    </svg>
  );
};

/* ============================================================================
 * Ruban de matière (Catmull-Rom) : corps, ombre, reflet. Se dessine sur `draw`.
 * Sert pour la vague graphique, le filet de sauce et le soulignement du slogan.
 * ========================================================================== */
export const MatterRibbon: React.FC<{
  pts: [number, number][];
  width: number;
  draw: number;
  sway?: number;
  phase?: number;
  colors?: { body: string; shade: string; shine: string };
  taper?: boolean;
}> = ({ pts, width, draw, sway = 0, phase = 0, colors = { body: C.mustard, shade: C.mustardDeep, shine: "#fff1b8" } }) => {
  const frame = useCurrentFrame();
  const { W, H } = useLayout();
  const t = frame / 60;
  if (draw <= 0) return null;
  const P = pts.map(([x, y], i) => [x, y + Math.sin(t * 1.2 + i * 1.4 + phase) * sway] as [number, number]);
  const out: string[] = [];
  for (let i = 0; i < P.length - 1; i++) {
    const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)];
    for (let s = 0; s < 1; s += 0.04) {
      const s2 = s * s, s3 = s2 * s;
      out.push(
        `${0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * s + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * s2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * s3)},${0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * s + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * s2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * s3)}`,
      );
    }
  }
  out.push(P[P.length - 1].join(","));
  const pl = out.join(" ");
  const len = 9000;
  const dash = { strokeDasharray: len, strokeDashoffset: len * (1 - Math.min(1, draw)) };
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}>
      <polyline points={pl} fill="none" stroke="rgba(40,20,0,0.55)" strokeWidth={width * 1.05} strokeLinecap="round" strokeLinejoin="round" transform={`translate(0 ${width * 0.28})`} style={{ filter: `blur(${width * 0.18}px)`, ...dash }} />
      <polyline points={pl} fill="none" stroke={colors.shade} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" style={dash} />
      <polyline points={pl} fill="none" stroke={colors.body} strokeWidth={width * 0.78} strokeLinecap="round" strokeLinejoin="round" transform={`translate(0 ${-width * 0.06})`} style={dash} />
      <polyline points={pl} fill="none" stroke={colors.shine} strokeWidth={width * 0.12} strokeLinecap="round" strokeLinejoin="round" transform={`translate(0 ${-width * 0.22})`} style={{ filter: "blur(1.5px)", ...dash }} />
    </svg>
  );
};

/** Fond « bokeh » : grosses taches de lumière floues (profondeur de champ). */
export const Bokeh: React.FC<{ seed: string; color: string; count?: number; drift?: number; opacity?: number }> = ({ seed, color, count = 10, drift = 1, opacity = 1 }) => {
  const frame = useCurrentFrame();
  const { W, H } = useLayout();
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen", pointerEvents: "none", opacity }}>
      {Array.from({ length: count }, (_, i) => {
        const r = (k: string) => random(`${seed}${i}${k}`);
        const s = 120 + r("s") * 300;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: r("x") * W - s / 2 + Math.sin(frame / 140 + i) * 26 * drift,
              top: r("y") * H - s / 2 + Math.cos(frame / 160 + i) * 18 * drift,
              width: s,
              height: s,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
              opacity: 0.3 + r("o") * 0.45,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Grain pellicule et vignettage, très discrets. */
export const FilmFinish: React.FC = () => {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame / 2);
  return (
    <AbsoluteFill style={{ pointerEvents: "none", zIndex: 100 }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 58%, rgba(0,0,0,0.32) 100%)" }} />
      <svg width="100%" height="100%" style={{ position: "absolute", opacity: 0.06, mixBlendMode: "overlay" }}>
        <filter id={`g${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={seed} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#g${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};

export { EASE, tw };
