import React from "react";
import { Img, staticFile, useCurrentFrame } from "remotion";
import { anim, EASE } from "../theme";

/** Proportions exactes du visuel fourni (1052 × 1324) — jamais modifiées. */
export const SACHET_RATIO = 1052 / 1324;

type Props = {
  height: number;
  /** début du reflet lumineux qui balaie l'emballage (optionnel) */
  shineAt?: number;
  shadow?: number;
};

/**
 * Le sachet TOPCAFÉ, tel quel. Seules des transformations uniformes
 * (échelle, position, légère rotation) sont appliquées par les scènes :
 * pas de déformation, pas de recoloration, pas de régénération.
 */
export const Sachet: React.FC<Props> = ({ height, shineAt, shadow = 1 }) => {
  const frame = useCurrentFrame();
  const width = height * SACHET_RATIO;
  const src = staticFile("sachet.png");
  const shineX = shineAt === undefined ? -1 : anim(frame, [shineAt, shineAt + 40], [-0.4, 1.4], EASE.inOut);
  return (
    <div style={{ position: "relative", width, height }}>
      {/* ombre portée au sol */}
      <div
        style={{
          position: "absolute",
          left: width * 0.08,
          right: width * 0.08,
          bottom: -height * 0.06,
          height: height * 0.08,
          borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 70%)",
          filter: "blur(12px)",
          opacity: shadow,
        }}
      />
      <Img
        src={src}
        style={{
          width,
          height,
          display: "block",
          filter: `drop-shadow(0 ${height * 0.04}px ${height * 0.05}px rgba(20,8,2,${0.55 * shadow}))`,
        }}
      />
      {shineX > -1 && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            WebkitMaskImage: `url(${src})`,
            WebkitMaskSize: "100% 100%",
            maskImage: `url(${src})`,
            maskSize: "100% 100%",
            mixBlendMode: "screen",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-30%",
              height: "160%",
              left: `${shineX * 100}%`,
              width: width * 0.32,
              transform: "translateX(-50%) rotate(20deg)",
              background:
                "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,248,235,0.55) 50%, rgba(255,255,255,0) 100%)",
              filter: "blur(6px)",
            }}
          />
        </div>
      )}
    </div>
  );
};
