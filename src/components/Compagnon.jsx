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
  SOL,
  VITESSE,
  auHasard,
  decalage,
  dureeLecture,
  lignesDeReaction,
  lirePlace,
  postureDe,
  repliquesDuJeu,
  repliquesPour,
  retenirPlace,
  stylePosture,
} from '../lib/compagnon'
import { dejaVu, marquerVu } from '../lib/premiereFois'
import { ecouterLeCompagnon } from '../state/compagnonSignaux'

const BULLE_MAX = 250

const AUCUNE = []

const POINTE = 16

const RECOUVREMENT = POINTE + 6

const DEGAGEMENT = 8

const CHUTE = 2400

const ETALE = 1200

const REPORT = 6000

const PERIODE_RELEVE = 1200

const HAUTEURS_SONDEES = [0.85, 0.55, 0.25]

const COLONNES_PAR_IMAGE = 6

const PAUSE_BALADE = { min: 4000, ecart: 5000 }

export default function Compagnon({ jeu = null }) {
  const { pathname } = useLocation()
  const enJeu = jeu !== null

  const sceneRef = useRef(null)
  const boiteRef = useRef(null)
  const spriteRef = useRef(null)
  const enJeuRef = useRef(enJeu)
  const jeuRef = useRef(jeu)
  const derniere = useRef(null)
  const ignorerClic = useRef(false)
  const bulleRef = useRef(null)
  const libreRef = useRef(true)
  const comptes = useRef({})
  const chrono = useRef({ bulle: 0 })

  const [posture, setPosture] = useState('repos')
  const [sens, setSens] = useState(1)
  const [atterrit, setAtterrit] = useState(false)
  const [bulle, setBulle] = useState(null)

  const cle = enJeu ? `jeu:${jeu}` : pathname
  const [file, setFile] = useState({ cle, dites: [] })

  const [reporte, setReporte] = useState(0)

  const lignes = enJeu ? repliquesDuJeu(jeu) : repliquesPour(pathname)
  const dites = file.cle === cle ? file.dites : AUCUNE
  const reste = dites.length < lignes.length

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

  const dire = useCallback(
    (texte) => {
      const scene = sceneRef.current
      const largeur = scene?.clientWidth ?? 0

      const axe = (etat.current.x ?? 0) + LARGEUR / 2
      const cote = largeur - axe >= axe ? 'droite' : 'gauche'
      const place = (cote === 'droite' ? largeur - axe : axe) - MARGE

      majPosture('repos')
      const duree = dureeLecture(texte)

      setBulle({ texte, cote, place: Math.min(BULLE_MAX, Math.max(place, 0)) })
      clearTimeout(chrono.current.bulle)
      chrono.current.bulle = setTimeout(() => setBulle(null), duree)
    },
    [majPosture]
  )

  const parler = useCallback(() => {
    const ligne = auHasard(lignes, [...dites, derniere.current])
    derniere.current = ligne
    dire(ligne)
    setFile({ cle, dites: [...dites, ligne] })
    setReporte(0)
  }, [cle, dire, dites, lignes])

  const reagir = useCallback(
    (nom) => {
      const reaction = REACTIONS[nom]
      if (!reaction) return

      const compteurs = comptes.current
      for (const cle of Object.keys(compteurs)) if (cle !== nom) compteurs[cle] = 0
      const compte = (compteurs[nom] ?? 0) + 1
      compteurs[nom] = compte
      if (compte % reaction.serie !== 0) return

      const ligne = auHasard(lignesDeReaction(reaction, jeuRef.current), [derniere.current])
      derniere.current = ligne
      dire(ligne)
    },
    [dire]
  )

  useEffect(() => ecouterLeCompagnon(reagir), [reagir])

  useEffect(() => {
    if (!reste) return undefined
    const delai = reporte > 0 ? REPORT : dites.length === 0 ? ATTENTE_ECRAN : ATTENTE_INACTIF
    const attente = setTimeout(() => {
      const malVenu =
        bulleRef.current ||
        etat.current.saisi ||
        (!libreRef.current && reporte < 3)
      if (malVenu) setReporte((n) => n + 1)
      else parler()
    }, delai)
    return () => clearTimeout(attente)
  }, [dites.length, parler, reporte, reste])

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

  useEffect(() => {
    enJeuRef.current = enJeu
    jeuRef.current = jeu
    etat.current.cible = null
    if (!enJeu) {
      majPosture('repos')
      return undefined
    }

    if (dejaVu('compagnon-jeu')) return undefined
    const attente = setTimeout(() => {
      marquerVu('compagnon-jeu')
      dire(auHasard(repliquesDuJeu(jeu)))
    }, 1600)
    return () => clearTimeout(attente)
  }, [dire, enJeu, jeu, majPosture])

  useEffect(() => {
    const scene = sceneRef.current
    const boite = boiteRef.current
    const sprite = spriteRef.current
    if (!scene || !boite || !sprite) return undefined

    let image = 0
    let dernier = performance.now()

    let carte = null
    let releve = null
    let prochainReleve = 0

    const porteDuTexte = (element) => {
      for (const noeud of element.childNodes) {
        if (noeud.nodeType === Node.TEXT_NODE && noeud.textContent.trim() !== '') return true
      }
      return false
    }

    const estOccupant = (element) =>
      element.matches?.(
        'a, button, input, select, textarea, label, [role="button"],' +
          ' img, svg, video, canvas, picture, figure'
      )

    const estSurface = (element) => {
      const style = getComputedStyle(element)
      const fond =
        style.backgroundImage !== 'none' ||
        !/^(transparent|rgba\(0, 0, 0, 0\))$/.test(style.backgroundColor)
      const bord = parseFloat(style.borderTopWidth) > 0 && style.borderTopStyle !== 'none'
      if (!fond && !bord) return false
      const boite = element.getBoundingClientRect()
      const cadre = scene.getBoundingClientRect()
      return boite.width < cadre.width * 0.95 || boite.height < cadre.height * 0.95
    }

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

      if (coutSous(etat.current.x) > 0) etat.current.cible = null
    }

    function coutSous(x) {
      if (!carte) return 0
      return carte.couts[Math.floor((x + LARGEUR / 2) / carte.pas)] ?? 0
    }

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
          e.cible = e.x + LARGEUR / 2 < largeur / 2 ? zone.min : zone.max
        } else {
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
      image = requestAnimationFrame(boucle)
      const dt = Math.min((maintenant - dernier) / 1000, 0.05)
      dernier = maintenant
      avancer(maintenant, dt)
    }

    image = requestAnimationFrame(boucle)
    const dernierEtat = etat.current
    return () => {
      cancelAnimationFrame(image)
      const largeur = scene.clientWidth
      if (largeur > 0 && dernierEtat.x !== null) retenirPlace(dernierEtat.x / largeur)
    }
  }, [majPosture, majSens])

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
          aria-label="Le cagou : appuyez pour un conseil, faites-le glisser pour le déplacer"
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
