import React from "react";
import { Img, staticFile, useCurrentFrame } from "remotion";
import { anim, EASE } from "../theme";

type Props = {
  /** diamètre de la tasse */
  size: number;
  /** image de début d'apparition de la mousse (révélation progressive) */
  foamFrom?: number;
  foamDur?: number;
  /** image de début du filet de lait (spirale) */
  pourFrom?: number;
  /** image de début des volutes de vapeur */
  steamFrom?: number;
  steamOpacity?: number;
};

/**
 * Tasse de café latte vue du dessus : soucoupe, tasse bleue (rappel du
 * packaging), mousse avec latte art, filet de lait et vapeur.
 */
export const LatteCup: React.FC<Props> = ({
  size,
  foamFrom = -999,
  foamDur = 60,
  pourFrom,
  steamFrom,
  steamOpacity = 1,
}) => {
  const frame = useCurrentFrame();
  const D = size;
  const foamP = anim(frame, [foamFrom, foamFrom + foamDur], [0, 1], EASE.out);
  const foamRot = anim(frame, [foamFrom, foamFrom + foamDur * 2.2], [-38, 0], EASE.out) + Math.sin(frame / 50) * 1.5;
  const inner = D * 0.84;

  return (
    <div style={{ position: "relative", width: D, height: D }}>
      {/* ombre */}
      <div
        style={{
          position: "absolute",
          left: -D * 0.2,
          top: -D * 0.12,
          width: D * 1.5,
          height: D * 1.5,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,0,0,0.55) 35%, rgba(0,0,0,0) 68%)",
          filter: "blur(20px)",
        }}
      />
      {/* soucoupe */}
      <div
        style={{
          position: "absolute",
          left: -D * 0.22,
          top: -D * 0.22,
          width: D * 1.44,
          height: D * 1.44,
          borderRadius: "50%",
          background: "radial-gradient(circle at 38% 32%, #ffffff 0%, #f1f3f8 40%, #c9d0de 100%)",
          boxShadow: "inset 0 0 0 10px rgba(255,255,255,0.6), inset 0 -20px 40px rgba(60,70,100,0.25)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: D * 0.12,
            borderRadius: "50%",
            boxShadow: "inset 0 6px 18px rgba(80,90,120,0.28)",
          }}
        />
      </div>
      {/* anse */}
      <div
        style={{
          position: "absolute",
          left: D * 0.86,
          top: D * 0.4,
          width: D * 0.34,
          height: D * 0.2,
          borderRadius: D * 0.1,
          background: "linear-gradient(180deg, #3a73e0, #163f9e)",
          boxShadow: "0 10px 18px rgba(0,0,0,0.35)",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: D * 0.12,
            top: D * 0.05,
            width: D * 0.16,
            height: D * 0.1,
            borderRadius: D * 0.05,
            background: "#d8dde8",
            boxShadow: "inset 0 4px 8px rgba(0,0,0,0.25)",
          }}
        />
      </div>
      {/* tasse */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: "radial-gradient(circle at 35% 30%, #4a83ec 0%, #1d4fb8 45%, #0e2f7c 100%)",
          boxShadow: "0 18px 40px rgba(0,0,0,0.4)",
        }}
      />
      {/* bord intérieur porcelaine */}
      <div
        style={{
          position: "absolute",
          inset: D * 0.035,
          borderRadius: "50%",
          background: "radial-gradient(circle at 60% 70%, #ffffff 0%, #eef1f6 60%, #c6cdda 100%)",
        }}
      />
      {/* café + mousse */}
      <div
        style={{
          position: "absolute",
          left: (D - inner) / 2,
          top: (D - inner) / 2,
          width: inner,
          height: inner,
          borderRadius: "50%",
          overflow: "hidden",
          background: "radial-gradient(circle at 45% 40%, #b77a43 0%, #8a5226 55%, #5a3015 100%)",
          boxShadow: "inset 0 10px 30px rgba(60,25,5,0.6)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            WebkitMaskImage: `radial-gradient(circle, #000 ${foamP * 70}%, transparent ${foamP * 70 + 18}%)`,
            maskImage: `radial-gradient(circle, #000 ${foamP * 70}%, transparent ${foamP * 70 + 18}%)`,
            transform: `rotate(${foamRot}deg) scale(${1.02 + (1 - foamP) * 0.15})`,
            opacity: Math.min(1, foamP * 1.6),
          }}
        >
          <Img src={staticFile("foam.png")} style={{ width: "100%", height: "100%" }} />
        </div>
        {pourFrom !== undefined && <MilkSwirl from={pourFrom} size={inner} />}
        {/* reflet de surface */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background: "radial-gradient(ellipse at 30% 22%, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0) 35%)",
            boxShadow: "inset 0 0 26px rgba(70,30,8,0.45)",
          }}
        />
      </div>
      {/* reflet spéculaire du bord */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background:
            "conic-gradient(from 200deg, rgba(255,255,255,0) 0deg, rgba(255,255,255,0.45) 30deg, rgba(255,255,255,0) 70deg, rgba(255,255,255,0) 360deg)",
          WebkitMaskImage: `radial-gradient(circle, transparent ${48.2}%, #000 ${48.6}%, #000 ${50}%, transparent 50.1%)`,
          maskImage: `radial-gradient(circle, transparent ${48.2}%, #000 ${48.6}%, #000 ${50}%, transparent 50.1%)`,
        }}
      />
      {steamFrom !== undefined && <Steam from={steamFrom} size={D} opacity={steamOpacity} />}
    </div>
  );
};

