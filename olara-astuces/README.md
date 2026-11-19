# OLARA — Astuces CUISINE (motion design, Remotion)

Vidéo verticale de 25 s (1080 × 1920, 60 i/s) pour TikTok, Reels et Shorts, en MP4 H.264
avec un son AAC normalisé à -14 LUFS.
Rendu final : `out/olara-astuces-cuisine-25s.mp4` (copie dans `../videos/`).

## Déroulé
| Temps | Scène | Animation |
|---|---|---|
| 0–3 s | Intro | Le panneau vert et la forme jaune entrent. Le logo OLARA apparaît avec un ressort et un reflet. Les lettres d'« Astuces » montent, « CUISINE » est révélé par un masque précédé d'une barre jaune. L'ampoule se dessine de bas en haut et se balance. L'en-tête monte ensuite en haut de l'écran. |
| 3–11 s | Frites | La carte blanche monte. « Tu veux des frites bien croustillantes ? » apparaît mot par mot, « croustillantes » est surligné en jaune. La photo des frites entre en douceur. Des éclats « croustillants » jaillissent sur le rythme, la coche se trace, puis le texte apparaît ligne par ligne. |
| 11–12 s | Transition | Une bande verte bordée de jaune balaie la carte en diagonale et change d'astuce. |
| 12–20 s | Plat trop salé | Le titre apparaît mot par mot, la photo du sel entre, la salière se secoue et quelques grains tombent. La coche se trace et le texte apparaît ligne par ligne. |
| 20–25 s | Signature | La carte sort, l'en-tête revient au centre, « Astuces CUISINE » se révèle de nouveau et le logo brille. |

Le minutage est défini en un seul endroit, `src/theme.ts` (`T`), et calé sur la musique à 120 BPM.

## Respect de l'identité OLARA
- Le logo, l'ampoule, la photo des frites et celle du sel sont **extraits des visuels originaux**
  (`scripts/extract_assets.py`). Seul le fond blanc est retiré : rien n'est redessiné ni déformé.
- Les couleurs sont mesurées sur les visuels : vert `#006b31`, vert titre `#0f522f`, jaune `#ffd403`.
- Les textes des astuces sont repris mot pour mot, avec les mêmes retours à la ligne.
- Les visuels d'origine sont conservés dans `public/img/original-*.jpg`.
- Les polices sont les plus proches disponibles librement : Krona One (titres), Unbounded (CUISINE),
  Grandstander (Astuces) et Roboto Condensed (texte). Si OLARA possède ses polices officielles,
  il suffit de les déposer dans `public/fonts/` et de les déclarer dans `src/theme.ts`.

## Commandes
```bash
npm install
npm run audio     # régénère public/music_raw.wav (puis loudnorm → public/music.wav)
npm run studio    # aperçu interactif
npm run render    # out/olara-astuces-cuisine-25s.mp4
```
