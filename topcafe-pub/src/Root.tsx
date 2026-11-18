import { Composition } from "remotion";
import { TopcafeLatte } from "./TopcafeLatte";
import { FPS, HEIGHT, TOTAL_FRAMES, WIDTH } from "./theme";

export const Root: React.FC = () => (
  <Composition
    id="TopcafeLatte"
    component={TopcafeLatte}
    durationInFrames={TOTAL_FRAMES}
    fps={FPS}
    width={WIDTH}
    height={HEIGHT}
  />
);
