// node scripts/generer-sprite-cagou.mjs : planches du compagnon depuis scripts/sprites/
import { deflateSync, inflateSync } from 'node:zlib'
import { readFileSync, writeFileSync } from 'node:fs'

const dossier = (nom) => new URL(`../public/${nom}`, import.meta.url)
const source = (nom) => new URL(`./sprites/${nom}`, import.meta.url)

// Double de LARGEUR × HAUTEUR (lib/compagnon.js).
const VIGNETTE = { l: 160, h: 240 }
const VIGNETTE_CHUTE = { l: 296, h: 136 }
const MARGE = { haut: 3, bas: 2 }
const VOILE = 24

function trouverPoses({ largeur, hauteur, px }) {
  const plein = (x, y) => px[(y * largeur + x) * 4 + 3] > 128
  const colonnes = []
  for (let x = 0; x < largeur; x += 1) {
    let n = 0
    for (let y = 0; y < hauteur; y += 1) if (plein(x, y)) n += 1
    colonnes.push(n > 3)
  }

  const poses = []
  let debut = -1
  for (let x = 0; x <= largeur; x += 1) {
    const occupe = x < largeur && colonnes[x]
    if (occupe && debut < 0) debut = x
    if (!occupe && debut >= 0) {
      if (x - debut > 20) poses.push({ x0: debut, x1: x - 1 })
      debut = -1
    }
  }

  for (const pose of poses) {
    pose.y0 = hauteur
    pose.y1 = 0
    for (let y = 0; y < hauteur; y += 1) {
      for (let x = pose.x0; x <= pose.x1; x += 1) {
        if (!plein(x, y)) continue
        pose.y0 = Math.min(pose.y0, y)
        pose.y1 = Math.max(pose.y1, y)
      }
    }
  }
  return poses
}

function blancDesYeux({ largeur, px }, pose) {
  let n = 0
  for (let y = pose.y0; y <= pose.y1; y += 1) {
    for (let x = pose.x0; x <= pose.x1; x += 1) {
      const i = (y * largeur + x) * 4
      if (px[i + 3] > 200 && px[i] > 230 && px[i + 1] > 230 && px[i + 2] > 230) n += 1
    }
  }
  return n
}

function reduire(image, pose, echelle, sortie, largeurSortie, origine, cellule = VIGNETTE) {
  const { largeur, px } = image
  const l = Math.round((pose.x1 - pose.x0 + 1) * echelle)
  const h = Math.round((pose.y1 - pose.y0 + 1) * echelle)
  if (l > cellule.l || h > cellule.h - MARGE.bas) {
    throw new Error(`pose de ${l} × ${h} trop grande pour ${cellule.l} × ${cellule.h}`)
  }
  const ox = origine.x + Math.round((cellule.l - l) / 2)
  const oy = origine.y + cellule.h - MARGE.bas - h

  for (let y = 0; y < h; y += 1) {
    const sy0 = pose.y0 + Math.floor(y / echelle)
    const sy1 = Math.min(pose.y1 + 1, pose.y0 + Math.floor((y + 1) / echelle))
    for (let x = 0; x < l; x += 1) {
      const sx0 = pose.x0 + Math.floor(x / echelle)
      const sx1 = Math.min(pose.x1 + 1, pose.x0 + Math.floor((x + 1) / echelle))
      let r = 0
      let v = 0
      let b = 0
      let a = 0
      let n = 0
      for (let sy = sy0; sy < sy1; sy += 1) {
        for (let sx = sx0; sx < sx1; sx += 1) {
          const i = (sy * largeur + sx) * 4
          const alpha = px[i + 3] < VOILE ? 0 : px[i + 3]
          r += px[i] * alpha
          v += px[i + 1] * alpha
          b += px[i + 2] * alpha
          a += alpha
          n += 1
        }
      }
      if (!a) continue
      const j = ((oy + y) * largeurSortie + ox + x) * 4
      sortie[j] = Math.round(r / a)
      sortie[j + 1] = Math.round(v / a)
      sortie[j + 2] = Math.round(b / a)
      sortie[j + 3] = Math.round(a / n)
    }
  }
}

function charger(nom, attendues, reference = 0) {
  const image = decoderPng(readFileSync(source(nom)))
  const poses = trouverPoses(image)
  if (poses.length !== attendues) {
    throw new Error(`${nom} : ${attendues} poses attendues, ${poses.length} trouvées`)
  }
  return { image, poses, yeux: blancDesYeux(image, poses[reference]) }
}

function principal() {
  const marche = charger('sprite-cagou.png', 5, 2)
  const telephone = charger('sprite-cagou-telephone.png', 1)
  const chute = charger('sprite-cagou-chute.png', 1)
  const relatif = (dessin) => Math.sqrt(marche.yeux / dessin.yeux)

  const enpied = [
    ...marche.poses.map((p) => ({ p, k: 1 })),
    { p: telephone.poses[0], k: relatif(telephone) },
  ]
  const plusHaute = Math.max(...enpied.map(({ p, k }) => (p.y1 - p.y0 + 1) * k))
  const plusLarge = Math.max(...enpied.map(({ p, k }) => (p.x1 - p.x0 + 1) * k))
  const echelle = Math.min(
    (VIGNETTE.h - MARGE.haut - MARGE.bas) / plusHaute,
    (VIGNETTE.l - 2) / plusLarge
  )

  const l = VIGNETTE.l * 6
  const planche = new Uint8Array(l * VIGNETTE.h * 4)
  marche.poses.forEach((pose, i) =>
    reduire(marche.image, pose, echelle, planche, l, { x: i * VIGNETTE.l, y: 0 })
  )
  reduire(telephone.image, telephone.poses[0], echelle * relatif(telephone), planche, l, {
    x: 5 * VIGNETTE.l,
    y: 0,
  })
  writeFileSync(dossier('cagou.png'), encoderPng(l, VIGNETTE.h, planche))

  const { l: lc, h: hc } = VIGNETTE_CHUTE
  const etale = new Uint8Array(lc * hc * 4)
  reduire(chute.image, chute.poses[0], echelle * relatif(chute), etale, lc, { x: 0, y: 0 }, VIGNETTE_CHUTE)
  writeFileSync(dossier('cagou-chute.png'), encoderPng(lc, hc, etale))

  console.log(`public/cagou.png : 6 vignettes de ${VIGNETTE.l} × ${VIGNETTE.h}`)
  console.log(`public/cagou-chute.png : ${lc} × ${hc}`)
}

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

principal()
