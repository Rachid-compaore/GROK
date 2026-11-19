import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { FruitFlight, Glow, Particles } from "../components/Elements";
import { EASE, GOLD, spr, tw } from "../theme";

/** Scène 1 (0–4 s) : obscurité, lumière chaude, feuilles en ralenti, éclat doré, logo LIPTON. */
export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const warm = tw(frame, 0.1, 1.6, 0, 1, EASE.soft);
  const gold = tw(frame, 1.5, 2.3, 0, 1, EASE.inOut);
  const logo = spr(frame, 2.25, 13, 0.9, 120);
  const shine = tw(frame, 2.9, 3.6, -0.3, 1.3);
  const push = 1 + frame / 60 * 0.02;
  return (
    <AbsoluteFill style={{ background: "#080503" }}>
      <AbsoluteFill style={{ transform: `scale(${push})` }}>
        <Glow x={960} y={560} r={900} color="rgba(255,170,60,0.55)" opacity={warm} />
        <FruitFlight seed="intro-leaves" kinds={["leaf"]} count={9} at={0.0} area={{ x: 100, y: 100, w: 1720, h: 880 }} sizeBase={130} dir={1} />
        <Particles seed="intro" count={50} color="#ffcf70" speed={0.6} />
        {/* éclat doré : la couleur Lipton envahit l'écran depuis le centre */}
        <AbsoluteFill
          style={{
            clipPath: `circle(${gold * 1200}px at 50% 52%)`,
            background: `radial-gradient(circle at 50% 48%, ${GOLD.light} 0%, ${GOLD.mid} 45%, ${GOLD.deep} 100%)`,
          }}
        >
          <AbsoluteFill
            style={{
              background: "repeating-conic-gradient(from 0deg at 50% 52%, rgba(255,255,255,0.10) 0deg 5deg, rgba(255,255,255,0) 5deg 14deg)",
              transform: `rotate(${frame * 0.04}deg) scale(1.5)`,
            }}
          />
          <Glow x={960} y={520} r={560} color="rgba(255,255,230,0.7)" />
          <Particles seed="intro-gold" count={30} color="#fff6c8" speed={0.5} />
        </AbsoluteFill>
        <div style={{ position: "absolute", left: 960 - 330, top: 540 - 160, width: 660, height: 311, transform: `scale(${0.6 + logo * 0.4})`, opacity: Math.min(1, logo * 1.5) }}>
          <Img src={staticFile("logo-lipton.png")} style={{ width: 660, height: 311, filter: "drop-shadow(0 20px 30px rgba(120,50,0,0.35))" }} />
          <div style={{ position: "absolute", inset: 0, WebkitMaskImage: `url(${staticFile("logo-lipton.png")})`, WebkitMaskSize: "100% 100%", overflow: "hidden", mixBlendMode: "screen" }}>
            <div style={{ position: "absolute", top: "-30%", height: "160%", left: `${shine * 100}%`, width: 120, transform: "rotate(20deg)", background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.7), rgba(255,255,255,0))" }} />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
