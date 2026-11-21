import { Composition } from "remotion";
import { FPS, OlaraChefs, TOTAL } from "./OlaraChefs";
import { OlaraChefsLong, TOTAL_LONG } from "./OlaraChefsLong";

export const Root: React.FC = () => (
  <>
    <Composition id="OlaraChefs" component={OlaraChefs} durationInFrames={TOTAL} fps={FPS} width={1920} height={1080} />
    <Composition id="OlaraChefsLong" component={OlaraChefsLong} durationInFrames={TOTAL_LONG} fps={FPS} width={1920} height={1080} />
  </>
);
