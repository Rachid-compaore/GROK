import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { EASE, tw } from "../theme";

type Kind = "wave" | "splash" | "burst" | "diagonal" | "iris" | "none";

/** Chemin d'une vague liquide qui monte (k ∈ [0,1]). */
function wavePath(k: number, t: number) {
  const y = 1180 - k * 1320;
  let d = `M0 1080 L0 ${y}`;
  for (let x = 0; x <= 1920; x += 40) {
    const amp = 60 * Math.sin(Math.PI * k);
    d += ` L${x} ${y + Math.sin(x / 180 + t * 5) * amp + Math.sin(x / 70 - t * 3) * amp * 0.3}`;
  }
  return d + " L1920 1080 Z";
}

/** Tache liquide ondulée (éclaboussure) centrée en (cx, cy), de rayon r. */
function blobPath(cx: number, cy: number, r: number, t: number, wobble = 0.12, lobes = 9) {
  let d = "";
  for (let i = 0; i <= 120; i++) {
    const a = (i / 120) * Math.PI * 2;
    const rr = r * (1 + wobble * Math.sin(a * lobes + t * 4) + wobble * 0.5 * Math.sin(a * (lobes + 4) - t * 3));
    d += `${i === 0 ? "M" : "L"}${cx + Math.cos(a) * rr} ${cy + Math.sin(a) * rr} `;
  }
  return d + "Z";
}

/**
 * Révèle la scène par un masque animé (au début de la scène, durée `dur`) :
 * vague liquide, éclaboussure, éclat lumineux, balayage diagonal ou iris.
 */
export const RevealMask: React.FC<{ kind: Kind; dur?: number; children: React.ReactNode; flash?: string }> = ({ kind, dur = 0.65, children, flash }) => {
  const frame = useCurrentFrame();
  const t = frame / 60;
  const k = tw(frame, 0, dur, 0, 1, EASE.inOut);
  let clip = "none";
  if (k < 1 && kind !== "none") {
    if (kind === "wave") clip = `path('${wavePath(k, t)}')`;
    else if (kind === "splash") clip = `path('${blobPath(1500, 560, k * 2300, t, 0.14 * (1 - k * 0.7))}')`;
    else if (kind === "burst") clip = `path('${blobPath(960, 540, k * 1250, t, 0.05 * (1 - k), 14)}')`;
    else if (kind === "iris") clip = `circle(${k * 1150}px at 50% 50%)`;
    else if (kind === "diagonal") {
      const x = -600 + k * 3200;
      clip = `polygon(0 0, ${x}px 0, ${x - 600}px 1080px, 0 1080px)`;
    }
  }
  const f = flash ? tw(frame, dur * 0.6, dur * 0.85, 0, 1) * (1 - tw(frame, dur * 0.85, dur + 0.35, 0, 1)) : 0;
  return (
    <AbsoluteFill style={{ clipPath: clip }}>
      {children}
      {f > 0 && <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, ${flash} 0%, transparent 70%)`, opacity: f * 0.8, mixBlendMode: "screen" }} />}
    </AbsoluteFill>
  );
};
