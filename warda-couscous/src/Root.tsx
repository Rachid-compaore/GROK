import { Composition } from "remotion";
import { FPS, TOTAL, Warda } from "./Warda";

export const Root: React.FC = () => (
  <>
    <Composition id="Warda16x9" component={Warda} durationInFrames={TOTAL} fps={FPS} width={1920} height={1080} />
    <Composition id="Warda9x16" component={Warda} durationInFrames={TOTAL} fps={FPS} width={1080} height={1920} />
  </>
);
