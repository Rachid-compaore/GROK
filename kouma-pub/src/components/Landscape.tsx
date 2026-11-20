import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";

/**
 * Plantation de thé au lever du soleil, dessinée en SVG par couches :
 * ciel rouge-or (comme le visuel Kouma), montagnes, collines striées de rangs
 * de thé, brume et rayons. `cam` (0→1) pilote un mouvement aérien avec parallaxe.
 */
type Props = { cam: number; sunY?: number; tint?: number; rays?: number };

const hill = (base: number, amp: number, freq: number, phase: number, w = 2600) => {
  const pts: string[] = [];
  for (let x = -200; x <= w; x += 40) pts.push(`${x},${base + Math.sin(x * freq + phase) * amp + Math.sin(x * freq * 2.3 + phase * 1.7) * amp * 0.35}`);
  return pts;
};

export const Landscape: React.FC<Props> = ({ cam, sunY = 360, tint = 1, rays = 1 }) => {
  const frame = useCurrentFrame();
  const t = frame / 60;
  const layers = [
    { base: 520, amp: 30, freq: 0.004, phase: 0.5, c0: "#d7c63a", c1: "#9fae2a", depth: 0.15, rows: 10 },
    { base: 600, amp: 45, freq: 0.0032, phase: 2.0, c0: "#c6d23a", c1: "#7da326", depth: 0.3, rows: 12 },
    { base: 700, amp: 60, freq: 0.0026, phase: 4.1, c0: "#a9cc35", c1: "#4f8f1f", depth: 0.55, rows: 14 },
    { base: 830, amp: 80, freq: 0.002, phase: 1.2, c0: "#8cc232", c1: "#2f7a19", depth: 0.85, rows: 16 },
  ];
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#b0122a" />
            <stop offset="0.35" stopColor="#e2421f" />
            <stop offset="0.6" stopColor="#ff9a2e" />
            <stop offset="0.8" stopColor="#ffd77a" />
          </linearGradient>
          <radialGradient id="sun">
            <stop offset="0" stopColor="#fffbe6" />
            <stop offset="0.25" stopColor="#ffe9a0" />
            <stop offset="1" stopColor="rgba(255,200,90,0)" />
          </radialGradient>
          {layers.map((l, i) => (
            <linearGradient key={i} id={`h${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={l.c0} />
              <stop offset="1" stopColor={l.c1} />
            </linearGradient>
          ))}
        </defs>
        <rect width="1920" height="1080" fill="url(#sky)" />
        <g transform={`translate(0 ${-cam * 40})`}>
          <circle cx={1240} cy={sunY - cam * 30} r={420} fill="url(#sun)" opacity={0.9 * tint} />
          <circle cx={1240} cy={sunY - cam * 30} r={70} fill="#fffdf0" opacity={0.95} />
        </g>
        {/* montagnes lointaines */}
        <path d={`M-100 560 ${hill(470, 60, 0.006, 1.0).map((p) => "L" + p).join(" ")} L2600 1080 L-100 1080Z`} fill="#9a3a3a" opacity="0.55" transform={`translate(${-cam * 30} ${cam * 10})`} />
        <path d={`M-100 560 ${hill(510, 40, 0.005, 3.0).map((p) => "L" + p).join(" ")} L2600 1080 L-100 1080Z`} fill="#8a4a2a" opacity="0.6" transform={`translate(${-cam * 50} ${cam * 18})`} />
        {/* collines striées de rangs de thé */}
        {layers.map((l, i) => {
          const dx = -cam * 260 * l.depth, dy = cam * 220 * l.depth;
          const sc = 1 + cam * 0.25 * l.depth;
          const top = hill(l.base, l.amp, l.freq, l.phase);
          return (
            <g key={i} transform={`translate(${dx} ${dy}) translate(960 1080) scale(${sc}) translate(-960 -1080)`}>
              <clipPath id={`clip${i}`}>
                <path d={`M-200 1300 ${top.map((p) => "L" + p).join(" ")} L2600 1300Z`} />
              </clipPath>
              <path d={`M-200 1300 ${top.map((p) => "L" + p).join(" ")} L2600 1300Z`} fill={`url(#h${i})`} />
              <g clipPath={`url(#clip${i})`}>
                {Array.from({ length: l.rows }, (_, k) => (
                  <path
                    key={k}
                    d={`M-200 ${l.base + 20 + k * (14 + k * 2.2)} ${hill(l.base + 20 + k * (14 + k * 2.2), l.amp * (1 - k / (l.rows * 1.6)), l.freq, l.phase + 0.15).map((p) => "L" + p).join(" ")}`}
                    fill="none"
                    stroke="rgba(30,80,10,0.32)"
                    strokeWidth={2 + k * 0.45}
                  />
                ))}
              </g>
            </g>
          );
        })}
      </svg>
      {/* rayons de soleil */}
      <AbsoluteFill
        style={{
          background: `repeating-conic-gradient(from 0deg at 64% ${sunY / 10.8}%, rgba(255,240,190,0.16) 0deg 3deg, rgba(255,240,190,0) 3deg 11deg)`,
          mixBlendMode: "screen",
          opacity: rays,
          transform: `rotate(${t * 0.6}deg) scale(1.4)`,
          WebkitMaskImage: "linear-gradient(180deg, #000 0%, #000 55%, transparent 85%)",
        }}
      />
      {/* brume */}
      {Array.from({ length: 6 }, (_, i) => {
        const r = (k: string) => random(`mist${i}${k}`);
        const x = ((r("x") * 2400 + t * (12 + r("v") * 20)) % 2600) - 400;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - cam * 120,
              top: 520 + r("y") * 300 + cam * 60,
              width: 700 + r("w") * 500,
              height: 120 + r("h") * 80,
              borderRadius: "50%",
              background: "radial-gradient(ellipse, rgba(255,245,225,0.45) 0%, rgba(255,245,225,0) 70%)",
              filter: "blur(10px)",
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};
