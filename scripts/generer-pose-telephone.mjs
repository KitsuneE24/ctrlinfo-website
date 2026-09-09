/**
 * Fabrique la pose « téléphone » du compagnon, à partir de son sprite.
 *
 *   node scripts/generer-pose-telephone.mjs
 *
 * La planche du personnage — `public/cagou.png`, dessinée à la main — porte
 * neuf vignettes de 32 × 48 : la marche vers la gauche (0-3), une pose de face
 * (4), la marche vers la droite (5-8). Il n'y a pas de vignette où il regarde
 * son téléphone, et c'est celle qu'il lui faut pendant une partie : il s'assoit
 * sur le côté et scrolle pendant que le joueur joue.
 *
 * Plutôt que de redessiner le personnage, ce script **reprend sa vignette de
 * face** et lui pose un téléphone dans les mains — les bras y sont déjà, de
 * part et d'autre du torse. Quatre vignettes en sortent, dans
 * `public/cagou-telephone.png` : les lignes de l'écran y remontent d'un rang à
 * chaque image, et le pouce bat. C'est tout ce qu'il faut pour lire « il fait
 * défiler son fil ».
 *
 * **À relancer si `public/cagou.png` change** — la pose en dérive, elle ne se
 * met pas à jour toute seule. Les couleurs du téléphone sont prises dans la
 * palette du sprite (le brun sombre de son contour), pour que la pièce
 * rapportée ne jure pas avec le reste.
 *
 * Aucune dépendance : le décodeur et l'encodeur PNG tiennent dans le bas du
 * fichier, zlib est fourni par Node.
 */
import { deflateSync, inflateSync } from 'node:zlib'
import { readFileSync, writeFileSync } from 'node:fs'

/** La planche source, et la vignette qui sert de base. */
const SOURCE = new URL('../public/cagou.png', import.meta.url)
const CIBLE = new URL('../public/cagou-telephone.png', import.meta.url)
const VIGNETTE = { l: 32, h: 48 }
const DE_FACE = 4
const IMAGES = 4

/* ----------------------------------------------------------------- palette */

const C = {
  contour: [79, 18, 35], // le brun sombre qui cerne déjà son corps
  ecran: [206, 233, 255],
  ligne: [111, 168, 216],
  pouce: [255, 216, 81], // le jaune de ses mains
}

/** Le téléphone, dans les coordonnées de la vignette. */
const BOITIER = { x0: 12, y0: 34, x1: 19, y1: 43 }

/* -------------------------------------------------------------- le dessin */

const pose = (px, l, x, y, couleur) => {
  const i = (y * l + x) * 4
  px[i] = couleur[0]
  px[i + 1] = couleur[1]
  px[i + 2] = couleur[2]
  px[i + 3] = 255
}

const bande = (px, l, y, x0, x1, couleur) => {
  for (let x = x0; x <= x1; x += 1) pose(px, l, x, y, couleur)
}

const bloc = (px, l, x0, y0, x1, y1, couleur) => {
  for (let y = y0; y <= y1; y += 1) bande(px, l, y, x0, x1, couleur)
}

/**
 * Pose le téléphone sur une vignette déjà copiée. `index` est le numéro de
 * l'image : c'est lui qui décale les lignes de l'écran et fait battre le pouce.
 */
function telephoner(px, l, index) {
  const { x0, y0, x1, y1 } = BOITIER
  bloc(px, l, x0, y0, x1, y1, C.contour)
  bloc(px, l, x0 + 1, y0 + 1, x1 - 1, y1 - 1, C.ecran)

  // Trois lignes de texte qui remontent : le défilement se lit à ça.
  const hauteur = y1 - y0 - 1
  for (let n = 0; n < 3; n += 1) {
    const y = y0 + 1 + ((n * 3 + index) % hauteur)
    bande(px, l, y, x0 + 1, x1 - 1 - (n % 2), C.ligne)
  }

  // Le pouce, posé sur la vitre, qui descend d'un rang une image sur deux.
  pose(px, l, x1 - 1, y0 + 6 + (index % 2), C.pouce)
  pose(px, l, x1, y0 + 6 + (index % 2), C.contour)
}

/* ------------------------------------------------------------- assemblage */

