import React from "react";
import { useCurrentFrame } from "remotion";
import { BeanField } from "../components/BeanField";
import { Bokeh, Glow, LightSweep } from "../components/Effects";
import { LatteCup } from "../components/LatteCup";
import { SceneShell } from "../components/SceneShell";
import { GoldRule, RevealText } from "../components/Typo";
import { anim, COLORS, EASE, SERIF } from "../theme";

/** Scène 3 (9–15 s) : la mousse apparaît, le lait tourbillonne, la vapeur monte. */
export const Scene3Taste: React.FC = () => {
  const frame = useCurrentFrame();
  const camera = anim(frame, [0, 120], [1.22, 1.0], EASE.out);
  const rot = anim(frame, [0, 195], [-12, 6], EASE.soft);
  const D = 590;
  const CX = 1400;
  return (
    <SceneShell
      push={[1.0, 1.04]}
      background={`radial-gradient(ellipse at 66% 50%, #6a3d20 0%, #3c2111 40%, ${COLORS.espresso} 92%)`}
    >
      <Bokeh seed="taste" count={14} color="rgba(255,200,140,0.9)" opacity={0.5} />
      <Glow x={CX} y={560} r={560} color="rgba(255,205,150,0.35)" />
      <div
        style={{
          position: "absolute",
          left: CX - D / 2,
          top: 560 - D / 2,
          transform: `scale(${camera}) rotate(${rot}deg)`,
        }}
      >
        <LatteCup size={D} pourFrom={8} foamFrom={30} foamDur={75} steamFrom={70} />
      </div>
      <LightSweep start={40} end={190} intensity={0.16} />
      <BeanField seed="taste-front" count={4} depthRange={[0.85, 1]} area={{ x: -100, y: 600, w: 900, h: 600 }} drift={0.6} />
      <div style={{ position: "absolute", left: 130, top: 380 }}>
        <RevealText
          text="Une texture crémeuse..."
          start={25}
          style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 400, fontSize: 70, color: COLORS.cream }}
        />
        <GoldRule start={60} width={300} style={{ margin: "30px 0" }} />
        <RevealText
          text="Un plaisir"
          start={90}
          style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: 76, color: COLORS.goldLight }}
        />
        <RevealText
          text="intensément gourmand."
          start={100}
          style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: 76, color: COLORS.goldLight }}
        />
      </div>
    </SceneShell>
  );
};
