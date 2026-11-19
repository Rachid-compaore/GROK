import { Composition } from "remotion";
import { LiptonBlackTea } from "./LiptonBlackTea";
import { FPS, H, TOTAL, W } from "./theme";

export const Root: React.FC = () => (
  <Composition id="LiptonBlackTea" component={LiptonBlackTea} durationInFrames={TOTAL} fps={FPS} width={W} height={H} />
);
