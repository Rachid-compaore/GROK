import { Composition } from "remotion";
import { OlaraAstuces } from "./OlaraAstuces";
import { FPS, H, TOTAL, W } from "./theme";

export const Root: React.FC = () => (
  <Composition id="OlaraAstuces" component={OlaraAstuces} durationInFrames={TOTAL} fps={FPS} width={W} height={H} />
);
