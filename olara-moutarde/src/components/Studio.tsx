import React from "react";
import { Img, staticFile, useCurrentFrame } from "remotion";
import { tw } from "../theme";

/**
 * Pot OLARA (photo fournie, détourée — jamais redessiné ni déformé).
 * Ombre de contact, reflet sur le sol, et reflet lumineux qui glisse sur le verre
 * (masqué par la forme exacte du pot).
 */
export const Jar: React.FC<{ src: string; height: number; ratio: number; shineAt?: number[]; reflection?: number; light?: number }> = ({
  src,
  height,
  ratio,
  shineAt = [],
  reflection = 0.22,
  light = 1,
}) => {
  const frame = useCurrentFrame();
  const url = staticFile(src);
  const width = height * ratio;
  return (
    <div style={{ position: "relative", width, height }}>
      {/* ombre de contact */}
      <div style={{ position: "absolute", left: width * 0.04, right: width * 0.04, bottom: -height * 0.025, height: height * 0.06, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 70%)", filter: "blur(6px)" }} />
      {/* reflet au sol */}
      <div style={{ position: "absolute", top: height - 3, left: 0, width, height, opacity: reflection * light, WebkitMaskImage: "linear-gradient(180deg, #000 0%, transparent 38%)", maskImage: "linear-gradient(180deg, #000 0%, transparent 38%)" }}>
        <Img src={url} style={{ width, height, transform: "scaleY(-1)", filter: "blur(1.5px)" }} />
      </div>
      <Img src={url} style={{ position: "absolute", inset: 0, width, height, filter: `brightness(${0.04 + 0.96 * light}) contrast(${1 + 0.05 * light})` }} />
      {/* reflet lumineux sur le verre */}
      <div style={{ position: "absolute", inset: 0, WebkitMaskImage: `url(${url})`, WebkitMaskSize: "100% 100%", maskImage: `url(${url})`, maskSize: "100% 100%", overflow: "hidden", mixBlendMode: "screen" }}>
        {shineAt.map((a, i) => {
          const x = tw(frame, a, a + 1.1, -0.3, 1.3);
          if (x <= -0.3 || x >= 1.3) return null;
          return <div key={i} style={{ position: "absolute", top: "-10%", height: "120%", left: `${x * 100}%`, width: width * 0.16, transform: "translateX(-50%) rotate(8deg)", background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,250,225,0.5), rgba(255,255,255,0))" }} />;
        })}
        {/* liseré lumineux fixe sur le bord gauche du verre (lumière de contre-jour) */}
        <div style={{ position: "absolute", top: 0, bottom: 0, left: 0, width: width * 0.06, background: "linear-gradient(90deg, rgba(255,240,200,0.35), rgba(255,240,200,0))", opacity: light }} />
      </div>
    </div>
  );
};

/** Projecteur de studio : cône de lumière volumétrique qui s'allume (léger scintillement). */
export const Spotlight: React.FC<{ x: number; at: number; height: number; width: number; floorY: number; color?: string }> = ({ x, at, height, width, floorY, color = "255,236,190" }) => {
  const frame = useCurrentFrame();
  const t = frame / 60 - at;
  if (t < 0) return null;
  const on = Math.min(1, t / 0.08) * (t < 0.2 ? 0.75 + 0.25 * Math.sin(t * 120) : 1);
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: x - width / 2,
          top: floorY - height,
          width,
          height,
          background: `linear-gradient(180deg, rgba(${color},0.0) 0%, rgba(${color},${0.16 * on}) 40%, rgba(${color},${0.22 * on}) 100%)`,
          clipPath: "polygon(42% 0, 58% 0, 100% 100%, 0 100%)",
          filter: "blur(18px)",
          mixBlendMode: "screen",
        }}
      />
      <div style={{ position: "absolute", left: x - width * 0.6, top: floorY - 40, width: width * 1.2, height: 80, borderRadius: "50%", background: `radial-gradient(ellipse, rgba(${color},${0.45 * on}) 0%, rgba(${color},0) 70%)`, mixBlendMode: "screen" }} />
    </>
  );
};
