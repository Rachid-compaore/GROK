import React from "react";
import { random, useCurrentFrame } from "remotion";
import { Bean } from "./Bean";

type Props = {
  seed: string;
  count: number;
  /** zone occupée par les grains */
  area?: { x: number; y: number; w: number; h: number };
  /** grains au premier plan (flous, grands) ou à l'arrière (flous, petits) */
  depthRange?: [number, number];
  drift?: number;
  sizeScale?: number;
  opacity?: number;
};

/**
 * Grains de café qui flottent lentement, avec profondeur de champ :
 * plus un grain est loin du plan de netteté (depth = 0.5), plus il est flou.
 */
export const BeanField: React.FC<Props> = ({
  seed,
  count,
  area = { x: -100, y: -100, w: 2120, h: 1280 },
  depthRange = [0, 1],
  drift = 1,
  sizeScale = 1,
  opacity = 1,
}) => {
  const frame = useCurrentFrame();
  const beans = Array.from({ length: count }, (_, i) => {
    const r = (k: string) => random(`${seed}-${i}-${k}`);
    const depth = depthRange[0] + (depthRange[1] - depthRange[0]) * r("d");
    const size = (40 + depth * 120) * sizeScale;
    const blur = Math.abs(depth - 0.5) * 16;
    const t = frame / 30;
    const x = area.x + r("x") * area.w + Math.sin(t * (0.3 + r("fx") * 0.4) + r("p") * 6) * 30 * drift;
    const y = area.y + r("y") * area.h - t * (8 + depth * 22) * drift + Math.cos(t * 0.5 + r("q") * 6) * 18 * drift;
    const rot = r("r") * 360 + t * (r("vr") - 0.5) * 30 * drift;
    const spin = r("s") * 6 + t * (r("vs") - 0.5) * 1.2 * drift;
    const light = 0.55 + depth * 0.45;
    return { i, depth, size, blur, x, y, rot, spin, light };
  }).sort((a, b) => a.depth - b.depth);

  return (
    <div style={{ position: "absolute", inset: 0, opacity }}>
      {beans.map((b) => (
        <div
          key={b.i}
          style={{
            position: "absolute",
            left: b.x,
            top: b.y,
            transform: `rotate(${b.rot}deg)`,
            filter: `blur(${b.blur}px) brightness(${b.light}) drop-shadow(0 ${10 + b.depth * 20}px ${14 + b.depth * 16}px rgba(0,0,0,0.45))`,
          }}
        >
          <Bean size={b.size} id={`${seed}${b.i}`} spin={b.spin} />
        </div>
      ))}
    </div>
  );
};
