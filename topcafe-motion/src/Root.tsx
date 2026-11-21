import { Composition } from "remotion";
import { TopcafeCremeux } from "./TopcafeCremeux";
import { FPS, TOTAL } from "./theme";

export const Root: React.FC = () => (
  <>
    <Composition id="TopcafeCremeux16x9" component={TopcafeCremeux} durationInFrames={TOTAL} fps={FPS} width={1920} height={1080} />
    <Composition id="TopcafeCremeux9x16" component={TopcafeCremeux} durationInFrames={TOTAL} fps={FPS} width={1080} height={1920} />
  </>
);
