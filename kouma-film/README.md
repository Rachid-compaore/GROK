# Kouma — Thé Vert de Chine · « Le goût qui rassemble » (40 s)

Rendu : `renders/kouma-le-gout-qui-rassemble.mp4` (copie dans `../videos/`), 1920 × 1080, 24 i/s (cadence cinéma),
H.264, son AAC à -14 LUFS.

## Montage (images réelles uniquement)
| Temps | Plan |
|---|---|
| 0–3,7 s | L'aube sur le paysage, en fondu vers la cour (ralenti ×4 par interpolation de mouvement) |
| 3,7–6,6 s | Le visage de l'homme, serein (recadré) |
| 6,6–10,3 s | Le thé est versé dans les verres (ralenti ×2) |
| 10,3–14 s | Macro sur la mousse qui se forme |
| 14–17,9 s | Les amis réunis autour du thé |
| 17,9–25 s | Un sourire, le verre qui passe de main en main, l'hôte qui sourit |
| 25–40 s | Packshot : les **vraies boîtes et les vrais verres** découpés de l'affiche, sur une plantation floue au soleil, puis le logo Kouma, « THÉ VERT DE CHINE », « QUALITÉ SUPÉRIEURE » et « Le goût qui rassemble. » |

S'y ajoutent un étalonnage chaud, des bandes cinéma, du grain, des mouvements de caméra lents et le texte
de la voix off en sous-titres.

## Choix de fidélité au produit
- **Gros plan sur la boîte tenue par l'homme exclu** : dans la vidéo Gemini, cette boîte est surdimensionnée
  (presque la taille de la théière, alors qu'une boîte de 25 g tient dans la paume), et ses textes sont inversés ou faux.
- **Packshot de Gemini exclu** : ses boîtes sont des imitations (textes déformés, par exemple « FOUE FAITIMEE »).
- Le packshot utilise les boîtes et les verres de l'affiche fournie, avec **le même facteur d'échelle** :
  leurs proportions relatives sont celles de l'affiche.

## Son
`scripts/make_audio.py` (synthèse, libre de droits) : kora, balafon, nappe, djembé et shaker légers, basse.
Ambiance : oiseaux du matin, murmure de la cour, thé versé, mousse, verres qui se touchent.
Pas de voix humaine : `scripts/voix-off.md` contient le texte et le minutage. Un enregistrement déposé dans
`public/media/voix-off.wav` est mixé automatiquement, et la musique baisse sous la voix.
