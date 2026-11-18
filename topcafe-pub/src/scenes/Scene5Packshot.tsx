import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { Glow, LightSweep } from "../components/Effects";
import { Sachet, SACHET_RATIO } from "../components/Sachet";
import { SceneShell } from "../components/SceneShell";
import { RevealText } from "../components/Typo";
import { anim, COLORS, EASE, SANS, SERIF } from "../theme";

const H = 730;

/** Fines particules dorées qui montent doucement. */
const Particles: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      {Array.from({ length: 40 }, (_, i) => {
        const r = (k: string) => random(`pt-${i}-${k}`);
        const y = (r("y") * 1200 - frame * (0.4 + r("v") * 0.8) + 1200) % 1200 - 60;
        const x = r("x") * 1920 + Math.sin(frame / 40 + r("p") * 6) * 12;
        const s = 2 + r("s") * 5;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: s,
              height: s,
              borderRadius: "50%",
              background: COLORS.goldLight,
              opacity: 0.25 + r("o") * 0.45,
              boxShadow: `0 0 ${s * 3}px ${COLORS.gold}`,
            }}
          />
        );
      })}
    </>
  );
};

/** Scène 5 (21–25 s) : packshot final aux couleurs de la marque. */
export const Scene5Packshot: React.FC = () => {
  const frame = useCurrentFrame();
  const p = anim(frame, [5, 55], [0, 1], EASE.out);
  const endFade = anim(frame, [108, 130], [0, 1], EASE.inOut);
  const W = H * SACHET_RATIO;
  return (
    <SceneShell
      fadeOut={false}
      push={[1.0, 1.035]}
      background={`radial-gradient(ellipse at 50% 42%, #2d63d2 0%, ${COLORS.blue} 35%, ${COLORS.blueDeep} 100%)`}
    >
      <AbsoluteFill
        style={{
          background: "repeating-conic-gradient(from 0deg at 50% 42%, rgba(255,255,255,0.035) 0deg 6deg, rgba(255,255,255,0) 6deg 12deg)",
          transform: `rotate(${frame * 0.05}deg) scale(1.6)`,
          opacity: p,
        }}
      />
      <Particles />
      <Glow x={960} y={440} r={560} color="rgba(255,240,215,0.38)" opacity={p} />
      <div
        style={{
          position: "absolute",
          left: 960 - W / 2,
          top: 440 - H / 2,
          opacity: p,
          transform: `translateY(${(1 - p) * 50 + Math.sin(frame / 34) * 4}px) scale(${0.9 + p * 0.1})`,
          filter: `blur(${(1 - p) * 12}px)`,
        }}
      >
        <Sachet height={H} shineAt={50} shadow={0.8} />
      </div>
      <LightSweep start={20} end={130} intensity={0.12} color="200,220,255" />
      <div style={{ position: "absolute", left: 0, width: 1920, top: 862, textAlign: "center" }}>
        <RevealText
          text="TOPCAFÉ CAFÉ LATTE"
          start={30}
          byLetter
          stagger={1.4}
          style={{ fontFamily: SANS, fontWeight: 600, fontSize: 36, letterSpacing: 12, color: COLORS.cream }}
        />
        <RevealText
          text="Savourez l'instant."
          start={48}
          style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: 70, color: COLORS.goldLight, marginTop: 10 }}
        />
      </div>
      <AbsoluteFill style={{ background: "#000", opacity: endFade }} />
    </SceneShell>
  );
};
