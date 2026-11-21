# Warda Couscous — motion design (Remotion)

Vidéo de 25 s, en 16:9 (1920 × 1080) et en 9:16 (1080 × 1920), à 60 i/s, avec un son AAC à -14 LUFS.
Rendus : `renders/warda-couscous-16x9.mp4` et `renders/warda-couscous-9x16.mp4` (copies dans `../videos/`).

## Déroulé
| Temps | Scène | Animation |
|---|---|---|
| 0–4,6 s | Ouverture | Fond rouge profond. Un motif d'étoiles à 8 branches (zellige) se trace en or. Un filet de semoule coule au ralenti, puis le médaillon Warda apparaît avec un reflet. |
| 4,6–9 s | Le sachet | Le sachet monte et se pose sur un plateau brillant, devant un tas de semoule. « Couscous · Moyen · 1 kg · 100 % blé dur ». |
| 9–16 s | Les qualités | Le sachet glisse sur le côté. Les 4 avantages du visuel arrivent un par un, avec leurs icônes tracées : blé, grains, toque et famille. |
| 16–21 s | Le plat | Un rideau doré en diagonale découvre le plat de couscous fumant. « Le vrai goût du couscous à la maison ». |
| 21–25 s | Signature | Le sachet et le plat, le médaillon Warda, « Warda, la qualité dans votre assiette ! » et le badge 1 kg. |

## Respect du produit
- Le sachet, le médaillon Warda et le plat sont **découpés du visuel fourni** (`scripts/detourer.py`),
  sans retouche ni déformation. Le visuel d'origine est gardé dans `public/media/original-warda.png`.
- Sur la photo, le bol de semoule cache le coin bas-gauche du sachet. Ce coin n'est pas inventé :
  la mise en scène place un tas de semoule au premier plan à cet endroit.
- Tous les textes viennent du visuel : titre, quatre avantages, slogan et poids.

## Son
`scripts/make_audio.py` (synthèse, libre de droits) : luth pincé en mode hijaz, darbouka (doum, tek, ka),
nappe et basse, semoule qui coule, whooshes, impacts et scintillements. Tout est calé sur les instants de `src/Warda.tsx`.

## Commandes
```bash
npm install
npm run audio
npm run render:16x9
npm run render:9x16
```
