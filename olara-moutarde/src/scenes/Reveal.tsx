import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { Bokeh } from "../components/Matter";
import { Signature } from "../components/Signature";
import { Jar, Spotlight } from "../components/Studio";
import { C, EASE, FONT, JARS, T, tw, useLayout } from "../theme";

/**
 * ACTE 3 — LE REVEAL OLARA (16–24 s) et LA SIGNATURE (24–30 s).
 * Noir total ; trois projecteurs s'allument un à un sur les pots (1 kg, 850 g, 370 g).
 * La caméra décrit un arc (parallaxe entre les pots selon leur profondeur), ralentit
 * et se pose. Puis l'environnement s'épure, la lumière s'intensifie et la signature
 * « CRÉMEUX ET DÉLICIEUX » se dessine, soulignée par un trait de moutarde.
 */
export const RevealAct: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / 60 + 16.0; // temps global
  const { W, H, portrait, pick } = useLayout();
  const g = (s: number) => s - 16.0; // global → local

  // --- composition finale (proportions de la photo conservées : même facteur d'échelle pour les 3 pots)
  const unit = pick(600, 640) / JARS[0].h; // échelle commune
  const gap = pick(56, 34);
  const sizes = JARS.map((j) => ({ ...j, dh: j.h * unit, dw: j.w * unit }));
  const total = sizes.reduce((s, j) => s + j.dw, 0) + gap * 2;
  const floorY = pick(975, 1500);
  let x0 = W / 2 - total / 2;
  const base = sizes.map((j) => {
    const x = x0 + j.dw / 2;
    x0 += j.dw + gap;
    return { ...j, x };
  });
  const depth = [0.45, 0.7, 1.0];

  // --- caméra : arc autour des pots, ralentissement, puis légère poussée à la signature
  const orbit = 1 - tw(frame, g(16.6), g(23.6), 0, 1, EASE.out);
  const camScale = tw(frame, g(16.6), g(24.6), 1.16, 1.0, EASE.out) + tw(frame, g(24.6), durationInFrames / 60, 0, 0.035, EASE.soft);
  const lift = tw(frame, g(16.6), g(24.6), pick(-120, -160), 0, EASE.out); // le cadrage remonte pour laisser la place à la signature
  const sig = tw(frame, g(T.signature - 0.4), g(T.signature + 1.0), 0, 1, EASE.inOut); // l'environnement s'épure

  const lightOf = (i: number) => tw(frame, g(T.lights[i]), g(T.lights[i]) + 0.25, 0, 1, EASE.out) + sig * 0.12;
  return (
    <AbsoluteFill style={{ background: C.black, isolation: "isolate" }}>
      {/* fond : dégradé chaud qui s'épure à la signature */}
      <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% ${pick(55, 60)}%, rgba(120,70,10,${0.35 + sig * 0.25}) 0%, rgba(30,16,4,0.6) 45%, rgba(0,0,0,1) 85%)`, opacity: tw(frame, g(16.6), g(18.0), 0, 1) }} />
      <AbsoluteFill style={{ transform: `translateX(${orbit * 160}px)` }}>
        <Bokeh seed="reveal" color="rgba(255,190,80,0.45)" count={pick(11, 12)} drift={0.5} opacity={tw(frame, g(17.2), g(18.4), 0, 1) * (1 - sig * 0.7)} />
      </AbsoluteFill>
      <AbsoluteFill style={{ transform: `scale(${camScale}) translateY(${lift}px)`, transformOrigin: `50% ${(floorY / H) * 100}%` }}>
        {/* sol brillant */}
        <div style={{ position: "absolute", left: -200, right: -200, top: floorY, bottom: -400, background: "linear-gradient(180deg, rgba(60,36,10,0.9) 0%, rgba(0,0,0,1) 70%)", opacity: tw(frame, g(16.6), g(17.6), 0, 1) }} />
        <div style={{ position: "absolute", left: -200, right: -200, top: floorY - 1, height: 2, background: "linear-gradient(90deg, transparent 10%, rgba(255,210,130,0.55) 50%, transparent 90%)", opacity: tw(frame, g(16.6), g(17.8), 0, 1) }} />
        {base.map((j, i) => (
          <Spotlight key={`s${i}`} x={j.x + orbit * (depth[i] - 0.7) * pick(520, 170)} at={g(T.lights[i])} height={pick(1100, 1600)} width={j.dw * 2.1} floorY={floorY} />
        ))}
        {base.map((j, i) => {
          const ox = orbit * (depth[i] - 0.7) * pick(520, 170); // parallaxe : le plan avant bouge plus que l'arrière
          const sc = 1 + orbit * (depth[i] - 0.7) * 0.22;
          return (
            <div key={j.key} style={{ position: "absolute", left: j.x - j.dw / 2 + ox, top: floorY - j.dh, transform: `scale(${sc})`, transformOrigin: "50% 100%", zIndex: Math.round(depth[i] * 10) }}>
              <Jar src={j.src} height={j.dh} ratio={j.w / j.h} light={lightOf(i)} shineAt={[g(T.lights[i]) + 0.5, g(22.2) + i * 0.2, g(T.signature + 1.4) + i * 0.15]} />
            </div>
          );
        })}
      </AbsoluteFill>
      {/* signature */}
      <div style={{ position: "absolute", left: 0, width: W, top: pick(58, 300), display: "flex", justifyContent: "center", zIndex: 30 }}>
        <Signature at={g(T.signature)} underlineAt={g(T.underline)} size={pick(98, 104)} twoLines={portrait} width={W} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          width: W,
          top: pick(1012, 1640),
          textAlign: "center",
          fontFamily: FONT.sans,
          fontWeight: 600,
          fontSize: pick(26, 32),
          letterSpacing: pick(12, 12),
          color: "rgba(251,243,220,0.85)",
          opacity: tw(frame, g(26.3), g(27.1), 0, 1),
          transform: `translateY(${tw(frame, g(26.3), g(27.1), 14, 0, EASE.out)}px)`,
          zIndex: 30,
        }}
      >
        OLARA · MOUTARDE DE DIJON
      </div>
      <AbsoluteFill style={{ background: "#000", opacity: tw(frame, durationInFrames / 60 - 0.5, durationInFrames / 60, 0, 1) * 0 }} />
    </AbsoluteFill>
  );
};
