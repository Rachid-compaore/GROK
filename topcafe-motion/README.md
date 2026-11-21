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

## Storyboard
| Temps | Plan | Ce qui se passe |
|---|---|---|
| 0–4 s | Ouverture | Univers sombre, lumière volumétrique, grains de café en suspension (dolly avant), vapeur, particules dorées. Un grain traverse l'objectif et la caméra le suit. Éclat doré, puis **TOPCAFÉ** en capitales dorées. |
| 4–10 s | 3 IN 1 | Une vague de lait traverse l'écran, la caméra plonge dedans. Le sachet bleu monte au centre (dolly), avec une couronne de lait, de la vapeur et des grains en parallaxe. Le sachet glisse à gauche, puis « TOPCAFÉ 3 IN 1 » et **CRÉMEUX ET DÉLICIEUX**. |
| 10–17 s | Cappuccino | La vague devient un nuage de mousse, puis une explosion de poudre de cacao. Le sachet orange arrive avec un mouvement puissant (sortie de flou), en travelling. « TOPCAFÉ CAPPUCCINO » puis **CRÉMEUX ET DÉLICIEUX**. |
| 17–24 s | Café Latte | Ouverture circulaire bordée d'un ruban caramel et lait. Le sachet arrive sur une trajectoire circulaire, avec un tourbillon caramel derrière lui et une mise au point qui glisse du fond vers le produit. « TOPCAFÉ CAFÉ LATTE » puis **CRÉMEUX ET DÉLICIEUX**. |
| 24–30 s | Packshot | Iris doré. Les trois sachets sur un sol réfléchissant, avec lumière volumétrique, vagues de lait, grains et vapeur. La caméra tourne autour (parallaxe) puis se stabilise. **TOPCAFÉ** puis le slogan final, avec un impact sonore. |

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
├── src/components/         Effects (lumière, grains, vapeur, sachet), Liquids (vague, couronne,
│                           mousse, cacao, caramel, ouverture circulaire), Typo (TOPCAFÉ, slogan)
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
