import { Config } from "@remotion/cli/config";

Config.setVideoImageFormat("jpeg");
Config.setJpegQuality(95);
Config.setConcurrency(4);

// Navigateur local (l'environnement ne peut pas télécharger Chrome Headless Shell).
// Supprimez cette ligne sur votre ordinateur : Remotion téléchargera son propre navigateur.
if (process.env.REMOTION_BROWSER) Config.setBrowserExecutable(process.env.REMOTION_BROWSER);