function principal() {
  const { largeur, hauteur, px } = decoderPng(readFileSync(SOURCE))
  if (hauteur !== VIGNETTE.h || largeur % VIGNETTE.l !== 0) {
    throw new Error(
      `${SOURCE.pathname} fait ${largeur}×${hauteur} : attendu des vignettes de ` +
        `${VIGNETTE.l}×${VIGNETTE.h}. Ajuster VIGNETTE ici et la table des ` +
        `postures de src/lib/compagnon.js.`
    )
  }

  const large = VIGNETTE.l * IMAGES
  const sortie = new Uint8Array(large * VIGNETTE.h * 4)

  for (let index = 0; index < IMAGES; index += 1) {
    // La vignette de face est recopiée à part, le téléphone posé dessus, et le
    // tout collé dans la planche : le dessin travaille toujours en 32 × 48.
    const vignette = new Uint8Array(VIGNETTE.l * VIGNETTE.h * 4)
    for (let y = 0; y < VIGNETTE.h; y += 1) {
      const depart = (y * largeur + DE_FACE * VIGNETTE.l) * 4
      vignette.set(px.subarray(depart, depart + VIGNETTE.l * 4), y * VIGNETTE.l * 4)
    }

    telephoner(vignette, VIGNETTE.l, index)

    for (let y = 0; y < VIGNETTE.h; y += 1) {
      sortie.set(
        vignette.subarray(y * VIGNETTE.l * 4, (y + 1) * VIGNETTE.l * 4),
        (y * large + index * VIGNETTE.l) * 4
      )
    }
  }

  writeFileSync(CIBLE, encoderPng(large, VIGNETTE.h, sortie))
  console.log(`cagou-telephone.png — ${IMAGES} vignettes de ${VIGNETTE.l}×${VIGNETTE.h}`)
}

/* ------------------------------------------------------------- PNG : lire */

/** Décode un PNG RGBA 8 bits, filtres compris. */
function decoderPng(fichier) {
  let position = 8
  let largeurPng = 0
  let hauteurPng = 0
  const morceaux = []
  while (position < fichier.length) {
    const taille = fichier.readUInt32BE(position)
    const type = fichier.toString('ascii', position + 4, position + 8)
    const donnees = fichier.subarray(position + 8, position + 8 + taille)
    if (type === 'IHDR') {
      largeurPng = donnees.readUInt32BE(0)
      hauteurPng = donnees.readUInt32BE(4)
      if (donnees[8] !== 8 || donnees[9] !== 6) {
        throw new Error('le sprite doit être un PNG RGBA 8 bits par canal')
      }
    }
    if (type === 'IDAT') morceaux.push(donnees)
    position += 12 + taille
  }

  const brut = inflateSync(Buffer.concat(morceaux))
  const ligne = largeurPng * 4
  const px = new Uint8Array(largeurPng * hauteurPng * 4)
  for (let y = 0; y < hauteurPng; y += 1) {
    const filtre = brut[y * (ligne + 1)]
    const source = brut.subarray(y * (ligne + 1) + 1, (y + 1) * (ligne + 1))
    for (let i = 0; i < ligne; i += 1) {
      const gauche = i >= 4 ? px[y * ligne + i - 4] : 0
      const haut = y > 0 ? px[(y - 1) * ligne + i] : 0
      const coin = y > 0 && i >= 4 ? px[(y - 1) * ligne + i - 4] : 0
      let valeur = source[i]
      if (filtre === 1) valeur += gauche
      else if (filtre === 2) valeur += haut
      else if (filtre === 3) valeur += (gauche + haut) >> 1
      else if (filtre === 4) {
        const p = gauche + haut - coin
        const pa = Math.abs(p - gauche)
        const pb = Math.abs(p - haut)
        const pc = Math.abs(p - coin)
        valeur += pa <= pb && pa <= pc ? gauche : pb <= pc ? haut : coin
      }
      px[y * ligne + i] = valeur & 255
    }
  }
  return { largeur: largeurPng, hauteur: hauteurPng, px }
}

/* ------------------------------------------------------------ PNG : écrire */

const TABLE_CRC = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})

function crc32(octets) {
  let c = 0xffffffff
  for (const octet of octets) c = TABLE_CRC[(c ^ octet) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function morceau(type, donnees) {
  const entete = Buffer.alloc(4)
  entete.writeUInt32BE(donnees.length)
  const corps = Buffer.concat([Buffer.from(type, 'ascii'), donnees])
  const somme = Buffer.alloc(4)
  somme.writeUInt32BE(crc32(corps))
  return Buffer.concat([entete, corps, somme])
}

/** Un PNG RGBA sans filtre : chaque ligne préfixée d'un zéro, puis zlib. */
function encoderPng(l, h, px) {
  const octets = Buffer.from(px.buffer, px.byteOffset, px.byteLength)
  const brut = Buffer.alloc(h * (l * 4 + 1))
  for (let y = 0; y < h; y += 1) {
    const debut = y * (l * 4 + 1)
    brut[debut] = 0
    octets.copy(brut, debut + 1, y * l * 4, (y + 1) * l * 4)
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(l, 0)
  ihdr.writeUInt32BE(h, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    morceau('IHDR', ihdr),
    morceau('IDAT', deflateSync(brut, { level: 9 })),
    morceau('IEND', Buffer.alloc(0)),
  ])
}

// Tout est déclaré : on peut travailler.
principal()
