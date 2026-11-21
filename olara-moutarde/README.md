# OLARA — Moutarde de Dijon · « LE GOÛT QUI RÉVEILLE »

Publicité motion design de 30 s, en deux formats :
- `renders/olara-moutarde-16x9.mp4` : 1920 × 1080, 60 i/s, H.264 + AAC (-14 LUFS) ;
- `renders/olara-moutarde-9x16.mp4` : 1080 × 1920, 60 i/s. Chaque scène recalcule sa mise en page, ce n'est pas un recadrage.

Prévisualisation : `preview/index.html`, avec lecture, rejouer, plein écran, bascule 16:9 / 9:16
et téléchargement. Aperçu interactif image par image : `npm run studio` (Remotion Studio).

## Parti pris
Trois actes en un seul mouvement de matière : **la moutarde est le fil conducteur**.

| Temps | Acte | Mise en scène |
|---|---|---|
| 0–4 s | Le silence | Noir. Une lumière précise s'ouvre sur un bassin de moutarde en plan macro : relief crémeux éclairé en spéculaire, horizon flou (profondeur de champ), bokeh doré. Une goutte descend lentement dans le champ et reste suspendue. Aucun texte. |
| 4–9 s | L'impact | La goutte tombe. Impact : éclat de lumière, secousse, ondes en perspective, dôme et jet de matière. La vague se lève en rubans de moutarde superposés en profondeur. **Transition 1 : la caméra traverse la matière** et l'écran devient moutarde. **Transition 2 : déplacement de matière**, la masse s'affine en un filet qui découvre la table. |
| 9–16 s | La gastronomie | Un plan-séquence au-dessus d'une ardoise. La caméra suit la pointe du filet jusqu'à l'assiette, la sauce se pose en zigzag sur le poulet grillé (vapeur), puis un travelling mène aux ingrédients frais (concombre, tomates, roquette, graines) et à la cuillère. **Transition 3 : la caméra plonge dans la noisette de moutarde**, puis la lumière s'éteint. |
| 16–24 s | Le reveal | Noir. Trois projecteurs s'allument l'un après l'autre sur le 1 kg, le 850 g et le 370 g. La caméra décrit un arc : la parallaxe diffère selon la profondeur de chaque pot. Reflets sur le verre, ombres de contact, reflet au sol, bokeh. La caméra ralentit et se pose. |
| 24–30 s | La signature | L'environnement s'épure et la lumière s'intensifie. **CRÉMEUX ET DÉLICIEUX** en capitales Didone (Bodoni) : chaque lettre se dessine au trait puis se remplit de crème dorée, avec un « ET » en italique entre deux filets. Un trait de moutarde peint souligne la phrase, puis « OLARA · MOUTARDE DE DIJON » apparaît. |

## Respect des produits
- Les trois pots sont **découpés de la photo fournie** (`scripts/detourer_pots.py`) avec le même
  facteur d'échelle : leurs tailles relatives (1 kg, 850 g, 370 g) sont celles de la photo.
  Logo, étiquettes, couvercles et formes ne sont pas modifiés. L'original est conservé dans
  `public/products/original-olara.jpg`.
- En plus des pots, la vidéo ne montre que des éléments créés pour la mise en scène : la matière, les aliments en illustration et la lumière.

## Technique et choix
Les rendus sont faits dans un conteneur cloud sans GPU ni Blender. Three.js et WebGL n'y
apporteraient rien de rendu de façon fiable. Le choix s'est donc porté sur **Remotion**
(React, rendu image par image dans Chromium), avec :
- **filtres SVG d'éclairage** (`feTurbulence` + `feSpecularLighting`) pour la texture macro de la moutarde,
  rendue comme un shader de relief ;
- des **rubans de matière** en Catmull-Rom (corps, ombre, reflet) pour la vague, le filet et le soulignement ;
- une **caméra virtuelle** (keyframes position/zoom, interpolation du zoom en espace log) pour le plan-séquence ;
- des ressorts et des courbes d'easing pour chaque mouvement, plus un grain pellicule et un vignettage discrets.

## Son
`scripts/make_audio.py` synthétise toute la bande-son, calée sur `EVENTS` :
- **0 à 4 s** : souffle d'air, nappe grave, matière qui s'étire.
- **Impact et vague** : impact sourd et éclaboussure, liquide, whoosh du passage à travers la matière.
- **Gastronomie** : groove électro organique (112 BPM), filet de sauce, grésillement du grill, couteau, assiette.
- **Reveal** : déclic et bourdonnement de chaque projecteur.
- **Signature** : accord, impact doux et trait de moutarde.

Pour une autre musique, remplacez `public/music.wav` (30 s).

## Structure
```
src/theme.ts              minutage (T), palette, pots, polices, mise en page 16:9 / 9:16
src/OlaraMoutarde.tsx     timeline (acte 1 posé au-dessus de l'acte 2 pour la transition par la matière)
src/scenes/Matter.tsx     acte 1 : silence, goutte, impact, vague, passage, filet
src/scenes/Gastro.tsx     acte 2 : plan-séquence gastronomique, plongée
src/scenes/Reveal.tsx     acte 3 : projecteurs, orbite, signature
src/components/           Matter (texture, goutte, ondes, jet, rubans, bokeh, grain), Food, Studio (pot, projecteur), Signature
scripts/                  détourage des pots, bande-son
preview/index.html        lecteur de prévisualisation
```

## Commandes
```bash
npm install
npm run audio          # public/music_raw.wav, puis loudnorm → public/music.wav
npm run studio         # prévisualisation interactive
npm run render:16x9
npm run render:9x16
```
