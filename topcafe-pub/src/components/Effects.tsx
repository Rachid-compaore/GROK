import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { anim, EASE } from "../theme";

/** Faisceau de lumière chaude qui traverse lentement la scène. */
export const LightSweep: React.FC<{
  start: number;
  end: number;
  angle?: number;
  intensity?: number;
  color?: string;
}> = ({ start, end, angle = -24, intensity = 0.32, color = "255,214,160" }) => {
  const frame = useCurrentFrame();
  const x = anim(frame, [start, end], [-60, 140], EASE.soft);
  const o = anim(frame, [start, start + 20], [0, 1]) * anim(frame, [end - 25, end], [1, 0]);
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen", opacity: o, pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute",
          top: "-50%",
          left: `${x}%`,
          width: 700,
          height: "200%",
          transform: `translateX(-50%) rotate(${angle}deg)`,
          background: `linear-gradient(90deg, rgba(${color},0) 0%, rgba(${color},${intensity}) 50%, rgba(${color},0) 100%)`,
          filter: "blur(40px)",
        }}
      />
    </AbsoluteFill>
  );
};

/** Halo de lumière (projecteur doux) derrière un sujet. */
export const Glow: React.FC<{
  x: number;
  y: number;
  r: number;
  color: string;
  opacity?: number;
}> = ({ x, y, r, color, opacity = 1 }) => (
  <div
    style={{
      position: "absolute",
      left: x - r,
      top: y - r,
      width: r * 2,
      height: r * 2,
      borderRadius: "50%",
      background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      opacity,
    }}
  />
);

/** Bokeh : petites lumières floues d'arrière-plan qui dérivent. */
export const Bokeh: React.FC<{ seed: string; count: number; color: string; opacity?: number }> = ({
  seed,
  count,
  color,
  opacity = 1,
}) => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity, mixBlendMode: "screen" }}>
      {Array.from({ length: count }, (_, i) => {
        const r = (k: string) => random(`${seed}-${i}-${k}`);
        const size = 30 + r("s") * 140;
        const x = r("x") * 1920 + Math.sin(frame / 60 + r("p") * 6) * 25;
        const y = r("y") * 1080 - (frame * (0.15 + r("v") * 0.3)) % 1300;
        const o = 0.12 + r("o") * 0.3 + Math.sin(frame / 25 + r("t") * 6) * 0.06;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y < -200 ? y + 1300 : y,
              width: size,
              height: size,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${color} 0%, ${color} 45%, transparent 72%)`,
              opacity: o,
              filter: `blur(${4 + r("b") * 8}px)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Grain pellicule + vignettage : la texture qui donne le côté « film ». */
export const FilmFinish: React.FC = () => {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame / 2);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.28) 85%, rgba(0,0,0,0.5) 100%)",
        }}
      />
      <svg width="1920" height="1080" style={{ position: "absolute", opacity: 0.07, mixBlendMode: "overlay" }}>
        <filter id={`grain-${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed={seed} />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="1920" height="1080" filter={`url(#grain-${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};
