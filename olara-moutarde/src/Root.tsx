import { Composition } from "remotion";
import { OlaraMoutarde } from "./OlaraMoutarde";
import { FPS, TOTAL } from "./theme";

export const Root: React.FC = () => (
  <>
    <Composition id="OlaraMoutarde16x9" component={OlaraMoutarde} durationInFrames={TOTAL} fps={FPS} width={1920} height={1080} />
    <Composition id="OlaraMoutarde9x16" component={OlaraMoutarde} durationInFrames={TOTAL} fps={FPS} width={1080} height={1920} />
  </>
);
