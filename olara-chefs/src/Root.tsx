import { Composition } from "remotion";
import { FPS, OlaraChefs, TOTAL } from "./OlaraChefs";

export const Root: React.FC = () => <Composition id="OlaraChefs" component={OlaraChefs} durationInFrames={TOTAL} fps={FPS} width={1920} height={1080} />;
