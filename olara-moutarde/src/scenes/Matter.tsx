import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Bokeh, Crown, Drop, MatterRibbon, MustardSurface, Ripples } from "../components/Matter";
import { C, EASE, T, tw, useLayout } from "../theme";

/**
 * ACTE 1 — LE SILENCE (0–4 s) puis L'IMPACT (4–9 s).
 * Plan macro sur un bassin de moutarde vu en perspective, révélé par une lumière précise.
 * Une goutte suspendue tombe ; l'impact déclenche ondes, couronne, puis une vague
 * qui devient une composition de rubans en profondeur. La caméra traverse la vague
 * (transition 1) ; la matière s'affine ensuite en un filet qui découvre la scène
 * suivante (transition 2 : déplacement de matière).
 */
export const MatterAct: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 60;
  const { W, H, pick } = useLayout();

  // --- caméra macro : lente approche, très léger pano ; secousse à l'impact
  const push = tw(frame, 0, T.dropHit, 1.0, 1.14, EASE.soft);
  const shake = t > T.dropHit && t < T.dropHit + 0.5 ? Math.sin((t - T.dropHit) * 70) * 7 * (1 - (t - T.dropHit) / 0.5) : 0;
  const light = tw(frame, 0.3, 2.6, 0, 1, EASE.soft); // la lumière précise s'ouvre
  const poolY = pick(0.6, 0.62) * H;
  const hit = { x: W * 0.5, y: poolY + H * 0.06 };

  // --- goutte
  const dropIn = tw(frame, 1.6, 3.2, 0, 1, EASE.out); // descend lentement dans le champ
  const fall = tw(frame, T.dropFall, T.dropHit, 0, 1, EASE.gravity);
  const dropSize = pick(380, 400);
  const rest = -H * 0.45 + dropIn * H * 0.55; // la goutte descend lentement dans le champ et reste suspendue
  const dropY = rest + Math.sin(t * 1.3) * 6 * (1 - fall) + fall * (hit.y - dropSize * 1.05 - rest);

  // --- vague : rubans qui s'élèvent du bassin et s'enroulent en profondeur
  const wave = tw(frame, 5.0, 6.9, 0, 1, EASE.inOut);
  const through = tw(frame, T.through, 7.8, 0, 1, EASE.in); // la caméra traverse
  const thin = tw(frame, 8.3, 9.3, 0, 1, EASE.inOut); // la matière s'affine en filet
  const flash = tw(frame, T.dropHit, T.dropHit + 0.08, 0, 1) * (1 - tw(frame, T.dropHit + 0.08, T.dropHit + 0.7, 0, 1));

  const ribbons = [
    { pts: [[-0.2, 0.75], [0.2, 0.52], [0.5, 0.62], [0.8, 0.38], [1.2, 0.5]], w: 120, at: 5.0, z: 0.4 },
    { pts: [[-0.2, 0.45], [0.25, 0.68], [0.55, 0.4], [0.9, 0.62], [1.2, 0.3]], w: 170, at: 5.25, z: 0.7 },
    { pts: [[-0.2, 0.92], [0.3, 0.7], [0.6, 0.86], [1.0, 0.6], [1.2, 0.72]], w: 260, at: 5.5, z: 1.0 },
  ];

  const sceneAlpha = 1 - thin; // le fond de l'acte disparaît, il ne reste que le filet
  return (
    <AbsoluteFill style={{ isolation: "isolate" }}>
      <AbsoluteFill style={{ background: C.black, opacity: sceneAlpha }} />
      {/* bassin de moutarde en perspective, révélé par la lumière */}
      <AbsoluteFill style={{ opacity: sceneAlpha * (1 - through), transform: `scale(${push}) translate(${shake}px, ${shake * 0.4}px)` }}>
        {/* bassin en perspective simulée : la texture est écrasée verticalement vers l'horizon */}
        <div style={{ position: "absolute", left: 0, top: poolY - H * 0.12, width: W, height: H - poolY + H * 0.12, overflow: "hidden", WebkitMaskImage: "linear-gradient(180deg, transparent 0%, #000 30%)", maskImage: "linear-gradient(180deg, transparent 0%, #000 30%)" }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: W, height: H, transform: "scaleY(0.62)", transformOrigin: "50% 0%" }}>
            <MustardSurfaceFill W={W} H={H} light={light} />
          </div>
        </div>
        {/* la lumière précise : l'obscurité recule depuis le point d'impact */}
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse ${20 + light * 55}% ${12 + light * 38}% at 50% ${(hit.y / H) * 100}%, rgba(8,6,5,0) 0%, rgba(8,6,5,0.35) 55%, rgba(8,6,5,0.97) 100%)` }} />
        {/* horizon flou (profondeur de champ) */}
        <div style={{ position: "absolute", left: 0, right: 0, top: poolY - H * 0.16, height: H * 0.18, background: `linear-gradient(180deg, rgba(8,6,5,1) 0%, rgba(8,6,5,0) 100%)` }} />
        <Bokeh seed="matter" color={`rgba(255,200,90,${0.35 * light})`} count={7} drift={0.6} />
        <Ripples at={T.dropHit} cx={hit.x} cy={hit.y} persp={0.22} />
        <Crown at={T.dropHit} cx={hit.x} cy={hit.y} w={pick(420, 380)} />
        {t < T.dropHit + 0.02 && (
          <div style={{ position: "absolute", left: W / 2 - dropSize / 2, top: dropY, transform: `scaleY(${1 + fall * 0.25})`, filter: `drop-shadow(0 0 ${30 * light}px rgba(255,200,80,${0.5 * light}))` }}>
            <Drop size={dropSize} stretch={fall} id="main" />
          </div>
        )}
      </AbsoluteFill>
      {/* la vague devient une composition de rubans en profondeur */}
      {wave > 0 && through < 1 && (
        <AbsoluteFill style={{ opacity: sceneAlpha, transform: `scale(${1 + through * 2.6})`, transformOrigin: "50% 62%" }}>
          {ribbons.map((r, i) => (
            <div key={i} style={{ position: "absolute", inset: 0, filter: `blur(${Math.abs(r.z - 0.7) * 6}px)`, transform: `translateY(${(1 - wave) * H * 0.5 * r.z}px) translateX(${(wave - 0.5) * -120 * r.z}px)` }}>
              <MatterRibbon pts={r.pts.map(([x, y]) => [x * W, y * H] as [number, number])} width={r.w * pick(1, 1.1)} draw={tw(frame, r.at, r.at + 1.3, 0, 1, EASE.out)} sway={30} phase={i} />
            </div>
          ))}
        </AbsoluteFill>
      )}
      {/* passage à travers la matière : l'écran devient moutarde */}
      {through > 0 && thin < 1 && (
        <AbsoluteFill style={{ opacity: Math.min(1, through * 1.6), clipPath: thin > 0 ? `path('${filletPath(W, H, thin)}')` : undefined }}>
          <MustardSurface id="through" light={1} drift={3} scale={1 + through * 0.4} lightX={0.5} lightY={0.4} freq={0.006} />
        </AbsoluteFill>
      )}
      {/* le filet de sauce qui reste quand la matière s'affine */}
      {thin > 0.55 && (
        <MatterRibbon pts={[[-100, H * 0.62], [W * 0.3, H * 0.48], [W * 0.62, H * 0.58], [W + 120, H * 0.44]]} width={pick(46, 40)} draw={1} sway={6} />
      )}
      <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 60%, rgba(255,240,190,1) 0%, rgba(255,200,90,0.6) 40%, rgba(0,0,0,0) 70%)", opacity: flash * 0.8, mixBlendMode: "screen" }} />
      <AbsoluteFill style={{ background: "#000", opacity: 1 - tw(frame, 0, 0.6, 0, 1) }} />
    </AbsoluteFill>
  );
};

/** Surface de moutarde remplissant un plan (wrapper à dimensions fixes). */
const MustardSurfaceFill: React.FC<{ W: number; H: number; light: number }> = ({ light }) => <MustardSurface id="pool" light={light} drift={0.6} freq={0.004} />;

/** Forme de la matière qui s'affine en un filet : une bande ondulée dont l'épaisseur diminue. */
function filletPath(W: number, H: number, k: number) {
  const half = (1 - k) * H * 0.9 + 24;
  const top: string[] = [], bot: string[] = [];
  for (let i = 0; i <= 24; i++) {
    const x = -100 + (i / 24) * (W + 200);
    const c = H * 0.55 + Math.sin((i / 24) * Math.PI * 2.2) * H * 0.06 * k;
    top.push(`${x} ${c - half}`); bot.unshift(`${x} ${c + half}`);
  }
  return `M${top.join(" L")} L${bot.join(" L")} Z`;
}