/** Filet de lait qui dessine une spirale puis se fond dans la mousse. */
const MilkSwirl: React.FC<{ from: number; size: number }> = ({ from, size }) => {
  const frame = useCurrentFrame();
  const draw = anim(frame, [from, from + 45], [0, 1], EASE.inOut);
  const fade = anim(frame, [from + 35, from + 70], [1, 0], EASE.inOut);
  if (fade <= 0) return null;
  const pts: string[] = [];
  const turns = 3.2;
  for (let i = 0; i <= 220; i++) {
    const t = i / 220;
    const a = t * turns * Math.PI * 2;
    const r = (0.05 + t * 0.4) * size;
    pts.push(`${size / 2 + Math.cos(a) * r},${size / 2 + Math.sin(a) * r}`);
  }
  const len = size * 6;
  return (
    <svg width={size} height={size} style={{ position: "absolute", inset: 0, opacity: fade }}>
      <polyline
        points={pts.join(" ")}
        fill="none"
        stroke="rgba(255,250,240,0.92)"
        strokeWidth={size * 0.035}
        strokeLinecap="round"
        strokeDasharray={len}
        strokeDashoffset={len * (1 - draw)}
        style={{ filter: "blur(3px)" }}
      />
    </svg>
  );
};

/** Volutes de vapeur : courbes douces recalculées à chaque image (aucun saut). */
export const Steam: React.FC<{ from: number; size: number; opacity?: number }> = ({ from, size, opacity = 1 }) => {
  const frame = useCurrentFrame();
  const t = (frame - from) / 30;
  const appear = anim(frame, [from, from + 40], [0, 1], EASE.inOut) * opacity;
  if (appear <= 0) return null;
  const W = size * 1.2;
  const H = size * 1.1;
  const wisps = [0, 1, 2, 3].map((k) => {
    const pts: string[] = [];
    const baseX = W * (0.32 + k * 0.12);
    for (let i = 0; i <= 40; i++) {
      const y = H - (i / 40) * H;
      const h = i / 40;
      const x =
        baseX +
        Math.sin(h * 5 + t * (1.1 + k * 0.15) + k * 1.7) * size * 0.05 * (0.4 + h) +
        Math.sin(h * 11 - t * 0.7 + k) * size * 0.015;
      pts.push(`${x},${y}`);
    }
    return pts.join(" ");
  });
  return (
    <svg
      width={W}
      height={H}
      style={{
        position: "absolute",
        left: (size - W) / 2,
        top: size * 0.35 - H,
        opacity: appear,
        WebkitMaskImage: "linear-gradient(0deg, transparent 0%, #000 25%, #000 50%, transparent 100%)",
        maskImage: "linear-gradient(0deg, transparent 0%, #000 25%, #000 50%, transparent 100%)",
        overflow: "visible",
      }}
    >
      {wisps.map((d, k) => (
        <polyline
          key={k}
          points={d}
          fill="none"
          stroke="rgba(255,255,255,0.5)"
          strokeWidth={size * (0.05 + (k % 2) * 0.02)}
          strokeLinecap="round"
          style={{ filter: `blur(${size * 0.03}px)` }}
        />
      ))}
    </svg>
  );
};
