# LIPTON BLACK TEA — publicité motion design (Remotion)

Vidéo de 30 s en 1920 × 1080 à 60 i/s, MP4 H.264, avec un son AAC normalisé à -14 LUFS.
Rendu final : `out/lipton-black-tea-30s.mp4` (copie dans `../videos/`).

## Storyboard
| Temps | Scène | Ce qui se passe |
|---|---|---|
| 0–4 s | Intro | Fond sombre, lumière chaude, feuilles de thé en ralenti et particules. Un éclat doré envahit l'écran, puis le logo LIPTON (extrait de l'emballage) apparaît avec un ressort et un reflet. |
| 4–7 s | Thé noir | Ouverture en iris. Tasse de thé ambré qui se remplit, vapeur, lumière dorée, traînées lumineuses. « L'INTENSITÉ DU THÉ NOIR » est révélé lettre par lettre. |
| 7–12 s | Blackcurrant | Transition par une vague liquide violette. Des cassis volent en profondeur, l'emballage héros monte, la tasse se révèle. Nom de la saveur et accroche. |
| 12–17 s | Strawberry | Transition par une éclaboussure rouge. Des fraises traversent l'écran, mise en page inversée. |
| 17–22 s | Lemon | Transition par un éclat lumineux jaune. Citrons et tranches de citron, ambiance fraîche. |
| 22–26 s | Forest Fruits | Balayage diagonal. Framboises, fraises et mûres. |
| 26–30 s | Final | Les 4 emballages côte à côte, un fruit sous chacun. « 4 SAVEURS » et « À VOUS DE CHOISIR VOTRE MOMENT. » |

## Architecture
- `src/LiptonBlackTea.tsx` : composition principale (séquences qui se chevauchent, son).
- `src/theme.ts` : minutage (`SCENES`), univers de chaque saveur (`FLAVORS` : couleurs, fruits, accroche, type de transition), polices et courbes d'animation.
- `src/scenes/` : `Intro`, `TeaWorld`, `FlavorScene` (une seule scène paramétrée, réutilisée pour les 4 saveurs) et `Finale`.
- `src/components/Fruits.tsx` : cassis, fraise, citron, tranche, framboise, mûre et feuille, en SVG.
- `src/components/Elements.tsx` : emballage (`Pack`), tasse et vapeur, fruits en vol avec profondeur de champ et parallaxe, particules, traînées de lumière, typographie animée.
- `src/components/Transitions.tsx` : masques vague, éclaboussure, éclat, diagonale et iris.
- `scripts/prepare_assets.py` : recadrage des bords, agrandissement des emballages, extraction du logo.
- `scripts/make_audio.py` : musique et bruitages.

## Respect des produits
Les emballages sont les **images fournies**, seulement recadrées de 3 px sur les bords et
agrandies ×2. Aucun texte, aucune couleur ni aucune proportion n'est modifié. Les originaux
sont gardés dans `public/packs/original-*.jpg`. Le logo LIPTON est découpé de l'emballage citron.
Les fruits, la tasse et les feuilles sont des illustrations animées autour des produits.

**Limite :** les photos fournies sont petites (environ 320 × 780 px). Avec des visuels en
haute définition, il suffit de remplacer les fichiers de `public/packs/` pour un rendu plus net.

## Commandes
```bash
npm install
npm run audio    # public/music_raw.wav, puis loudnorm → public/music.wav
npm run studio   # aperçu interactif
npm run render   # out/lipton-black-tea-30s.mp4
```
Pour utiliser une autre musique libre de droits, remplacez `public/music.wav` par un fichier de 30 s.
