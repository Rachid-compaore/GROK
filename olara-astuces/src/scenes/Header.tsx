import React from "react";
import { useCurrentFrame } from "remotion";
import { AstucesTitle, Bulb, Logo, YellowSwoosh } from "../components/Brand";
import { C, EASE, pop, T, tween } from "../theme";

/**
 * En-tête OLARA « Astuces CUISINE ». Il naît au centre de l'écran (intro),
 * monte en haut pour devenir l'en-tête des astuces, puis redescend au centre
 * pour la signature finale. Le panneau vert diagonal le suit.
 */
export const Header: React.FC = () => {
  const frame = useCurrentFrame();
  const up = tween(frame, T.headerUp, T.headerUp + 0.7, 0, 1, EASE.inOut);
  const down = tween(frame, T.outro + 0.1, T.outro + 0.85, 0, 1, EASE.inOut);
  const k = up * (1 - down);
  const dy = (1 - k) * 600;
  const sc = 1 + down * Math.max(0, frame / 60 - T.outro - 0.85) * 0.01;
  const panel = tween(frame, T.introShapes, T.introShapes + 0.6, 0, 1, EASE.out);
  const logoP = pop(frame, T.logo, 11, 0.7, 140);
  return (
    <div style={{ position: "absolute", inset: 0, transformOrigin: "540px 300px", transform: `translateY(${dy}px) scale(${sc})` }}>
      {/* panneau vert diagonal (prolongé vers le haut pour ne jamais laisser de vide) */}
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: -1200, overflow: "visible" }}>
        <polygon points={`0,0 330,0 330,1200 520,1840 0,1840`} fill={C.green} transform={`translate(${(1 - panel) * -760} 0)`} />
      </svg>
      <YellowSwoosh at={T.introShapes + 0.15} />
      <div style={{ position: "absolute", left: 735, top: 40, transform: `scale(${logoP})`, transformOrigin: "50% 50%" }}>
        <Logo width={300} shineAt={[T.logo + 0.45, T.outro + 1.2, 23.2]} />
      </div>
      <div style={{ position: "absolute", left: 40, top: 190 }}>
        <AstucesTitle at={T.astuces} hideAt={T.outro} />
      </div>
      <div style={{ position: "absolute", left: 40, top: 190 }}>
        {frame / 60 >= T.outroTitle && <AstucesTitle at={T.outroTitle} />}
      </div>
      <div style={{ position: "absolute", left: 770, top: 215 }}>
        <Bulb at={T.bulb} width={170} />
      </div>
    </div>
  );
};
