# TOPCAFÉ — « CRÉMEUX ET DÉLICIEUX » (motion design, Remotion)

Publicité de 30 s pour les trois variétés TOPCAFÉ, en deux formats :
- `renders/topcafe-cremeux-16x9.mp4` : 1920 × 1080, 60 i/s, H.264 + AAC ;
- `renders/topcafe-cremeux-9x16.mp4` : 1080 × 1920, 60 i/s, pour TikTok, Reels et le statut WhatsApp.

La version verticale n'est **pas un recadrage** : chaque scène recalcule sa mise en page
selon le format (`useLayout()` dans `src/theme.ts`).

## Environnement de production
Les rendus sont faits dans un conteneur cloud : 4 cœurs, sans GPU ni Blender. D'où le choix de
**Remotion** (React + SVG + CSS, rendu par Chromium), d'effets procéduraux en SVG (liquides,
particules, vapeur, lumière) et de **Python** (numpy/scipy) pour synthétiser la musique et les bruitages.

## Storyboard (version 2)
| Temps | Plan | Ce qui se passe |
|---|---|---|
| 0–4 s | Ouverture | Noir, puis une lumière chaude monte sur un sol sombre et brillant où reposent trois grains. Lumière volumétrique, particules, dolly avant. Un grain traverse l'objectif et la caméra le suit. Éclat doré, puis **TOPCAFÉ** en capitales dorées, tenu 2 secondes. |
| 4–10 s | 3 IN 1 | Une vague de lait lisse traverse l'écran et révèle directement l'univers bleu. Le sachet se pose sur le sol brillant (reflet, ombre de contact), un ruban de lait ondule derrière lui, avec de la vapeur et des grains. La caméra glisse, puis « TOPCAFÉ 3 IN 1 » et **CRÉMEUX ET DÉLICIEUX** apparaissent. |
| 10–16 s | Cappuccino | Un front de mousse monte, puis une bouffée de cacao éclate. Le sachet orange arrive avec force (sortie de flou), pendant que la poudre de cacao tombe dans la lumière. Nom, puis slogan. |
| 16–23 s | Café Latte | Un anneau de caramel s'ouvre depuis le centre. Le sachet arrive en pivotant, avec des rubans de caramel et de lait derrière lui. Nom, puis slogan. |
| 23–30 s | Packshot | Une vague dorée en diagonale. Les trois sachets sur un sol réfléchissant, avec rubans caramel et lait, rayons dorés et grains. La caméra tourne autour puis se stabilise. **TOPCAFÉ** puis le slogan final, tenu près de 5 secondes. |

Les transitions sont des fronts liquides lisses (`LiquidWipe`) qui révèlent directement la scène
suivante : aucun écran vide entre deux scènes.

## Respect des produits
- Les trois sachets sont les **images fournies**, seulement détourées (`scripts/detourer.py`) :
  aucun texte, logo, poids, couleur ni proportion n'est modifié. Les originaux sont gardés dans
  `public/products/original-*.png`.
- Le slogan est défini une seule fois (`SLOGAN` dans `src/theme.ts`) et n'est jamais modifié.
  Il passe sur une ou deux lignes selon la place disponible.

## Structure
```
topcafe-motion/
├── public/products/        sachets détourés + originaux
├── public/fonts/           Montserrat, Cinzel
├── public/music.wav        bande-son (-14 LUFS)
├── scripts/detourer.py     détourage des sachets
├── scripts/make_audio.py   musique et bruitages (synthèse)
├── src/theme.ts            minutage, univers, slogan, mise en page 16:9 / 9:16
├── src/TopcafeCremeux.tsx  timeline principale et transitions
├── src/scenes/Scenes.tsx   Ouverture, scène produit paramétrée (×3), Packshot
├── src/components/         Effects (lumière, grains, vapeur, sachet + reflet), Liquids (transitions
│                           liquides, rubans lait/caramel, poudre de cacao), Typo (TOPCAFÉ, slogan)
├── previews/               images de contrôle
└── renders/                vidéos finales
```

## Commandes
```bash
npm install
npm run audio        # public/music_raw.wav, puis loudnorm → public/music.wav
npm run studio       # aperçu interactif
npm run render:16x9
npm run render:9x16
```
