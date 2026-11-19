import React from "react";
import { Img, random, staticFile, useCurrentFrame } from "remotion";
import { C, EASE, F, T, tween } from "../theme";

/** Bas de l'écran : bande verte, pied de page « MOUTARDE OLARA » et filet vert, comme sur les visuels. */
export const BottomFrame: React.FC = () => {
  const frame = useCurrentFrame();
  const g = tween(frame, 0.1, 0.8, 0, 1, EASE.out);
  const f = tween(frame, 0.5, 1.1, 0, 1, EASE.out);
  return (
    <>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <polygon points={`0,1226 870,1226 1000,1760 0,1760`} fill={C.green} transform={`translate(${(1 - g) * -1100} 0)`} />
        <polygon points={`0,1876 990,1876 1030,1920 0,1920`} fill={C.green} transform={`translate(${(1 - f) * -1100} 0)`} />
      </svg>
      <div
        style={{
          position: "absolute",
          left: 0,
          width: 1080,
          top: 1772,
          height: 96,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          fontFamily: F.body,
          fontWeight: 700,
          fontSize: 38,
          color: "#222",
          letterSpacing: 0.5,
          overflow: "hidden",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, transform: `translateY(${(1 - f) * 110}%)` }}>
          <svg width="52" height="52" viewBox="0 0 52 52">
            <circle cx="26" cy="26" r="26" fill="#1877f2" />
            <path d="M29 42V28h4.6l.7-5.4H29v-3.4c0-1.6.4-2.6 2.7-2.6h2.8v-4.8c-.5-.1-2.2-.2-4.1-.2-4 0-6.8 2.5-6.8 7v3.9h-4.6V28h4.6v14z" fill="#fff" />
          </svg>
          MOUTARDE OLARA
        </div>
      </div>
    </>
  );
};

/** Petites particules très discrètes (jaune et vert) qui flottent. */
export const Particles: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      {Array.from({ length: 14 }, (_, i) => {
        const r = (k: string) => random(`p${i}${k}`);
        const x = r("x") * 1080 + Math.sin(frame / 90 + r("p") * 6) * 20;
        const y = ((r("y") * 1920 - frame * (0.2 + r("v") * 0.4)) % 1920 + 1920) % 1920;
        const sz = 6 + r("s") * 10;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: sz,
              height: sz,
              borderRadius: "50%",
              background: i % 3 ? C.yellow : "#7cc48f",
              opacity: 0.35,
            }}
          />
        );
      })}
    </>
  );
};

/** Ampoule (image originale) : révélée de bas en haut, léger balancement, halo jaune. */
export const Bulb: React.FC<{ at: number; width: number }> = ({ at, width }) => {
  const frame = useCurrentFrame();
  const reveal = tween(frame, at, at + 0.55, 0, 1, EASE.out);
  const sway = Math.sin(frame / 38) * 3;
  const glow = 0.55 + Math.sin(frame / 20) * 0.2;
  const h = (width * 210) / 198;
  return (
    <div style={{ position: "relative", width, height: h, transform: `rotate(${sway}deg)`, transformOrigin: "30% 85%" }}>
      <div
        style={{
          position: "absolute",
          left: width * 0.32,
          top: h * 0.22,
          width: width * 0.5,
          height: width * 0.5,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(255,212,3,${glow * reveal}) 0%, rgba(255,212,3,0) 70%)`,
          transform: "scale(1.7)",
        }}
      />
      <Img
        src={staticFile("img/ampoule.png")}
        style={{ position: "absolute", inset: 0, width, height: h, clipPath: `inset(${(1 - reveal) * 100}% 0 0 0)` }}
      />
    </div>
  );
};

/** Logo OLARA (image originale, proportions conservées) avec reflet lumineux. */
export const Logo: React.FC<{ width: number; shineAt?: number[] }> = ({ width, shineAt = [] }) => {
  const frame = useCurrentFrame();
  const src = staticFile("img/logo-olara.png");
  const h = (width * 170) / 316;
  const shines = shineAt.map((a) => tween(frame, a, a + 0.6, -0.3, 1.3, EASE.inOut));
  return (
    <div style={{ position: "relative", width, height: h }}>
      <Img src={src} style={{ width, height: h, display: "block", filter: "drop-shadow(0 10px 18px rgba(0,60,25,0.25))" }} />
      <div style={{ position: "absolute", inset: 0, WebkitMaskImage: `url(${src})`, WebkitMaskSize: "100% 100%", overflow: "hidden" }}>
        {shines.map((x, i) =>
          x > -0.3 && x < 1.3 ? (
            <div
              key={i}
              style={{
                position: "absolute",
                top: "-40%",
                height: "180%",
                left: `${x * 100}%`,
                width: width * 0.18,
                transform: "translateX(-50%) rotate(22deg)",
                background: "linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.7), rgba(255,255,255,0))",
              }}
            />
          ) : null,
        )}
      </div>
    </div>
  );
};

/** Titre « Astuces CUISINE » : lettres d'« Astuces » qui montent, « CUISINE » révélé par un masque. */
export const AstucesTitle: React.FC<{ at: number; hideAt?: number }> = ({ at, hideAt }) => {
  const frame = useCurrentFrame();
  const hide = hideAt === undefined ? 0 : tween(frame, hideAt, hideAt + 0.35, 0, 1, EASE.in);
  const wipe = tween(frame, at + 0.3, at + 0.75, 0, 1, EASE.out) * (1 - hide);
  const bar = tween(frame, at + 0.25, at + 0.55, 0, 1, EASE.out) * (1 - tween(frame, at + 0.55, at + 0.85, 0, 1, EASE.in));
  return (
    <div style={{ position: "relative" }}>
      <div style={{ fontFamily: F.hand, fontWeight: 700, fontSize: 90, color: C.white, lineHeight: "104px", marginLeft: 8, whiteSpace: "nowrap" }}>
        {Array.from("Astuces").map((ch, i) => {
          const p = tween(frame, at + i * 0.045, at + i * 0.045 + 0.4, 0, 1, EASE.out) * (1 - hide);
          return (
            <span key={i} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "top" }}>
              <span style={{ display: "inline-block", transform: `translateY(${(1 - p) * 110}%) rotate(${(1 - p) * 12}deg)` }}>{ch}</span>
            </span>
          );
        })}
      </div>
      <div style={{ position: "relative", fontFamily: F.heavy, fontWeight: 900, fontSize: 118, lineHeight: "120px", letterSpacing: -3, whiteSpace: "nowrap" }}>
        <div style={{ clipPath: `inset(0 ${(1 - wipe) * 100}% 0 0)` }}>
          <span style={{ color: C.yellow }}>CUISI</span>
          <span style={{ color: C.greenDark }}>NE</span>
        </div>
        {/* barre jaune qui précède le masque */}
        <div
          style={{
            position: "absolute",
            top: 6,
            bottom: 6,
            left: `${wipe * 100}%`,
            width: 22,
            background: C.yellow,
            transform: `scaleY(${bar})`,
            borderRadius: 4,
          }}
        />
      </div>
    </div>
  );
};

/** Forme jaune arrondie du haut des visuels. */
export const YellowSwoosh: React.FC<{ at: number }> = ({ at }) => {
  const frame = useCurrentFrame();
  const p = tween(frame, at, at + 0.6, 0, 1, EASE.out);
  return (
    <div
      style={{
        position: "absolute",
        left: 360,
        top: -170 - (1 - p) * 260,
        width: 760,
        height: 330,
        borderRadius: "0 0 200px 240px",
        background: C.yellow,
        transform: "rotate(-4deg)",
      }}
    />
  );
};

export { T };
