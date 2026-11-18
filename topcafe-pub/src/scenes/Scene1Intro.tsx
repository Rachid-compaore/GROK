import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { BeanField } from "../components/BeanField";
import { Glow, LightSweep } from "../components/Effects";
import { LatteCup } from "../components/LatteCup";
import { SceneShell } from "../components/SceneShell";
import { GoldRule, RevealText } from "../components/Typo";
import { anim, COLORS, EASE, SERIF } from "../theme";

/** Scène 1 (0–4 s) : ambiance café, grains en apesanteur, lumière, tasse. */
export const Scene1Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const cupP = anim(frame, [30, 95], [0, 1], EASE.out);
  return (
    <SceneShell
      fadeIn={false}
      push={[1.0, 1.08]}
      pan={[0, -40]}
      background={`radial-gradient(ellipse at 62% 45%, #5a321a 0%, ${COLORS.chocolate} 35%, ${COLORS.espresso} 85%)`}
    >
      <BeanField seed="intro-back" count={16} depthRange={[0, 0.45]} sizeScale={0.8} />
      <Glow x={1360} y={560} r={520} color="rgba(255,190,120,0.28)" opacity={cupP} />
      <AbsoluteFill
        style={{
          left: 1360 - 230,
          top: 560 - 230,
          width: 460,
          height: 460,
          opacity: cupP,
          transform: `translateY(${(1 - cupP) * 90}px) scale(${0.9 + cupP * 0.1}) rotate(${(1 - cupP) * -25}deg)`,
          filter: `blur(${(1 - cupP) * 10}px)`,
        }}
      >
        <LatteCup size={460} foamFrom={-999} steamFrom={55} steamOpacity={0.8} />
      </AbsoluteFill>
      <LightSweep start={0} end={135} intensity={0.3} />
      <BeanField seed="intro-front" count={5} depthRange={[0.8, 1]} sizeScale={1.2} drift={1.4} />
      <div style={{ position: "absolute", left: 170, top: 400 }}>
        <RevealText
          text="L'instant douceur"
          start={18}
          style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, fontSize: 92, color: COLORS.cream, letterSpacing: 1 }}
        />
        <RevealText
          text="commence ici..."
          start={34}
          style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: 92, color: COLORS.goldLight, marginTop: 4 }}
        />
        <GoldRule start={50} width={360} style={{ marginTop: 34 }} />
      </div>
    </SceneShell>
  );
};
