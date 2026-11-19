import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Fruit } from "../components/Fruits";
import { Glow, LetterReveal, LightStreaks, Pack, Particles, WordReveal } from "../components/Elements";
import { RevealMask } from "../components/Transitions";
import { EASE, FLAVORS, FONT, FruitKind, GOLD, spr, tw } from "../theme";

const ORDER = [FLAVORS.blackcurrant, FLAVORS.strawberry, FLAVORS.lemon, FLAVORS.forest];
const SIDE_FRUIT: FruitKind[] = ["cassis", "strawberry", "lemonSlice", "raspberry"];

/** Scène 7 (26–30 s) : les 4 saveurs côte à côte, « 4 SAVEURS », « À VOUS DE CHOISIR VOTRE MOMENT. » */
export const Finale: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 60;
  const cam = tw(frame, 0, 4.2, 1.05, 1.0, EASE.out);
  const PH = 560, PW = PH * 0.41, GAP = 110;
  const total = 4 * PW + 3 * GAP;
  return (
    <RevealMask kind="iris" dur={0.7} flash="rgba(255,250,220,0.9)">
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 55%, ${GOLD.light} 0%, ${GOLD.mid} 45%, ${GOLD.deep} 100%)` }}>
        <AbsoluteFill style={{ background: "repeating-conic-gradient(from 0deg at 50% 60%, rgba(255,255,255,0.10) 0deg 4deg, rgba(255,255,255,0) 4deg 12deg)", transform: `rotate(${frame * 0.03}deg) scale(1.6)` }} />
        <Particles seed="finale" count={40} color="#fffbe0" speed={0.5} />
        <AbsoluteFill style={{ transform: `scale(${cam})` }}>
          <Glow x={960} y={600} r={900} color="rgba(255,255,235,0.6)" />
          {ORDER.map((f, i) => {
            const p = spr(frame, 0.35 + i * 0.13, 14, 1, 100);
            const x = 960 - total / 2 + i * (PW + GAP);
            const fp = spr(frame, 0.9 + i * 0.1, 12, 0.8, 120);
            return (
              <React.Fragment key={f.key}>
                <div style={{ position: "absolute", left: x + PW / 2 - 45, top: 872 + (1 - fp) * 60, transform: `scale(${fp}) rotate(${Math.sin(t + i) * 8}deg)`, zIndex: 3, filter: "drop-shadow(0 12px 14px rgba(0,0,0,0.3))" }}>
                  <Fruit kind={SIDE_FRUIT[i]} size={90} id={`fin${i}`} />
                </div>
                <div
                  style={{
                    position: "absolute",
                    left: x,
                    top: 300 + (1 - p) * 600 + Math.sin(t * 1.3 + i) * 5,
                    transform: `rotate(${(1 - p) * (i % 2 ? 8 : -8)}deg)`,
                    zIndex: 2,
                  }}
                >
                  <Pack src={f.pack} height={PH} shineAt={1.6 + i * 0.12} />
                </div>
              </React.Fragment>
            );
          })}
          <LightStreaks seed="finale" at={[1.2, 2.6]} />
        </AbsoluteFill>
        <div style={{ position: "absolute", top: 70, left: 0, width: 1920, display: "flex", justifyContent: "center" }}>
          <LetterReveal text="4 SAVEURS" at={0.5} stagger={0.05} style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 120, color: "#b3001b", textShadow: "0 6px 20px rgba(255,255,255,0.4)" }} />
        </div>
        <div style={{ position: "absolute", top: 985, left: 0, width: 1920, display: "flex", justifyContent: "center" }}>
          <WordReveal text="À VOUS DE CHOISIR VOTRE MOMENT." at={1.3} stagger={0.07} style={{ fontFamily: FONT.sans, fontWeight: 700, fontSize: 52, letterSpacing: 6, color: "#5a1a00" }} />
        </div>
      </AbsoluteFill>
    </RevealMask>
  );
};
