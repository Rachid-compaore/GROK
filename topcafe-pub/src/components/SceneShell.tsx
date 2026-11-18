import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { anim, EASE, TIMING } from "../theme";

type Props = {
  children: React.ReactNode;
  background: string;
  /** zoom caméra : [début, fin] sur la durée de la scène */
  push?: [number, number];
  /** déplacement caméra horizontal en px : [début, fin] */
  pan?: [number, number];
  fadeIn?: boolean;
  fadeOut?: boolean;
};

/**
 * Enveloppe commune des scènes : fondus enchaînés doux (avec léger flou
 * et léger zoom) et mouvement de caméra lent et continu.
 */
export const SceneShell: React.FC<Props> = ({
  children,
  background,
  push = [1, 1.05],
  pan = [0, 0],
  fadeIn = true,
  fadeOut = true,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const o = TIMING.overlap;
  const inP = fadeIn ? anim(frame, [0, o], [0, 1], EASE.inOut) : 1;
  const outP = fadeOut ? anim(frame, [durationInFrames - o, durationInFrames], [0, 1], EASE.inOut) : 0;
  const scale =
    anim(frame, [0, durationInFrames], push, EASE.soft) * (1 + (1 - inP) * 0.04) * (1 + outP * 0.03);
  const x = anim(frame, [0, durationInFrames], pan, EASE.soft);
  return (
    <AbsoluteFill style={{ opacity: inP * (1 - outP), filter: `blur(${(1 - inP) * 8 + outP * 8}px)` }}>
      <AbsoluteFill style={{ background }} />
      <AbsoluteFill style={{ transform: `translateX(${x}px) scale(${scale})` }}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};
