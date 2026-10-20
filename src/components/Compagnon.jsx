import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router'
import {
  ATTENTE_ECRAN,
  ATTENTE_INACTIF,
  BONJOUR,
  DEBORD_CHUTE,
  HAUTEUR,
  LARGEUR,
  MARGE,
  REACTIONS,
  REPLIQUES_JEU,
  SOL,
  VITESSE,
  decalage,
  dureeLecture,
  lirePlace,
  postureDe,
  repliquesPour,
  retenirPlace,
  stylePosture,
} from '../lib/compagnon'
import { dejaVu, marquerVu } from '../lib/premiereFois'
import { ecouterLeCompagnon } from '../state/compagnonSignaux'

/** Largeur maximale d'une bulle. */
const BULLE_MAX = 250

/** Distance de la pointe au bord de la bulle côté personnage. */
const POINTE = 16

/** Dépassement de la bulle sur l'ancre : la pointe tombe sur son axe. */
const RECOUVREMENT = POINTE + 6

/** Espace entre la bulle et sa tête. */
const DEGAGEMENT = 8

/** Pesanteur, en px/s². */
const CHUTE = 2400

/** Durée au sol après une chute, en ms. */
const ETALE = 1200

/** Report d'une réplique mal placée, en ms. */
const REPORT = 6000

/** Intervalle entre deux relevés de l'écran, en ms. */
const PERIODE_RELEVE = 1200

/** Hauteurs sondées, en fraction de sa taille : tête, corps, pattes. */
const HAUTEURS_SONDEES = [0.85, 0.55, 0.25]

/** Colonnes relevées par image. */
const COLONNES_PAR_IMAGE = 6

/** Pause entre deux promenades, en ms : minimum + hasard. */
const PAUSE_BALADE = { min: 4000, ecart: 5000 }

/**
 * Le compagnon, en bas de l'écran : il parle et se promène dans les zones
 * libres ; sans zone libre, il va où il gêne le moins. En partie, il se range
 * sur le côté.
 * La position est écrite dans le style à chaque image, pas dans un état React.
 *
 * @param enJeu une partie est en cours.
 */
