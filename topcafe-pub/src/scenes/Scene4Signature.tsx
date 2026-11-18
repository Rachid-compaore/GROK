import React from "react";
import { random, useCurrentFrame } from "remotion";
import { Bean } from "../components/Bean";
import { Bokeh, Glow, LightSweep } from "../components/Effects";
import { LatteCup } from "../components/LatteCup";
import { Sachet, SACHET_RATIO } from "../components/Sachet";
import { SceneShell } from "../components/SceneShell";
import { GoldRule, RevealText } from "../components/Typo";
import { anim, COLORS, EASE, SANS, SERIF } from "../theme";

const H = 780;

/** Grains posés au premier plan, en bas de la composition. */
const GroundBeans: React.FC = () => {
  const frame = useCurrentFrame();
  const spots = [
    [170, 920, 0.9], [300, 975, 1], [880, 960, 0.8], [1010, 905, 0.6], [1180, 990, 1.05], [1760, 950, 0.85],
  ];
  return (
    <>
      {spots.map(([x, y, s], i) => {
        const p = anim(frame, [25 + i * 4, 70 + i * 4], [0, 1], EASE.out);
        const size = 70 * s;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y - (1 - p) * 40,
              opacity: p,
              transform: `rotate(${random(`gb${i}`) * 360}deg)`,
              filter: `blur(${s > 0.95 ? 3 : 0}px) drop-shadow(0 10px 10px rgba(0,0,0,0.5))`,
            }}
          >
            <Bean size={size} id={`g${i}`} spin={random(`gs${i}`) * 2} />
          </div>
        );
      })}
    </>
  );
};

/** Scène 4 (15–21 s) : composition premium produit + tasse + signature. */
export const Scene4Signature: React.FC = () => {
  const frame = useCurrentFrame();
  const sp = anim(frame, [5, 60], [0, 1], EASE.out);
  const cp = anim(frame, [15, 75], [0, 1], EASE.out);
  const W = H * SACHET_RATIO;
  return (
    <SceneShell
      push={[1.03, 1.0]}
      pan={[25, -25]}
      background={`radial-gradient(ellipse at 40% 45%, #a8703f 0%, #6a3e1f 38%, #2a160a 95%)`}
    >
      <Bokeh seed="sig" count={18} color="rgba(255,215,160,0.9)" opacity={0.55} />
      {/* surface en bois chaud, floue */}
      <div
        style={{
          position: "absolute",
          left: -200,
          right: -200,
          top: 860,
          bottom: -200,
          background: "linear-gradient(180deg, rgba(60,30,12,0) 0%, rgba(50,24,9,0.85) 30%, #1e0e05 100%)",
        }}
      />
      {/* tasse, en retrait et légèrement floue (profondeur) */}
      <div
        style={{
          position: "absolute",
          left: 1440,
          top: 590,
          opacity: cp,
          transform: `translateX(${(1 - cp) * 120}px) scale(0.75)`,
          filter: "blur(2.5px)",
        }}
      >
        <LatteCup size={420} foamFrom={-999} steamFrom={20} steamOpacity={0.7} />
      </div>
      <Glow x={560} y={520} r={520} color="rgba(255,225,180,0.45)" opacity={sp} />
      <div
        style={{
          position: "absolute",
          left: 560 - W / 2,
          top: 520 - H / 2,
          opacity: sp,
          transform: `translateX(${(1 - sp) * -90}px) translateY(${Math.sin(frame / 34) * 5}px) rotate(${-2 + (1 - sp) * -3}deg)`,
          filter: `blur(${(1 - sp) * 12}px)`,
        }}
      >
        <Sachet height={H} shineAt={70} />
      </div>
      <GroundBeans />
      <LightSweep start={30} end={200} intensity={0.14} />
      <div style={{ position: "absolute", left: 1040, top: 250, width: 820 }}>
        <RevealText
          text="TOPCAFÉ CAFÉ LATTE"
          start={45}
          byLetter
          stagger={1.6}
          style={{ fontFamily: SANS, fontWeight: 600, fontSize: 50, letterSpacing: 10, color: COLORS.cream }}
        />
        <GoldRule start={70} width={520} style={{ margin: "30px 0 26px" }} />
        <RevealText
          text="Crémeux et délicieux."
          start={78}
          style={{ fontFamily: SERIF, fontStyle: "italic", fontWeight: 700, fontSize: 84, color: COLORS.goldLight }}
        />
      </div>
    </SceneShell>
  );
};
