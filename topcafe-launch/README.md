# TOPCAFÉ — film de lancement « assistant café » (15 s, 1920×1080, 60 i/s)

Un seul plan continu, en 2D : la demande tapée dans l'assistant devient une bulle,
le bouton d'envoi devient un wok, l'aplat citron porte les cartes, la carte gagnante
rejoint la réponse, et le bouton « Commander » devient la page de fin.

Rendu final : `out/topcafe-lancement-15s-60fps.mp4` (copie dans `../videos/`).

## Beat map — 130 BPM, 32 temps (14,8 s)
| Temps | Secondes | Étape | Ce qui se passe |
|---|---|---|---|
| 0–6 | 0,0–2,8 | ASK | Poussée lente dans le champ de saisie à la lueur irisée (×2 → ×3). Saisie sur 3 lignes fixes. |
| 6 | 2,8 | SEND | Appui sur le bouton bleu, onde citron, le message devient une bulle. La caméra recule et révèle le téléphone. |
| 6–12 | 2,8–5,5 | THINK | Le bouton devient un wok orange, qui lance 6 ingrédients sur les temps 8, 9, 10 et 11. « Je cherche le café idéal pour vous… » scintille. |
| 12 | 5,5 | DROP | Un aplat citron jaillit du wok et couvre l'écran en 0,35 s. Les 5 cartes surgissent du centre. |
| 13,4–16 | 6,2–7,4 | DROP | La bande glisse sur 3 cartes et s'arrête sur **TOPCAFÉ Café Latte**, qui se soulève avec « Meilleur choix ». |
| 16–21 | 7,4–9,7 | CHAT | L'aplat se rétracte dans la bulle en emportant ses mots. La carte rejoint la réponse. Puis « Je vous le prépare ? », clic, chargement, « ✓ Commandé ». |
| 21–32 | 9,7–14,8 | OUTRO | Le bouton noir devient la page. « Vous rêviez d'un café crémeux. / Il est déjà en route. » Le livreur suit la route jusqu'à l'épingle, qui devient la marque. Le logo TOPCAFÉ, « Café Latte 3 en 1 » et le sachet apparaissent. |

Tous les instants sont définis une seule fois dans `scripts/build_audio.py`, qui écrit
`timeline.js`. L'image et le son lisent donc exactement les mêmes temps.

## Fichiers
- `film.html` : le film entier. Chaque style est calculé dans `seek(t)`, sans transition CSS, minuterie ni état gardé entre deux images. Une seule caméra (`CAM` : [temps, zoom, x, y], zoom interpolé en log) et des ressorts en forme fermée (`spring`).
- `scripts/build_audio.py` : beat map, frappes de clavier, musique (drop au temps 12) et bruitages, tous synthétisés et libres de droits.
- `scripts/render.js` : rendu Playwright à 60 i/s, 8 sous-images par image mélangées avec `ffmpeg tmix`, puis son normalisé à -14 LUFS (loudnorm en deux passes).
- `scripts/stills.js` : images de contrôle, par exemple `node scripts/stills.js 1.5 6.5 8.8 13`.
- `assets/` : sachet et logo (détourés du visuel fourni, sans retouche), photos des cartes (découpées du storyboard), polices Geist et Playfair Display.

## Refaire le film
```bash
npm install
python3 scripts/build_audio.py      # timeline.js + out/audio_raw.wav
node scripts/render.js 4            # out/topcafe-lancement-15s-60fps.mp4
```
Pour un aperçu en direct, ouvrez `film.html` dans Chrome et tapez `seek(6.5)` dans la console.

## À personnaliser
- Les **prix** des cartes (`CARDS` dans `film.html`) sont des exemples (150 à 900 FCFA). Mettez vos vrais prix.
- Pour utiliser la musique Mixkit « Cat Walk » et des bruitages Mixkit, déposez le MP3 dans `assets/`. Calez son drop sur 5,54 s : la chanson démarre 12 temps avant le drop. Remplacez ensuite `out/audio_raw.wav` avant `render.js`.