export default function Compagnon({ enJeu = false }) {
  const { pathname } = useLocation()

  const sceneRef = useRef(null)
  const boiteRef = useRef(null)
  const spriteRef = useRef(null)
  const enJeuRef = useRef(enJeu)
  const ignorerClic = useRef(false)
  const bulleRef = useRef(null)
  // Sa place est libre : lu par le minuteur de parole.
  const libreRef = useRef(true)
  const comptes = useRef({})
  const chrono = useRef({ bulle: 0 })

  const [posture, setPosture] = useState('repos')
  const [sens, setSens] = useState(1)
  const [atterrit, setAtterrit] = useState(false)
  const [bulle, setBulle] = useState(null)

  /** Répliques dites sur l'écran en cours ; un autre chemin remet à zéro. */
  const [file, setFile] = useState({ chemin: pathname, dits: 0 })

  /** Nombre de reports de la réplique en attente. */
  const [reporte, setReporte] = useState(0)

  const lignes = enJeu ? REPLIQUES_JEU : repliquesPour(pathname)
  const dits = file.chemin === pathname ? file.dits : 0
  const reste = dits < lignes.length

  /** État de chaque image. `x` depuis le bord gauche, `y` depuis le sol. */
  const etat = useRef({
    x: null,
    y: 0,
    vy: 0,
    sens: 1,
    posture: 'repos',
    phase: 0,
    saisi: null,
    cible: null,
    lacheDe: 0,
    etaleJusqua: 0,
    prochaineBalade: 0,
  })

  const majPosture = useCallback((nom) => {
    if (etat.current.posture === nom) return
    etat.current.posture = nom
    setPosture(nom)
  }, [])

  const majSens = useCallback((valeur) => {
    if (etat.current.sens === valeur) return
    etat.current.sens = valeur
    setSens(valeur)
  }, [])

  useEffect(() => {
    bulleRef.current = bulle
  }, [bulle])

  /* ------------------------------------------------------------ la parole */

  /** Ouvre une bulle du côté où il reste le plus de place ; il reste immobile tant qu'elle est ouverte. */
  const dire = useCallback(
    (texte) => {
      const scene = sceneRef.current
      const largeur = scene?.clientWidth ?? 0

      const axe = (etat.current.x ?? 0) + LARGEUR / 2
      const cote = largeur - axe >= axe ? 'droite' : 'gauche'
      const place = (cote === 'droite' ? largeur - axe : axe) - MARGE

      // De face pour parler, même en partie.
      majPosture('repos')
      const duree = dureeLecture(texte)

      setBulle({ texte, cote, place: Math.min(BULLE_MAX, Math.max(place, 0)) })
      clearTimeout(chrono.current.bulle)
      chrono.current.bulle = setTimeout(() => setBulle(null), duree)
    },
    [majPosture]
  )

  /** Réplique suivante de l'écran, dans l'ordre, en boucle. */
  const parler = useCallback(() => {
    dire(lignes[dits % lignes.length])
    setFile({ chemin: pathname, dits: dits + 1 })
    setReporte(0)
  }, [dire, dits, lignes, pathname])

  /** Réagit à une série du joueur ; un autre signal remet les compteurs à zéro. */
  const reagir = useCallback(
    (nom) => {
      const reaction = REACTIONS[nom]
      if (!reaction) return

      const compteurs = comptes.current
      for (const cle of Object.keys(compteurs)) if (cle !== nom) compteurs[cle] = 0
      const compte = (compteurs[nom] ?? 0) + 1
      compteurs[nom] = compte
      if (compte % reaction.serie !== 0) return

      const rang = compte / reaction.serie - 1
      dire(reaction.lignes[rang % reaction.lignes.length])
    },
    [dire]
  )

  useEffect(() => ecouterLeCompagnon(reagir), [reagir])

  // Parle seul après un délai ; reporte s'il parle déjà, est tenu, ou devant
  // du contenu (trois fois au plus dans ce cas).
  useEffect(() => {
    if (!reste) return undefined
    const delai = reporte > 0 ? REPORT : dits === 0 ? ATTENTE_ECRAN : ATTENTE_INACTIF
    const attente = setTimeout(() => {
      const malVenu =
        bulleRef.current ||
        etat.current.saisi ||
        (!libreRef.current && reporte < 3)
      if (malVenu) setReporte((n) => n + 1)
      else parler()
    }, delai)
    return () => clearTimeout(attente)
  }, [dits, parler, reporte, reste])

  // Présentation à la toute première visite.
  useEffect(() => {
    if (dejaVu('compagnon')) return undefined
    const attente = setTimeout(() => {
      marquerVu('compagnon')
      dire(BONJOUR)
    }, 2500)
    return () => clearTimeout(attente)
  }, [dire])

  useEffect(() => {
    const minuteries = chrono.current
    return () => clearTimeout(minuteries.bulle)
  }, [])

  /* --------------------------------------------------------- la promenade */

  useEffect(() => {
    enJeuRef.current = enJeu
    etat.current.cible = null
    if (!enJeu) {
      majPosture('repos')
      return undefined
    }

    // Il s'explique à la première partie seulement.
    if (dejaVu('compagnon-jeu')) return undefined
    const attente = setTimeout(() => {
      marquerVu('compagnon-jeu')
      dire(REPLIQUES_JEU[0])
    }, 1600)
    return () => clearTimeout(attente)
  }, [dire, enJeu, majPosture])

  useEffect(() => {
    const scene = sceneRef.current
    const boite = boiteRef.current
    const sprite = spriteRef.current
    if (!scene || !boite || !sprite) return undefined

    let image = 0
    let dernier = performance.now()

    /* --- Le relevé : ce qui occupe la ligne du bas --- */

    let carte = null // dernier relevé complet
    let releve = null // relevé en cours
    let prochainReleve = 0

    /** L'élément a du texte en propre. */
    const porteDuTexte = (element) => {
      for (const noeud of element.childNodes) {
        if (noeud.nodeType === Node.TEXT_NODE && noeud.textContent.trim() !== '') return true
      }
      return false
    }

    /** Élément interactif ou visuel. */
    const estOccupant = (element) =>
      element.matches?.(
        'a, button, input, select, textarea, label, [role="button"],' +
          ' img, svg, video, canvas, picture, figure'
      )

    /** Un bloc visible (fond ou bordure) plus petit que l'écran : carte, bandeau, vignette. */
    const estSurface = (element) => {
      const style = getComputedStyle(element)
      const fond =
        style.backgroundImage !== 'none' ||
        !/^(transparent|rgba\(0, 0, 0, 0\))$/.test(style.backgroundColor)
      const bord = parseFloat(style.borderTopWidth) > 0 && style.borderTopStyle !== 'none'
      if (!fond && !bord) return false
      // Le fond de page couvre toute la scène : ignoré.
      const boite = element.getBoundingClientRect()
      const cadre = scene.getBoundingClientRect()
      return boite.width < cadre.width * 0.95 || boite.height < cadre.height * 0.95
    }

    /** Contenu à ne pas couvrir sous ce point (trois éléments au plus, hors scène). */
    const occupeAu = (x, y) => {
      if (typeof document.elementsFromPoint !== 'function') return false
      let vus = 0
      for (const element of document.elementsFromPoint(x, y)) {
        if (scene.contains(element)) continue
        if (porteDuTexte(element) || estOccupant(element) || estSurface(element)) return true
        if (++vus >= 3) break
      }
      return false
    }

    /** Relève quelques colonnes par image ; coût d'une colonne = hauteurs occupées (0 à 3). */
    function avancerReleve(maintenant, cadre) {
      if (!releve) {
        if (maintenant < prochainReleve || cadre.width <= 0) return
        const pas = Math.round(LARGEUR / 2)
        releve = { pas, i: 0, nombre: Math.ceil(cadre.width / pas), couts: [] }
      }
      const hauteurs = HAUTEURS_SONDEES.map((part) => cadre.bottom - SOL - HAUTEUR * part)
      for (let n = 0; n < COLONNES_PAR_IMAGE && releve.i < releve.nombre; n += 1) {
        const x = cadre.left + releve.i * releve.pas + releve.pas / 2
        releve.couts.push(hauteurs.reduce((total, y) => total + (occupeAu(x, y) ? 1 : 0), 0))
        releve.i += 1
      }
      if (releve.i < releve.nombre) return
      carte = { pas: releve.pas, couts: releve.couts }
      releve = null
      prochainReleve = maintenant + PERIODE_RELEVE

      // Chaque relevé remet sa place en question.
      if (coutSous(etat.current.x) > 0) etat.current.cible = null
    }

    /** Coût de la colonne où il se tient, de 0 (libre) à 3. */
    function coutSous(x) {
      if (!carte) return 0
      return carte.couts[Math.floor((x + LARGEUR / 2) / carte.pas)] ?? 0
    }

    /** Plages de colonnes au coût ≤ `seuil`, assez larges pour lui. */
    function plagesSous(seuil, min, max) {
      const { pas, couts } = carte
      const plages = []
      let debut = -1
      couts.forEach((cout, i) => {
        if (cout <= seuil && debut < 0) debut = i
        if (debut >= 0 && (cout > seuil || i === couts.length - 1)) {
          const fin = cout <= seuil ? i + 1 : i
          plages.push({
            min: Math.max(min, debut * pas),
            max: Math.min(max, fin * pas - LARGEUR),
          })
          debut = -1
        }
      })
      return plages.filter((plage) => plage.max >= plage.min)
    }

    /** Plage la plus proche au plus petit seuil possible (`seuil` 0 : vraiment libre). */
    function couloir(min, max) {
      if (!carte) return { min, max, seuil: 0 }
      for (let seuil = 0; seuil < HAUTEURS_SONDEES.length; seuil += 1) {
        const plages = plagesSous(seuil, min, max)
        if (plages.length === 0) continue
        const x = etat.current.x
        const ecart = (plage) => Math.max(plage.min - x, x - plage.max, 0)
        return { ...plages.reduce((a, b) => (ecart(b) < ecart(a) ? b : a)), seuil }
      }
      return { min, max, seuil: HAUTEURS_SONDEES.length }
    }

    /* --- Se pousser, se promener --- */

    /** De temps en temps, quelques pas dans la plage libre où il se trouve. */
    function promenade(maintenant, min, max) {
      const e = etat.current
      if (enJeuRef.current) return
      if (!e.prochaineBalade) {
        e.prochaineBalade = maintenant + PAUSE_BALADE.min + Math.random() * PAUSE_BALADE.ecart
        return
      }
      if (maintenant < e.prochaineBalade) return
      e.prochaineBalade = 0
      const zone = couloir(min, max)
      if (zone.seuil > 0 || zone.max - zone.min < LARGEUR) return
      const cible = zone.min + Math.random() * (zone.max - zone.min)
      if (Math.abs(cible - e.x) >= LARGEUR / 2) e.cible = cible
    }

    function sEcarter(dt, largeur, min, max, maintenant) {
      const e = etat.current
      if (e.cible === null) {
        const zone = couloir(min, max)
        if (enJeuRef.current) {
          // En partie : le bout du couloir, du côté où il se trouve déjà.
          e.cible = e.x + LARGEUR / 2 < largeur / 2 ? zone.min : zone.max
        } else {
          // Le point le plus proche de la plage la moins encombrée.
          e.cible = Math.min(Math.max(e.x, zone.min), zone.max)
        }
      }

      const reste = e.cible - e.x
      if (Math.abs(reste) < 1) {
        e.x = e.cible
        majPosture(enJeuRef.current ? 'telephone' : 'repos')
        promenade(maintenant, min, max)
        return
      }
      majSens(Math.sign(reste))
      e.x += e.sens * Math.min(Math.abs(reste), VITESSE * dt)
      majPosture('marche')
    }

    function avancer(maintenant, dt) {
      const e = etat.current
      const cadre = scene.getBoundingClientRect()
      const min = MARGE
      const max = Math.max(MARGE, cadre.width - LARGEUR - MARGE)

      if (e.x === null) {
        const place = lirePlace()
        e.x = place === null ? min : place * cadre.width
      }
      e.x = Math.min(Math.max(e.x, min), max)
      const avant = e.x

      if (!e.saisi) avancerReleve(maintenant, cadre)

      if (e.saisi) {
        // Tenu : le pointeur le place.
      } else if (e.y > 0 || e.vy !== 0) {
        e.vy -= CHUTE * dt
        e.y += e.vy * dt
        if (e.y <= 0) {
          e.y = 0
          e.vy = 0
          // Lâché de plus haut que sa taille : il s'étale.
          if (e.lacheDe > HAUTEUR) {
            e.x = Math.min(Math.max(e.x, DEBORD_CHUTE), cadre.width - LARGEUR - DEBORD_CHUTE)
            e.etaleJusqua = maintenant + ETALE
            majPosture('chute')
          } else {
            setAtterrit(true)
            setTimeout(() => setAtterrit(false), 220)
          }
          e.lacheDe = 0
        }
      } else if (e.etaleJusqua) {
        if (maintenant >= e.etaleJusqua) {
          e.etaleJusqua = 0
          majPosture('repos')
        }
      } else if (bulleRef.current) {
        // Il parle : immobile.
      } else {
        sEcarter(dt, cadre.width, min, max, maintenant)
      }

      libreRef.current = coutSous(e.x) === 0
      boite.style.transform = `translate3d(${Math.round(e.x)}px, ${-Math.round(e.y)}px, 0)`
      dessiner(Math.abs(e.x - avant), dt)
    }

    /** Pose la vignette : à la distance parcourue (`pas`) ou au temps (`cadence`). */
    function dessiner(parcouru, dt) {
      const e = etat.current
      const { debut, images, pas, cadence } = postureDe(e.posture, e.sens)

      if (images === 1) e.phase = 0
      else e.phase += pas ? parcouru : dt

      const echelle = pas ?? cadence
      const index = images === 1 ? 0 : Math.floor(e.phase / echelle) % images
      sprite.style.backgroundPositionX = `${decalage(debut, index)}px`
    }

    const boucle = (maintenant) => {
      // Demandée avant le calcul : une erreur n'arrête pas la boucle.
      image = requestAnimationFrame(boucle)
      // Pas plafonné au retour d'un onglet en arrière-plan.
      const dt = Math.min((maintenant - dernier) / 1000, 0.05)
      dernier = maintenant
      avancer(maintenant, dt)
    }

    image = requestAnimationFrame(boucle)
    // Relu au démontage pour retenir sa place.
    const dernierEtat = etat.current
    return () => {
      cancelAnimationFrame(image)
      const largeur = scene.clientWidth
      if (largeur > 0 && dernierEtat.x !== null) retenirPlace(dernierEtat.x / largeur)
    }
  }, [majPosture, majSens])

  /* ------------------------------------------------------ prendre et poser */

  const attraper = useCallback(
    (evenement) => {
      const scene = sceneRef.current
      const e = etat.current
      if (!scene || e.x === null) return
      const cadre = scene.getBoundingClientRect()

      ignorerClic.current = false
      evenement.currentTarget.setPointerCapture(evenement.pointerId)
      e.saisi = {
        id: evenement.pointerId,
        dx: evenement.clientX - (cadre.left + e.x),
        dy: evenement.clientY - (cadre.bottom - SOL - e.y - HAUTEUR),
        bouge: false,
        depart: { x: evenement.clientX, y: evenement.clientY },
      }
      e.vy = 0
      e.etaleJusqua = 0
      majPosture('porte')
    },
    [majPosture]
  )

  const deplacer = useCallback((evenement) => {
    const e = etat.current
    const scene = sceneRef.current
    if (!e.saisi || e.saisi.id !== evenement.pointerId || !scene) return

    const cadre = scene.getBoundingClientRect()
    const max = Math.max(MARGE, cadre.width - LARGEUR - MARGE)
    e.x = Math.min(Math.max(evenement.clientX - e.saisi.dx - cadre.left, MARGE), max)
    e.y = Math.min(
      Math.max(cadre.bottom - SOL - (evenement.clientY - e.saisi.dy) - HAUTEUR, 0),
      Math.max(0, cadre.height - HAUTEUR - SOL)
    )

    const ecart =
      Math.abs(evenement.clientX - e.saisi.depart.x) +
      Math.abs(evenement.clientY - e.saisi.depart.y)
    if (ecart > 6) e.saisi.bouge = true
  }, [])

  const poser = useCallback(
    (evenement) => {
      const e = etat.current
      if (!e.saisi || e.saisi.id !== evenement.pointerId) return
      const bouge = e.saisi.bouge
      e.saisi = null

      // Sans mouvement, c'est un appui : le clic qui suit le fait parler.
      ignorerClic.current = bouge
      majPosture('repos')

      if (bouge) {
        e.lacheDe = e.y
        e.cible = e.x
        const largeur = sceneRef.current?.clientWidth ?? 0
        if (largeur > 0) retenirPlace(e.x / largeur)
      }
    },
    [majPosture]
  )

  const cliquer = useCallback(() => {
    if (ignorerClic.current) {
      ignorerClic.current = false
      return
    }
    if (bulle) setBulle(null)
    else parler()
  }, [bulle, parler])

  /** Flèches du clavier : déplacement de 24 px. */
  const auClavier = useCallback(
    (evenement) => {
      const pas = evenement.key === 'ArrowLeft' ? -24 : evenement.key === 'ArrowRight' ? 24 : 0
      if (pas === 0) return
      evenement.preventDefault()
      const e = etat.current
      e.x = (e.x ?? 0) + pas
      majSens(Math.sign(pas))
    },
    [majSens]
  )

  return (
    <div
      className="compagnon-scene"
      ref={sceneRef}
      style={{
        '--compagnon-largeur': `${LARGEUR}px`,
        '--compagnon-hauteur': `${HAUTEUR}px`,
        '--compagnon-sol': `${SOL}px`,
      }}
    >
      <div
        className="compagnon"
        ref={boiteRef}
        data-posture={posture}
      >
        {/* Ancre à son axe : la bulle suit ses déplacements. */}
        <div className="compagnon__ancre" style={{ bottom: HAUTEUR + DEGAGEMENT }}>
            {bulle && (
              <p
                key={bulle.texte}
                role="status"
                style={{
                  maxWidth: bulle.place,
                  [bulle.cote === 'droite' ? 'left' : 'right']: -RECOUVREMENT,
                  transformOrigin: `bottom ${bulle.cote === 'droite' ? 'left' : 'right'}`,
                  '--pointe-gauche': bulle.cote === 'droite' ? `${POINTE}px` : 'auto',
                  '--pointe-droite': bulle.cote === 'gauche' ? `${POINTE}px` : 'auto',
                }}
                className="compagnon__bulle anim-surgit"
              >
                {bulle.texte}
              </p>
            )}
        </div>

        <button
          type="button"
          aria-label="Le compagnon — appuie pour un conseil, glisse-le pour le déplacer"
          ref={spriteRef}
          className={`compagnon__sprite${atterrit ? ' compagnon__sprite--pose' : ''}`}
          style={stylePosture(posture, sens)}
          onPointerDown={attraper}
          onPointerMove={deplacer}
          onPointerUp={poser}
          onPointerCancel={poser}
          onLostPointerCapture={poser}
          onClick={cliquer}
          onKeyDown={auClavier}
        />
      </div>
    </div>
  )
}
