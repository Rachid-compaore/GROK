# Kouma — Thé Vert de Chine : publicité motion design (Remotion)

Vidéo de 25 s en 1920 × 1080 à 60 i/s, MP4 H.264, avec un son AAC normalisé à -14 LUFS.
Rendu final : `out/kouma-the-vert-25s.mp4` (copie dans `../videos/`).

## Scénario
| Temps | Scène | Animation |
|---|---|---|
| 0–4 s | Intro plantations | Ouverture au noir sur un lever de soleil au-dessus des plantations : mouvement aérien avec parallaxe sur 4 plans de collines striées, brume, rayons, feuilles et particules. « L'essence d'un thé authentique… » apparaît lettre par lettre. |
| 4–8 s | Immersion | Transition par une vague de feuilles. Feuilles qui flottent en profondeur de champ, bokeh, poussée de caméra. « Un goût. Une tradition. Une qualité. » apparaît phrase par phrase, avec un reflet lumineux. |
| 8–14 s | Reveal | Seconde vague de feuilles, puis ouverture en iris avec un éclat. Les deux boîtes montent, la caméra tourne autour (simulé par la parallaxe), reflets et lumière de studio. Logo Kouma, puis « THÉ VERT DE CHINE ». |
| 14–19 s | Expérience | Balayage diagonal. Les deux verres de thé, avec vapeur et reflets, sur la plantation floutée et une lumière chaude. « Une expérience unique à chaque tasse. » |
| 19–25 s | Final | Les boîtes au premier plan, les verres à côté, des rayons qui tournent derrière le produit et un travelling avant. Puis le logo Kouma, « THÉ VERT DE CHINE », « QUALITÉ SUPÉRIEUR » et « DISPONIBLE » (frappe en ressort et onde de choc). Le logo du distributeur apparaît en haut à droite. |

## Respect du produit
- Les boîtes, les verres, le logo Kouma et le logo du distributeur sont **découpés du visuel fourni**
  (`scripts/extract_assets.py`) puis agrandis ×2, sans rien redessiner, recolorer ni déformer.
  Le visuel d'origine est conservé dans `public/img/original-kouma.jpg`.
- Le paysage, les feuilles fraîches, la vapeur, les rayons et le bandeau doré « QUALITÉ SUPÉRIEUR »
  sont des éléments graphiques créés pour la mise en scène.
- Le slogan suit le brief : « Une expérience unique à chaque tasse. » (avec l'accent sur « expérience »).

## Structure
- `src/KoumaThe.tsx` : composition principale (scènes, transitions par feuilles, son).
- `src/theme.ts` : minutage (`SCENES`), couleurs, polices et courbes d'animation.
- `src/scenes/Scenes.tsx` : `Intro`, `Immersion`, `Reveal`, `Experience`, `Final`.
- `src/components/Landscape.tsx` : plantation au lever du soleil en SVG, avec parallaxe.
- `src/components/Effects.tsx` : feuilles flottantes, vague de feuilles, produit avec reflet, vapeur, particules, traînées de lumière.
- `src/components/Typo.tsx` : textes animés et bandeau doré.
- `scripts/make_audio.py` : musique (cordes pincées pentatoniques, nappes, percussions légères) et bruitages.

## Commandes
```bash
npm install
npm run audio    # public/music_raw.wav, puis loudnorm → public/music.wav
npm run studio   # aperçu interactif
npm run render   # out/kouma-the-vert-25s.mp4
```
