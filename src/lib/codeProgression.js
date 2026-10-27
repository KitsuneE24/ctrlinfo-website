// Code de progression : MARQUE+VERSION . forme (z déflaté / p brut) . base64url . empreinte
const MARQUE = 'CTRL'
const VERSION = 1

export class ErreurCode extends Error {
  constructor(raison, message) {
    super(message)
    this.name = 'ErreurCode'
    this.raison = raison
  }
}

// FNV-1a 32 bits : détecte un code tronqué ou altéré, pas une signature.
function empreinte(octets) {
  let empr = 0x811c9dc5
  for (const octet of octets) {
    empr ^= octet
    empr = Math.imul(empr, 0x01000193) >>> 0
  }
  return empr >>> 0
}

function enBase64Url(octets) {
  // Par tranches pour ne pas dépasser la pile d'appels.
  let binaire = ''
  for (let i = 0; i < octets.length; i += 8192) {
    binaire += String.fromCharCode(...octets.subarray(i, i + 8192))
  }
  return btoa(binaire).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')
}

function deBase64Url(texte) {
  const base64 = texte.replaceAll('-', '+').replaceAll('_', '/')
  const binaire = atob(base64.padEnd(Math.ceil(base64.length / 4) * 4, '='))
  const octets = new Uint8Array(binaire.length)
  for (let i = 0; i < binaire.length; i += 1) octets[i] = binaire.charCodeAt(i)
  return octets
}

const flux = (octets, transformation) =>
  new Response(new Blob([octets]).stream().pipeThrough(transformation))
    .arrayBuffer()
    .then((tampon) => new Uint8Array(tampon))

async function comprimer(octets) {
  if (typeof CompressionStream === 'undefined') return null
  try {
    return await flux(octets, new CompressionStream('deflate-raw'))
  } catch {
    return null
  }
}

// Limite contre une charge qui gonflerait à la décompression.
const OCTETS_MAX = 64 * 1024

async function decomprimer(octets) {
  if (typeof DecompressionStream === 'undefined') {
    throw new ErreurCode(
      'compression',
      "Ce navigateur ne sait pas lire ce code. Ouvrez le site dans un navigateur à jour, ou demandez un code exporté depuis celui-ci."
    )
  }
  const lecteur = new Blob([octets]).stream().pipeThrough(new DecompressionStream('deflate-raw')).getReader()
  const morceaux = []
  let taille = 0
  for (;;) {
    const { done, value } = await lecteur.read()
    if (done) break
    taille += value.length
    if (taille > OCTETS_MAX) {
      await lecteur.cancel()
      throw new ErreurCode('forme', "Ce texte contient bien trop de données pour être un code de progression.")
    }
    morceaux.push(value)
  }
  const resultat = new Uint8Array(taille)
  let position = 0
  for (const morceau of morceaux) {
    resultat.set(morceau, position)
    position += morceau.length
  }
  return resultat
}

export async function encoderCode(etat) {
  const octets = new TextEncoder().encode(JSON.stringify(etat))
  const somme = empreinte(octets).toString(36)

  const comprimes = await comprimer(octets)
  // Un petit état peut grossir une fois déflaté : on garde le plus court.
  const deflate = comprimes !== null && comprimes.length < octets.length
  const forme = deflate ? 'z' : 'p'

  return [MARQUE + VERSION, forme, enBase64Url(deflate ? comprimes : octets), somme].join('.')
}

export async function decoderCode(code) {
  const propre = (code ?? '').trim().replaceAll(/\s+/g, '')
  if (propre === '') {
    throw new ErreurCode('vide', 'Collez votre code de progression dans le champ.')
  }
  if (propre.length > 10_000) {
    throw new ErreurCode('forme', "Ce texte est bien trop long pour être un code de progression.")
  }

  const morceaux = propre.split('.')
  if (morceaux.length !== 4) {
    throw new ErreurCode(
      'forme',
      "Ce code est incomplet : il doit compter quatre parties séparées par des points. Vérifiez que vous l'avez copié en entier."
    )
  }

  const [marque, forme, charge, somme] = morceaux

  if (!marque.startsWith(MARQUE)) {
    throw new ErreurCode('marque', "Ce n'est pas un code de progression CTRL INFO.")
  }
  if (marque !== MARQUE + VERSION) {
    throw new ErreurCode(
      'version',
      "Ce code a été fait par une autre version du site : il ne peut pas être relu ici."
    )
  }
  if (forme !== 'z' && forme !== 'p') {
    throw new ErreurCode('forme', "Ce code est abîmé : sa deuxième partie n'est pas reconnue.")
  }

  let octets
  try {
    const brut = deBase64Url(charge)
    octets = forme === 'z' ? await decomprimer(brut) : brut
  } catch (echec) {
    if (echec instanceof ErreurCode) throw echec
    throw new ErreurCode(
      'illisible',
      "Ce code n'a pas pu être relu : un caractère a changé, ou il en manque un morceau. Recopie-le en entier, sans rien ajouter autour."
    )
  }

  if (empreinte(octets).toString(36) !== somme) {
    throw new ErreurCode(
      'abime',
      "Ce code a été abîmé en route : tronqué à la copie, ou coupé par un retour à la ligne. Rien n'a été modifié."
    )
  }

  try {
    return JSON.parse(new TextDecoder().decode(octets))
  } catch {
    throw new ErreurCode('illisible', "Ce code ne contient pas de progression lisible.")
  }
}
