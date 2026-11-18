import React from "react";
import { random, useCurrentFrame } from "remotion";
import { Bean } from "../components/Bean";
import { Glow, LightSweep } from "../components/Effects";
import { Sachet, SACHET_RATIO } from "../components/Sachet";
import { SceneShell } from "../components/SceneShell";
import { anim, COLORS, EASE } from "../theme";

const H = 820;

/** Grains en orbite lente autour du sachet : certains devant (flous), d'autres derrière. */
const Orbit: React.FC<{ front: boolean }> = ({ front }) => {
  const frame = useCurrentFrame();
  const appear = anim(frame, [20, 70], [0, 1], EASE.out);
  return (
    <>
      {Array.from({ length: 9 }, (_, i) => {
        const r = (k: string) => random(`orbit-${i}-${k}`);
        const a = (i / 9) * Math.PI * 2 + frame * 0.006 + r("a") * 0.5;
        const z = Math.sin(a); // >0 : devant
        if (front !== z > 0) return null;
        const rx = 620 + r("rx") * 120;
        const ry = 150 + r("ry") * 80;
        const x = 960 + Math.cos(a) * rx * (0.6 + appear * 0.4);
        const y = 540 + z * ry - 40 + Math.sin(frame / 40 + i) * 14;
        const depth = (z + 1) / 2;
        const size = 46 + depth * 70;
        // devant le sachet : on s'écarte pour ne jamais masquer le produit
        const clear = front ? Math.min(1, Math.max(0, (Math.abs(x - 960) - 330) / 120)) : 1;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - size / 2,
              top: y - size * 0.65,
              opacity: appear * clear,
              transform: `rotate(${r("rot") * 360 + frame * (r("v") - 0.5) * 0.8}deg)`,
              filter: `blur(${front ? depth * 9 : (1 - depth) * 6}px) brightness(${0.55 + depth * 0.45}) drop-shadow(0 14px 18px rgba(0,0,0,0.45))`,
            }}
          >
            <Bean size={size} id={`o${i}`} spin={r("s") * 6 + frame * 0.02} />
          </div>
        );
      })}
    </>
  );
};

/** Scène 2 (4–9 s) : le sachet, net, éclairé, dominant. */
export const Scene2Product: React.FC = () => {
  const frame = useCurrentFrame();
  const p = anim(frame, [8, 62], [0, 1], EASE.out);
  const float = Math.sin(frame / 32) * 6;
  const W = H * SACHET_RATIO;
  return (
    <SceneShell
      push={[1.0, 1.06]}
      background={`radial-gradient(ellipse at 50% 46%, #7a4826 0%, #4a2a16 35%, ${COLORS.espresso} 90%)`}
    >
      <Glow x={960} y={520} r={640} color="rgba(255,214,160,0.42)" opacity={p} />
      <Orbit front={false} />
      <div
        style={{
          position: "absolute",
          left: 960 - W / 2,
          top: 540 - H / 2 - 10,
          opacity: p,
          transform: `translateY(${(1 - p) * 70 + float}px) scale(${0.86 + p * 0.14}) rotate(${(1 - p) * -3 + Math.sin(frame / 45) * 0.6}deg)`,
          filter: `blur(${(1 - p) * 14}px)`,
        }}
      >
        <Sachet height={H} shineAt={85} />
      </div>
      <Orbit front />
      <LightSweep start={60} end={180} intensity={0.18} />
    </SceneShell>
  );
};
