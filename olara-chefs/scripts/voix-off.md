# Voix off — OLARA « Le secret des chefs » (version longue, 23 s)

Ton : voix masculine grave et chaleureuse, posée, souriante. Débit calme. Pas d'effet « pub criée ».
Enregistrer dans une pièce calme, téléphone à 20 cm de la bouche, en WAV ou MP3.

| Temps | Image | Texte à dire |
|---|---|---|
| 2,9 s | La cuisinière dans sa cuisine | « Chaque grand plat commence par un geste. » |
| 5,2 s | La cuillère plonge dans le pot (ralenti) | « Une touche de Moutarde de Dijon OLARA… » |
| 8,7 s | La texture en très gros plan | « Crémeuse. Intense. » |
| 10,5 s | La poêle qui grésille (ralenti) | « Pour saisir, napper, sublimer. » |
| 13,3 s | Le repas en famille | « Et toute la table le ressent. » |
| 18,6 s | Le pot et le slogan | « OLARA. Le secret des chefs. » |

Déposez le fichier sous `public/media/voix-off.wav` (enregistrement complet, qui commence à 2,9 s de la vidéo),
puis : `python3 scripts/make_audio_long.py`, normalisation (voir README) et `npx remotion render OlaraChefsLong ...`.
La musique baisse automatiquement sous la voix.
