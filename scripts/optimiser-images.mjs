// Réduit les images de public/ : 960 px de large au plus, métadonnées retirées.
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import sharp from 'sharp'

const RACINE = new URL('../public/', import.meta.url).pathname.replace(/^\/(\w:)/, '$1')
const LARGEUR_MAX = 960
// Photos : compression avec perte. Dessins et sprites : sans perte visible.
const PHOTOS = /[\\/](images|planke)[\\/]/

function fichiers(dossier) {
  return readdirSync(dossier).flatMap((nom) => {
    const chemin = join(dossier, nom)
    if (statSync(chemin).isDirectory()) return fichiers(chemin)
    return /\.(jpe?g|png)$/i.test(nom) ? [chemin] : []
  })
}

let avant = 0
let apres = 0
for (const chemin of fichiers(RACINE)) {
  const origine = readFileSync(chemin)
  const photo = PHOTOS.test(chemin)
  let image = sharp(origine).rotate()
  if (photo) image = image.resize({ width: LARGEUR_MAX, withoutEnlargement: true })
  const sortie = /\.png$/i.test(chemin)
    ? await image.png(photo ? { palette: true, quality: 80, effort: 10 } : { compressionLevel: 9, adaptiveFiltering: true }).toBuffer()
    : await image.jpeg({ quality: 72, mozjpeg: true }).toBuffer()
  avant += origine.length
  // Gardée seulement si elle gagne au moins 5 %.
  if (sortie.length < origine.length * 0.95) {
    writeFileSync(chemin, sortie)
    apres += sortie.length
    console.log(`${relative(RACINE, chemin)} : ${(origine.length / 1024) | 0} → ${(sortie.length / 1024) | 0} Ko`)
  } else {
    apres += origine.length
  }
}
console.log(`Total : ${(avant / 1048576).toFixed(1)} → ${(apres / 1048576).toFixed(1)} Mo`)
