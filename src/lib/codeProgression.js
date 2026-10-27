/**
 * Le code de progression : tout l'avancement du joueur en une chaîne copiable.
 *
 * Il n'y a pas de compte, donc pas de serveur qui se souvienne : le code *est*
 * le moyen de passer d'un appareil à l'autre, ou de retrouver sa partie après
 * un nettoyage du navigateur. Il se colle dans un e-mail, un carnet, un
 * message — il doit donc survivre à une copie maladroite, et le dire quand il
 * n'y a pas survécu.
 *
 * ## La forme
 *
 *     CTRL1.z.eJyrVspLzE1VslJ....2s.1f3k9p
 *     └───┘ │ └──────────────────┘ └────┘
 *     marque│       charge          somme
 *           forme
 *
 *   - **marque** — `CTRL` et la version de la forme des données. Elle permet de
 *     reconnaître tout de suite un code qui n'en est pas un, et un code écrit
 *     par une version du site plus récente que celle qu'on a sous les yeux.
 *   - **forme** — `z` déflaté, `p` brut (voir plus bas).
 *   - **charge** — les données, en base64url : aucun caractère qui demande
 *     d'être échappé dans une URL, et surtout pas de `+` ni de `/` qu'un
 *     traitement de texte pourrait couper à la ligne.
 *   - **somme** — une empreinte des données *avant* toute compression. C'est
 *     elle qui distingue « ce code est tronqué » de « ce code est complet » :
 *     base64 tronqué se décode souvent sans broncher, en rendant des octets
 *     plausibles mais faux.
 *
 * Le point est le séparateur parce qu'il n'appartient pas à l'alphabet
 * base64url : découper le code ne peut donc jamais tomber au milieu des
 * données.
 *
 * ## Pourquoi une compression
 *
 * L'avancement, c'est surtout une liste de slugs de publications — des mots
 * français qui se ressemblent beaucoup. Déflatés, ils tiennent en un cinquième
 * de la place, et un code de trois mille caractères devient un code de six
 * cents. `CompressionStream` manque encore à quelques navigateurs : on écrit
 * alors la charge telle quelle, sous la forme `p`, et la lecture accepte les
 * deux dans tous les cas. Un code fait ici reste donc lisible partout.
 */
const MARQUE = 'CTRL'
const VERSION = 1

/** Ce qui n'a pas marché, avec de quoi le dire au joueur. */
export class ErreurCode extends Error {
  constructor(raison, message) {
    super(message)
    this.name = 'ErreurCode'
    this.raison = raison
  }
}

// ── Empreinte ────────────────────────────────────────────────────────────────

/**
 * FNV-1a sur 32 bits.
 *
 * Ce n'est pas une signature : un joueur qui veut se fabriquer une progression
 * y arrivera, et ce n'est pas grave — il n'y a ni classement ni compte à
 * protéger. Ce qu'on cherche, c'est repérer un code amputé de sa fin ou dont un
 * caractère a changé au copier-coller, et c'est exactement ce que ça fait.
 */
function empreinte(octets) {
  let empr = 0x811c9dc5
  for (const octet of octets) {
    empr ^= octet
    empr = Math.imul(empr, 0x01000193) >>> 0
  }
  return empr >>> 0
}

// ── Base64url ────────────────────────────────────────────────────────────────

function enBase64Url(octets) {
  // Par tranches : `String.fromCharCode(...tableau)` dépasse la pile d'appels
  // sur quelques dizaines de milliers d'octets.
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

// ── Compression ──────────────────────────────────────────────────────────────

const flux = (octets, transformation) =>
  new Response(new Blob([octets]).stream().pipeThrough(transformation))
    .arrayBuffer()
    .then((tampon) => new Uint8Array(tampon))

async function comprimer(octets) {
  if (typeof CompressionStream === 'undefined') return null
  try {
    return await flux(octets, new CompressionStream('deflate-raw'))
  } catch {
    // Un navigateur qui annonce l'objet sans savoir déflater : on s'en passe.
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
  // Un état minuscule peut grossir en se faisant déflater : on garde le plus
  // court des deux, la lecture sachant reconnaître les deux formes.
  const deflate = comprimes !== null && comprimes.length < octets.length
  const forme = deflate ? 'z' : 'p'

  return [MARQUE + VERSION, forme, enBase64Url(deflate ? comprimes : octets), somme].join('.')
}

// ── Relire ───────────────────────────────────────────────────────────────────

/**
 * L'état d'un code, ou une `ErreurCode` qui dit précisément ce qui manque.
 *
 * L'ordre des contrôles est celui des messages qu'on veut pouvoir donner : on
 * reconnaît d'abord le code, puis sa version, puis son intégrité. Dire « ce
 * code vient d'une version plus récente » vaut mieux que « code invalide », et
 * dire « il a été abîmé en route » vaut mieux que restaurer une progression
 * fausse.
 */
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
    // Une erreur de décompression qu'on a soi-même levée porte déjà son
    // message : on ne la recouvre pas.
    if (echec instanceof ErreurCode) throw echec
    // Deux causes pour une même impasse : un caractère étranger au code, ou un
    // caractère changé qui rend la charge indéchiffrable. Le geste à proposer
    // est le même dans les deux cas, donc le message aussi.
    throw new ErreurCode(
      'illisible',
      "Ce code n'a pas pu être relu : un caractère a changé, ou il en manque un morceau. Recopie-le en entier, sans rien ajouter autour."
    )
  }

  if (empreinte(octets).toString(36) !== somme) {
    throw new ErreurCode(
      'abime',
      "Ce code a été abîmé en route — tronqué à la copie, ou coupé par un retour à la ligne. Rien n'a été modifié."
    )
  }

  try {
    return JSON.parse(new TextDecoder().decode(octets))
  } catch {
    throw new ErreurCode('illisible', "Ce code ne contient pas de progression lisible.")
  }
}
