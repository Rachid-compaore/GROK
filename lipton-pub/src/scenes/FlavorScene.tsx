import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { FruitFlight, Glow, LetterReveal, LightStreaks, Pack, Particles, TeaCup, WordReveal } from "../components/Elements";
import { RevealMask } from "../components/Transitions";
import { EASE, Flavor, FONT, spr, tw } from "../theme";

/**
 * Scène d'une saveur : univers coloré, fruits en vol, emballage héros,
 * tasse de thé ambré, nom de la saveur et accroche.
 * Une seule scène paramétrée, réutilisée pour les 4 variantes.
 */
export const FlavorScene: React.FC<{ flavor: Flavor; mirror?: boolean }> = ({ flavor, mirror = false }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const dur = durationInFrames / 60;
  const t = frame / 60;
  // caméra : poussée lente + léger travelling, une seule direction par scène
  const cam = tw(frame, 0, dur, 1.06, 1.0, EASE.soft);
  const pan = tw(frame, 0, dur, mirror ? -30 : 30, mirror ? 30 : -30, EASE.soft);
  const pack = spr(frame, 0.45, 14, 1, 90);
  const cup = tw(frame, 0.9, 1.6, 0, 1, EASE.out);
  const packX = mirror ? 1380 : 540;
  const textX = mirror ? 130 : 950;
  const cupX = mirror ? 520 : 1460;
  const PH = 760;
  return (
    <RevealMask kind={flavor.transition} dur={0.7} flash={flavor.key === "lemon" ? "rgba(255,255,230,1)" : undefined}>
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at ${mirror ? 70 : 30}% 50%, ${flavor.bg[0]} 0%, ${flavor.bg[1]} 45%, ${flavor.bg[2]} 100%)` }}>
        {/* vague graphique décorative de la couleur de l'univers */}
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity: 0.35 }}>
          <path
            d={`M0 ${820 + Math.sin(t) * 20} C 480 ${700 + Math.sin(t * 1.3) * 40}, 960 ${940 + Math.cos(t) * 30}, 1920 ${780 + Math.sin(t * 0.8) * 30} L1920 1080 L0 1080 Z`}
            fill={flavor.bg[0]}
          />
          <path
            d={`M0 ${900 + Math.cos(t * 1.1) * 25} C 600 ${980 + Math.sin(t) * 30}, 1300 ${820 + Math.sin(t * 1.4) * 30}, 1920 ${930 + Math.cos(t) * 20} L1920 1080 L0 1080 Z`}
            fill={flavor.bg[2]}
            opacity={0.6}
          />
        </svg>
        <AbsoluteFill style={{ transform: `translateX(${pan}px) scale(${cam})` }}>
          <Particles seed={`${flavor.key}-p`} count={34} color={flavor.accent} speed={0.6} />
          <Glow x={packX} y={520} r={560} color={flavor.glow} opacity={pack} />
          {/* fruits à l'arrière-plan */}
          <FruitFlight seed={`${flavor.key}-back`} kinds={flavor.fruits} count={9} at={0.15} area={{ x: 80, y: 60, w: 1760, h: 960 }} depth={[0, 0.5]} sizeBase={110} dir={mirror ? -1 : 1} avoid={{ x: packX - 260, y: 100, w: 520, h: 900 }} />
          {/* tasse de thé ambré */}
          <div style={{ position: "absolute", left: cupX - 190, top: 640 + (1 - cup) * 120, transform: `scale(${0.85 + cup * 0.15})`, clipPath: `inset(${(1 - cup) * 100}% 0 0 0)` }}>
            <TeaCup size={380} steamFrom={1.3} />
          </div>
          {/* emballage héros */}
          <div
            style={{
              position: "absolute",
              left: packX - (PH * 0.41) / 2,
              top: 540 - PH / 2,
              transform: `translateY(${(1 - pack) * 500 + Math.sin(t * 1.4) * 6}px) rotate(${(1 - pack) * (mirror ? 10 : -10) + (mirror ? 2 : -2)}deg) scale(${0.9 + pack * 0.1})`,
            }}
          >
            <Pack src={flavor.pack} height={PH} shineAt={1.7} />
          </div>
          {/* fruits au premier plan (flous, profondeur) */}
          <FruitFlight seed={`${flavor.key}-front`} kinds={flavor.fruits} count={4} at={0.35} area={{ x: 40, y: 640, w: 1840, h: 380 }} depth={[0.82, 1]} sizeBase={150} dir={mirror ? -1 : 1} avoid={{ x: packX - 260, y: 100, w: 520, h: 900 }} />
          <LightStreaks seed={flavor.key} at={[1.1, 3.2]} />
        </AbsoluteFill>
        {/* typographie */}
        <div style={{ position: "absolute", left: textX, top: 190, width: 860 }}>
          <LetterReveal text={flavor.name} at={1.0} style={{ fontFamily: FONT.sans, fontWeight: 800, fontSize: 104, color: "#ffffff", lineHeight: 1.05, textShadow: "0 8px 30px rgba(0,0,0,0.35)" }} />
          <div style={{ height: 4, width: tw(frame, 1.5, 2.1, 0, 180, EASE.out), background: flavor.accent, margin: "26px 0 24px", borderRadius: 2 }} />
          <WordReveal text={flavor.tagline} at={1.75} style={{ fontFamily: FONT.serif, fontStyle: "italic", fontWeight: 600, fontSize: 50, color: "#fff", lineHeight: 1.25, width: 760, textShadow: "0 4px 20px rgba(0,0,0,0.35)" }} />
        </div>
      </AbsoluteFill>
    </RevealMask>
  );
};
