import { Composition } from "remotion";
import { FPS, KoumaFilm, TOTAL } from "./KoumaFilm";

export const Root: React.FC = () => <Composition id="KoumaFilm" component={KoumaFilm} durationInFrames={TOTAL} fps={FPS} width={1920} height={1080} />;
