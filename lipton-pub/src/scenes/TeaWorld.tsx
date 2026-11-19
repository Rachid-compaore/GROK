import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FruitFlight, Glow, LetterReveal, LightStreaks, Particles, TeaCup } from "../components/Elements";
import { RevealMask } from "../components/Transitions";
import { EASE, FONT, GOLD, tw } from "../theme";

/** Scène 2 (4–7 s) : l'univers du thé noir — tasse dorée, vapeur, « L'INTENSITÉ DU THÉ NOIR ». */
export const TeaWorld: React.FC = () => {
  const frame = useCurrentFrame();
  const cam = tw(frame, 0, 3.6, 1.12, 1.0, EASE.out);
  const pan = tw(frame, 0, 3.6, 40, -30, EASE.soft);
  const cup = tw(frame, 0.2, 1.2, 0, 1, EASE.out);
  return (
    <RevealMask kind="iris" dur={0.6} flash="rgba(255,240,200,0.9)">
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 55%, #5a2a0c 0%, #2a1206 45%, #0b0503 100%)" }}>
        <AbsoluteFill style={{ transform: `translateX(${pan}px) scale(${cam})` }}>
          <Glow x={960} y={640} r={700} color="rgba(255,150,40,0.45)" />
          <Glow x={960} y={600} r={330} color={`rgba(255,220,140,0.35)`} />
          <div style={{ position: "absolute", left: 960 - 300, top: 470 + (1 - cup) * 80, transform: `scale(${0.92 + cup * 0.08})` }}>
            <TeaCup size={600} steamFrom={0.6} fill={tw(frame, 0.3, 1.6, 0.2, 1, EASE.out)} />
          </div>
          <FruitFlight seed="tea-leaves" kinds={["leaf"]} count={6} at={0.1} area={{ x: 150, y: 120, w: 1620, h: 820 }} avoid={{ x: 560, y: 380, w: 800, h: 640 }} sizeBase={110} />
          <Particles seed="tea" count={36} color={GOLD.light} speed={0.5} />
          <LightStreaks seed="tea" at={[0.9, 2.2]} />
        </AbsoluteFill>
        <div style={{ position: "absolute", top: 150, left: 0, width: 1920, display: "flex", justifyContent: "center" }}>
          <LetterReveal
            text="L'INTENSITÉ DU THÉ NOIR"
            at={0.55}
            stagger={0.03}
            style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 84, color: "#fff4dc", textShadow: "0 6px 30px rgba(255,140,30,0.5)" }}
          />
        </div>
        <div style={{ position: "absolute", top: 262, left: 960 - tw(frame, 1.4, 2.2, 0, 220, EASE.out), width: tw(frame, 1.4, 2.2, 0, 440, EASE.out), height: 3, background: `linear-gradient(90deg, transparent, ${GOLD.mid}, transparent)` }} />
      </AbsoluteFill>
    </RevealMask>
  );
};
