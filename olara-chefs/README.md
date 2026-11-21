# OLARA — « LE SECRET DES CHEFS » (vidéo Gemini retravaillée)

Rendu : `renders/olara-le-secret-des-chefs.mp4` (copie dans `../videos/`).
Durée 16,5 s, 1920 × 1080, 24 i/s (la cadence de la vidéo d'origine, pour éviter toute saccade), son AAC à -14 LUFS.

## Ce qui a été fait
- **Image Gemini** (0–10 s) : agrandie de 1280×720 à 1920×1080 (Lanczos + netteté), puis étalonnée
  (contraste, chaleur, ombres plus profondes). Ajouts : bandes cinéma, vignettage, grain pellicule et un
  sous-titre élégant « Moutarde de Dijon · OLARA » au moment où la moutarde entre en scène.
- **Transition** : poussée de caméra et voile de lumière sur le dernier plan. Le packshot s'ouvre en cercle
  **à l'endroit exact du pot**, ce qui fait un raccord direct entre le pot du film et le pot du studio.
- **Packshot** (10–16,5 s) : le pot de la photo fournie (détouré, proportions intactes), avec une lumière de studio,
  un plateau brillant avec reflet et ombre, un ruban de moutarde, des graines au ralenti, un bokeh et un reflet
  lumineux sur le verre. Puis le logo OLARA, une toque de chef dessinée au trait et le slogan **LE SECRET DES CHEFS**
  (lettres Didone tracées puis remplies d'or), et enfin « Moutarde de Dijon ».
- **Son** : la piste d'origine (voix + musique) est traitée comme en studio (`ffmpeg`) : passe-haut,
  chaleur, voix moins nasillarde, présence, de-esser et compression légère. Sur le packshot s'ajoutent des
  bruitages et une fin musicale synthétisés (`scripts/make_audio.py`).

## Limite : la voix
La voix n'a pas été remplacée. Cet environnement n'a pas accès aux modèles de synthèse vocale
réalistes (sites bloqués), et les voix hors ligne disponibles sont plus robotiques que celle de Gemini.
La voix d'origine a été traitée, pas régénérée. La voix étant mêlée à la musique de Gemini, elle ne peut
pas être isolée proprement sans ces modèles.
Pour une voix vraiment humaine, déposez un enregistrement (voix off d'un comédien, ou voix générée par
un service comme ElevenLabs) en WAV dans `public/media/`, puis relancez `npm run audio` et `npm run render`.

## Fichiers
- `public/media/` : vidéo Gemini d'origine, version 1080p étalonnée, voix traitée, pot et logo détourés.
- `scripts/detourer_pot.py` : détourage du pot (contour mesuré, fond bleu retiré au col).
- `scripts/make_audio.py` : mixage final.
- `src/OlaraChefs.tsx` : composition Remotion (film habillé + packshot).
