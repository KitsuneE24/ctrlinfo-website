import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router'
import {
  ATTENTE_ECRAN,
  ATTENTE_INACTIF,
  BONJOUR,
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

/** La largeur maximale d'une bulle, quand la place ne manque pas. */
const BULLE_MAX = 250

/**
 * La pointe, à tant de pixels du bord de la bulle qui touche le personnage.
 * Au-delà du rayon de l'angle (13 px) : posée dessus, elle en dépassait.
 */
const POINTE = 16

/**
 * De combien le bord de la bulle dépasse l'ancre. Toujours `POINTE` plus la
 * demi-largeur de la pointe : c'est ce qui la laisse sur l'axe du personnage.
 */
const RECOUVREMENT = POINTE + 6

/** Ce qui sépare le bas de la bulle du haut de sa tête : elle ne le couvre pas. */
const DEGAGEMENT = 8

/** La pesanteur qui le ramène au sol, en pixels par seconde carrée. */
const CHUTE = 2400

/** Le report d'une réplique qui tombait mal, en millisecondes. */
const REPORT = 6000

/** Le temps entre deux relevés du texte sous ses pieds. */
const PERIODE_RELEVE = 1200

/** Les hauteurs sondées sous lui, en fraction de sa taille : tête, corps, pattes. */
const HAUTEURS_SONDEES = [0.85, 0.55, 0.25]

/** Combien de colonnes il relève par image : le coût se répartit. */
const COLONNES_PAR_IMAGE = 6

/**
 * Le compagnon : un petit personnage qui vit en bas de l'écran.
 *
 * Il se tient en bas de l'écran et **parle de lui-même** : un mot sur l'écran
 * où l'on est, une réaction à ce que fait le joueur — trois bonnes réponses de
 * suite, deux erreurs, une partie finie. On peut le toucher pour le faire
 * parler tout de suite, et l'attraper pour le poser ailleurs : sa place est
 * retenue d'une visite à l'autre.
 *
 * **Il ne se promène pas.** Il ne bouge que pour une raison : ne rien couvrir.
 * Une balade au hasard a existé ici et a été retirée — elle accrochait l'œil
 * sans rien apporter, et un personnage qui traverse un paragraphe reste un
 * personnage qui traverse un paragraphe, même s'il ne s'y arrête pas.
 *
 * **Il ne doit jamais gêner.** Quatre choses s'en assurent :
 *
 * - la scène couvre la zone de l'écran mais ne reçoit aucun clic
 *   (`pointer-events: none`) ; seul le personnage en reçoit. Tout ce qu'il
 *   survole reste cliquable au travers ;
 * - il vit **au-dessus de la barre d'onglets, pas dessus** : la scène est
 *   posée dans `.app__main`, donc entre l'en-tête et la navigation ;
 * - **il ne se tient pas devant les mots.** Il relève régulièrement ce qu'il y
 *   a sous lui — du texte, ce qui se clique, ce qui se regarde — et dès qu'il
 *   couvre quelque chose il marche jusqu'au vide le plus proche. Là où tout est
 *   occupé, il va au moins gênant ; il se déplace, il ne devient jamais
 *   transparent ;
 * - **pendant une partie, il se met franchement sur le côté** et y sort son
 *   téléphone. C'est un retrait annoncé, pas un ajustement. Il continue de
 *   commenter les coups.
 *
 * Le mouvement est écrit directement dans le style de l'élément, image par
 * image, plutôt que par un état React : une balade à soixante images par
 * seconde ne doit pas re-rendre l'application. Seuls les changements rares —
 * la posture, le sens, la bulle — passent par un état.
 *
 * @param enJeu une partie est en cours — il se met en retrait.
 */
export default function Compagnon({ enJeu = false }) {
  const { pathname } = useLocation()

  const sceneRef = useRef(null)
  const boiteRef = useRef(null)
  const spriteRef = useRef(null)
  const enJeuRef = useRef(enJeu)
  const ignorerClic = useRef(false)
  const bulleRef = useRef(null)
  // Sa place est-elle libre de texte ? La boucle le sait, le minuteur de
  // parole a besoin de le savoir.
  const libreRef = useRef(true)
  const comptes = useRef({})
  const chrono = useRef({ bulle: 0 })

  // La toute première fois, une pastille « 1 » flotte au-dessus de lui : elle
  // dit qu'il y a quelqu'un à toucher. Elle part au premier appui et ne
  // revient jamais — ce n'est pas un compteur de messages, c'est une
  // présentation.
  const [astuce, setAstuce] = useState(() => !dejaVu('compagnon-notif'))
  const [posture, setPosture] = useState('repos')
  const [sens, setSens] = useState(1)
  const [atterrit, setAtterrit] = useState(false)
  const [bulle, setBulle] = useState(null)

  /**
   * Où en est sa file de répliques, et sur quel écran.
   *
   * Le chemin est rangé **avec** le compte : arriver ailleurs suffit alors à
   * remettre la file à zéro, sans rien réécrire — ni pendant le rendu, ni dans
   * un effet.
   */
  const [file, setFile] = useState({ chemin: pathname, dits: 0 })

  /** Combien de fois il a dû remettre sa réplique à plus tard. */
  const [reporte, setReporte] = useState(0)

  const lignes = enJeu ? REPLIQUES_JEU : repliquesPour(pathname)
  const dits = file.chemin === pathname ? file.dits : 0
  const reste = dits < lignes.length

  /**
   * Tout ce qui change à chaque image. `x` compte depuis le bord gauche de la
   * scène, `y` depuis le sol : posé, il est à zéro.
   */
  const etat = useRef({
    x: null,
    y: 0,
    vy: 0,
    sens: 1,
    posture: 'repos',
    phase: 0,
    saisi: null,
    cible: null,
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

  /**
   * Ouvrir une bulle.
   *
   * **La bulle est accrochée au personnage** : elle vit dans sa boîte, qui est
   * déplacée par une transformation, et le suit donc sans qu'une seule ligne de
   * code ait à la déplacer. C'est la seule façon fiable qu'elle ne se retrouve
   * jamais en arrière — un placement calculé image par image entrait en
   * conflit avec les styles que React réécrit.
   *
   * Elle pend à une ancre posée à l'axe du personnage, et **la pointe est
   * toujours du côté qui le touche** — jamais au milieu :
   *
   *   il est à gauche                      il est à droite
   *   ┌────────────┐                       ┌────────────┐
   *   │   bulle    │                       │   bulle    │
   *   └─┬──────────┘                       └──────────┬─┘
   *   ▲ son axe                                       ▲ son axe
   *
   * Le côté de la pointe est posé en style en ligne, pas par une classe : les
   * règles CSS qui s'en chargeaient ne s'appliquaient pas, et un `::after` sans
   * `left` ni `right` retombe à sa position statique — au bout du texte.
   *
   * Et comme elle est accrochée à lui, il **ne bouge plus tant qu'elle est
   * ouverte** : c'est ce qui garantit que la place mesurée reste vraie
   * jusqu'au bout.
   */
  const dire = useCallback(
    (texte) => {
      const scene = sceneRef.current
      const largeur = scene?.clientWidth ?? 0

      // Le côté où il reste le plus de place, et cette place exactement : le
      // bord de la bulle part de son axe, elle s'étend vers le bord de l'écran
      // et s'arrête à la marge. Aucun plancher — une bulle un peu étroite se
      // lit encore, une bulle coupée non.
      const axe = (etat.current.x ?? 0) + LARGEUR / 2
      const cote = largeur - axe >= axe ? 'droite' : 'gauche'
      const place = (cote === 'droite' ? largeur - axe : axe) - MARGE

      // Il se tourne vers le joueur pour parler — c'est la vignette de face,
      // même en pleine partie : on ne parle pas le nez dans son téléphone. La
      // boucle le tient immobile tant que la bulle est là, et il reprend sa
      // pose d'avant quand elle se referme.
      majPosture('repos')

      // Le temps de lecture dépend de la longueur : une phrase courte ne doit
      // pas occuper le coin de l'écran aussi longtemps qu'une longue.
      const duree = dureeLecture(texte)

      setBulle({ texte, cote, place: Math.min(BULLE_MAX, Math.max(place, 0)) })
      clearTimeout(chrono.current.bulle)
      chrono.current.bulle = setTimeout(() => setBulle(null), duree)
    },
    [majPosture]
  )

  /**
   * Dire la réplique suivante pour l'écran en cours.
   *
   * Elles sont dites dans l'ordre, une par une. Une fois toutes passées, la
   * pastille s'éteint — mais on peut encore le toucher, et elles recommencent.
   */
  const parler = useCallback(() => {
    dire(lignes[dits % lignes.length])
    setFile({ chemin: pathname, dits: dits + 1 })
    setReporte(0)
  }, [dire, dits, lignes, pathname])

  /**
   * Réagir à ce que vient de faire le joueur.
   *
   * Une réaction attend sa série : trois bonnes réponses, deux erreurs. Un
   * signal d'un autre nom remet les autres compteurs à zéro — sans quoi une
   * « série » de trois s'étalerait sur toute la partie. Ces phrases-là ne
   * passent pas par la file de l'écran : elles se disent tout de suite.
   */
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

  /**
   * Ce qui le fait parler tout seul : un premier mot peu après l'arrivée sur un
   * écran, puis un autre de loin en loin, jusqu'à ce qu'il ait tout dit ici.
   *
   * Le minuteur n'est pas une boucle : chaque réplique dite change `dits`,
   * donc relance cet effet avec le délai suivant. Une réplique qui tombe mal
   * est remise à quelques secondes, ce que compte `reporte` — trois cas : une
   * bulle déjà ouverte, le personnage dans la main du joueur, et **une place
   * qui n'est pas libre**. Ce dernier compte : parler l'immobilise, et il ne
   * doit pas s'immobiliser au milieu d'un paragraphe. Après trois reports il
   * parle quand même — sur un écran entièrement rempli, il n'aurait sinon
   * jamais la parole.
   */
  useEffect(() => {
    if (!reste) return undefined
    const delai = reporte > 0 ? REPORT : dits === 0 ? ATTENTE_ECRAN : ATTENTE_INACTIF
    const attente = setTimeout(() => {
      const malVenu =
        bulleRef.current || etat.current.saisi || (!libreRef.current && reporte < 3)
      if (malVenu) setReporte((n) => n + 1)
      else parler()
    }, delai)
    return () => clearTimeout(attente)
  }, [dits, parler, reporte, reste])

  // La première visite mérite une présentation — une seule fois, jamais deux.
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
    // Le but change de nature : en partie il file au bout du couloir, sinon il
    // se contente du vide le plus proche.
    etat.current.cible = null
    if (!enJeu) {
      majPosture('repos')
      return undefined
    }

    // Il ne s'explique qu'à la première partie : les suivantes, on sait déjà
    // pourquoi il s'assoit dans le coin.
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

    // `prefers-reduced-motion` ne touche plus à son pas.
    //
    // Il l'a d'abord supprimé, puis ralenti de moitié. Les deux étaient des
    // erreurs de la même famille : le seul déplacement qui lui reste n'est pas
    // décoratif, c'est ce qui l'empêche de couvrir un texte. Le supprimer le
    // figeait devant les mots ; le ralentir le faisait ramper. Ce qui reste à
    // couper pour qui demande moins d'animations, ce sont les fioritures — la
    // pastille qui bat, son balancement quand on le tient — et la feuille de
    // style s'en charge déjà.
    let image = 0
    let dernier = performance.now()

    /* --- Le relevé : où y a-t-il du texte, sur la ligne du bas ? --- */

    let carte = null // le dernier relevé complet
    let releve = null // celui qui est en cours
    let prochainReleve = 0

    /** Un élément porte-t-il du texte lui-même — pas seulement ses enfants ? */
    const porteDuTexte = (element) => {
      for (const noeud of element.childNodes) {
        if (noeud.nodeType === Node.TEXT_NODE && noeud.textContent.trim() !== '') return true
      }
      return false
    }

    /**
     * Ce qui se manipule ou se regarde vaut du texte : se planter devant un
     * bouton, une image ou une vignette les cache autant qu'une phrase — même
     * s'ils restent cliquables au travers.
     */
    const estOccupant = (element) =>
      element.matches?.(
        'a, button, input, select, textarea, label, [role="button"],' +
          ' img, svg, video, canvas, picture, figure'
      )

    /**
     * Y a-t-il quelque chose à ne pas couvrir, à ce point de l'écran ?
     *
     * On regarde la pile sous le point, en sautant tout ce qui appartient à la
     * scène — elle est transparente aux clics, mais pas au relevé, sans quoi il
     * ne trouverait que lui-même. On s'arrête à trois niveaux : au-delà on ne
     * trouve plus que les conteneurs de la page, qui portent tout et
     * n'occupent rien.
     */
    const occupeAu = (x, y) => {
      if (typeof document.elementsFromPoint !== 'function') return false
      let vus = 0
      for (const element of document.elementsFromPoint(x, y)) {
        if (scene.contains(element)) continue
        if (porteDuTexte(element) || estOccupant(element)) return true
        if (++vus >= 3) break
      }
      return false
    }

    /**
     * Le relevé avance de quelques colonnes par image plutôt que d'un bloc :
     * une quarantaine de tests d'un coup se verrait passer.
     *
     * Chaque colonne garde un **coût** plutôt qu'un oui/non : zéro quand elle
     * est libre, un quand du texte ou un bouton n'occupe qu'une hauteur, deux
     * quand il y en a partout. C'est ce qui permet de choisir le moins mauvais
     * endroit quand il n'y a plus d'endroit libre du tout.
     */
    function avancerReleve(maintenant, cadre) {
      if (!releve) {
        if (maintenant < prochainReleve || cadre.width <= 0) return
        const pas = Math.round(LARGEUR / 2)
        releve = { pas, i: 0, nombre: Math.ceil(cadre.width / pas), couts: [] }
      }
      // Trois hauteurs sur toute sa taille : la tête, le corps, les pattes.
      // À deux hauteurs, une ligne de texte passait pile entre les deux et il
      // allait s'installer dessus en croyant la place libre.
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

      // Posé sur quelque chose ? Son but n'est plus bon.
      //
      // Quand il se pose — une partie, un écran de lecture — il choisit sa
      // place une fois, et le premier relevé n'est pas encore là : il la
      // choisissait donc à l'aveugle, puis s'y tenait quoi qu'il arrive. C'est
      // ce qui le laissait planté devant une carte tant qu'on ne changeait pas
      // d'écran. Chaque nouveau relevé le remet en question.
      if (coutSous(etat.current.x) > 0) etat.current.cible = null
    }

    /** Ce qui occupe la colonne où il se tient, de 0 (libre) à 3. */
    function coutSous(x) {
      if (!carte) return 0
      return carte.couts[Math.floor((x + LARGEUR / 2) / carte.pas)] ?? 0
    }

    /**
     * Les plages continues de colonnes dont le coût ne dépasse pas `seuil`, et
     * où il tient debout. Un vide plus étroit que lui n'est pas une place :
     * c'est ce que dit le dernier filtre, une fois sa largeur retranchée.
     */
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

    /**
     * Le couloir où il a le droit de se tenir : celui où il est, ou le plus
     * proche, parmi les plages libres.
     *
     * S'il n'y a plus rien de libre — un écran entièrement rempli de mots — le
     * seuil monte d'un cran plutôt que de le laisser se planter au milieu d'un
     * paragraphe : il ira là où il dérange le moins. Il ne devient jamais
     * transparent ; c'est en marchant qu'il libère la vue.
     */
    function couloir(min, max) {
      if (!carte) return { min, max }
      for (let seuil = 0; seuil < HAUTEURS_SONDEES.length; seuil += 1) {
        const plages = plagesSous(seuil, min, max)
        if (plages.length === 0) continue
        const x = etat.current.x
        const ecart = (plage) => Math.max(plage.min - x, x - plage.max, 0)
        return plages.reduce((a, b) => (ecart(b) < ecart(a) ? b : a))
      }
      return { min, max }
    }

    /* --- Se pousser --- */

    /**
     * **Le seul mouvement qu'il s'autorise : s'écarter de ce qu'il couvre.**
     *
     * Il ne se promène pas. Il reste où il est tant que sa place est libre, et
     * dès qu'un relevé le trouve devant du texte, un bouton ou une image, il
     * marche jusqu'au vide le plus proche et s'y arrête. Une balade au hasard a
     * existé ici : elle accrochait l'œil sans rien apporter, et un personnage
     * qui traverse un paragraphe reste un personnage qui traverse un
     * paragraphe, même s'il ne s'y arrête pas.
     *
     * La seule exception est la partie : là il se met franchement sur le côté,
     * au bout du couloir, et y sort son téléphone. C'est un retrait annoncé,
     * pas un ajustement.
     */
    function sEcarter(dt, largeur, min, max) {
      const e = etat.current
      if (e.cible === null) {
        const zone = couloir(min, max)
        e.cible = enJeuRef.current
          ? // En partie : le bout du couloir, du côté où il se trouve déjà.
            e.x + LARGEUR / 2 < largeur / 2
            ? zone.min
            : zone.max
          : // Sinon : le point libre le plus proche. Il ne traverse pas l'écran
            // pour rien, il se pousse juste assez.
            Math.min(Math.max(e.x, zone.min), zone.max)
      }

      const reste = e.cible - e.x
      if (Math.abs(reste) < 1) {
        e.x = e.cible
        majPosture(enJeuRef.current ? 'telephone' : 'repos')
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
        // Le pointeur commande : rien à calculer.
      } else if (e.y > 0 || e.vy !== 0) {
        // Lâché en l'air : il retombe, et s'écrase un peu à l'arrivée.
        e.vy -= CHUTE * dt
        e.y += e.vy * dt
        if (e.y <= 0) {
          e.y = 0
          e.vy = 0
          setAtterrit(true)
          setTimeout(() => setAtterrit(false), 220)
        }
      } else if (bulleRef.current) {
        // Il parle : il ne bouge pas d'un pouce. Sa bulle est accrochée à lui
        // et la place qu'elle a mesurée à l'ouverture doit rester vraie
        // jusqu'à ce qu'elle se referme.
      } else {
        sEcarter(dt, cadre.width, min, max)
      }

      libreRef.current = coutSous(e.x) === 0
      boite.style.transform = `translate3d(${Math.round(e.x)}px, ${-Math.round(e.y)}px, 0)`
      dessiner(Math.abs(e.x - avant), dt)
    }

    /**
     * Choisir la vignette et la poser.
     *
     * Une posture qui marche avance **à la distance** : la patte change tous
     * les `pas` pixels parcourus. C'est ce qui fait qu'on le voit marcher au
     * lieu de le voir glisser — la succession des dessins et le déplacement
     * sont le même mouvement, et le sol ne file pas sous ses pieds.
     *
     * Une posture qui s'anime sans se déplacer — le téléphone — avance au
     * temps. Les autres n'ont qu'une vignette et n'avancent pas du tout.
     */
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
      // L'image suivante est demandée **avant** de travailler : si un calcul
      // lève, la boucle repart quand même à l'image d'après. Elle ne peut pas
      // mourir en silence et laisser le personnage figé pour de bon.
      image = requestAnimationFrame(boucle)
      // Un onglet qui revient au premier plan ne doit pas rattraper la seconde
      // écoulée d'un coup : le pas est plafonné.
      const dt = Math.min((maintenant - dernier) / 1000, 0.05)
      dernier = maintenant
      avancer(maintenant, dt)
    }

    image = requestAnimationFrame(boucle)
    // `etat` ne pointe pas sur un nœud : sa valeur au montage est celle qu'on
    // veut relire au démontage, pour retenir où il a fini sa balade.
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
      // Avant la première image, il n'a pas encore de place : rien à saisir.
      if (!scene || e.x === null) return
      const cadre = scene.getBoundingClientRect()

      // Un geste qui n'aboutit pas — relâché hors du personnage — ne laisse
      // pas de clic à avaler derrière lui : la remise à zéro se fait ici.
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

      // Un geste qui n'a pas bougé est un appui : le clic qui suit doit
      // parler, pas être pris pour la fin d'un déplacement.
      ignorerClic.current = bouge
      majPosture('repos')

      if (bouge) {
        // Posé quelque part : c'est là qu'il reste, même en pleine partie.
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
    // Le premier appui de sa vie éteint la pastille d'accueil : la leçon est
    // apprise, elle n'a plus rien à apprendre à personne.
    if (astuce) {
      marquerVu('compagnon-notif')
      setAstuce(false)
    }
    if (bulle) setBulle(null)
    else parler()
  }, [astuce, bulle, parler])

  /** Au clavier, les flèches remplacent le geste : on le déplace de 24 en 24. */
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
        {/* L'ancre est à son axe et la bulle y pend : la transformation qui le
            déplace les emporte toutes les deux. Sa largeur est mesurée à
            l'ouverture — la place qui reste jusqu'au bord. */}
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

        {/* Elle s'efface le temps d'une bulle : les deux se posent au même
            endroit, au-dessus de sa tête. */}
        {astuce && !bulle && (
          <span className="compagnon__notif" aria-hidden="true">
            1
          </span>
        )}

        <button
          type="button"
          aria-label={
            astuce
              ? 'Le compagnon a quelque chose à te dire — appuie pour l’écouter'
              : 'Le compagnon — appuie pour un conseil, glisse-le pour le déplacer'
          }
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
