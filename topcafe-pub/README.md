# Publicité TOPCAFÉ Café Latte — motion design (Remotion)

Vidéo de 25 s, 1920 × 1080, 30 i/s, MP4 H.264 + son AAC.
Rendu final : `out/topcafe-cafe-latte-25s.mp4` (copie dans `../videos/`).

## Scènes (`src/scenes/`)
| Scène | Temps | Contenu |
|---|---|---|
| 1 · Introduction | 0–4 s | Fond café, grains en apesanteur, faisceau de lumière, tasse — « L'instant douceur commence ici... » |
| 2 · Produit | 4–9 s | Sachet net et dominant, grains en orbite, reflet lumineux |
| 3 · Expérience gourmande | 9–15 s | Filet de lait, mousse et latte art qui apparaissent, vapeur — « Une texture crémeuse... / Un plaisir intensément gourmand. » |
| 4 · Signature | 15–21 s | Sachet au premier plan, tasse sur le côté, grains — « TOPCAFÉ CAFÉ LATTE / Crémeux et délicieux. » |
| 5 · Packshot | 21–25 s | Sachet sur fond bleu de la marque — « TOPCAFÉ CAFÉ LATTE / Savourez l'instant. » |

Le minutage se règle dans `src/theme.ts` (`TIMING`), les couleurs et les polices aussi.

## Respect du produit
`public/sachet.png` est le visuel fourni, seulement détouré (`scripts/detourer_sachet.py`).
Les scènes n'appliquent que des transformations uniformes (échelle, position, très légère rotation) :
aucune déformation, aucune recoloration, aucune inscription ajoutée sur l'emballage.

## Commandes
```bash
npm install
npm run audio    # régénère public/music.wav (python3 + numpy + scipy)
npm run studio   # aperçu interactif dans le navigateur
npm run render   # exporte out/topcafe-cafe-latte-25s.mp4
```
Dans un environnement sans accès à Internet, indiquez un Chrome local :
`REMOTION_BROWSER=/chemin/vers/chrome-headless-shell npm run render`.
