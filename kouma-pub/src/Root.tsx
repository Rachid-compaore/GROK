import { Composition } from "remotion";
import { KoumaThe } from "./KoumaThe";
import { FPS, H, TOTAL, W } from "./theme";

export const Root: React.FC = () => (
  <Composition id="KoumaThe" component={KoumaThe} durationInFrames={TOTAL} fps={FPS} width={W} height={H} />
);
