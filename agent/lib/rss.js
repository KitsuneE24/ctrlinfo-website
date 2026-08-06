/**
 * Lecteur RSS 2.0 / Atom, sans dépendance externe.
 * Node 18+ fournit fetch() nativement.
 */

const ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  eacute: 'é', egrave: 'è', ecirc: 'ê', agrave: 'à', ccedil: 'ç',
  ugrave: 'ù', ocirc: 'ô', icirc: 'î', euro: '€', laquo: '«', raquo: '»',
  rsquo: '’', lsquo: '‘', hellip: '…', ndash: '–', mdash: '—',
}

function decodeEntities(s = '') {
  return s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, n) => ENTITIES[n.toLowerCase()] ?? m)
}

function stripHtml(s = '') {
  return decodeEntities(
    s.replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
  ).replace(/\s+/g, ' ').trim()
}

function unwrapCdata(s = '') {
  const m = s.match(/<!\[CDATA\[([\s\S]*?)\]\]>/)
  return m ? m[1] : s
}

/** Contenu du premier <tag> trouvé dans un bloc. */
function tag(block, name) {
  const re = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'i')
  const m = block.match(re)
  return m ? unwrapCdata(m[1]).trim() : ''
}

/** Valeur d'un attribut sur la première balise auto-fermante correspondante. */
function attr(block, name, attribute) {
  const re = new RegExp(`<${name}\\b[^>]*\\b${attribute}=["']([^"']+)["']`, 'i')
  const m = block.match(re)
  return m ? decodeEntities(m[1]) : ''
}

function extractImage(block) {
  return (
    attr(block, 'media:content', 'url') ||
    attr(block, 'media:thumbnail', 'url') ||
    attr(block, 'enclosure', 'url') ||
    (block.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1] ?? '')
  )
}

function extractLink(block) {
  const plain = tag(block, 'link')
  if (plain && plain.startsWith('http')) return plain
  return attr(block, 'link', 'href') || tag(block, 'guid')
}

/** Découpe le XML en blocs <item> (RSS) ou <entry> (Atom). */
function splitEntries(xml) {
  const out = []
  for (const name of ['item', 'entry']) {
    const re = new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'gi')
    let m
    while ((m = re.exec(xml)) !== null) out.push(m[1])
    if (out.length) break
  }
  return out
}

/** Récupère et parse un flux. Renvoie [] en cas d'échec (jamais d'exception). */
export async function fetchFeed(source, { timeoutMs = 15000 } = {}) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(source.url, {
      signal: ctrl.signal,
      redirect: 'follow',
      headers: {
        // Plusieurs rédactions renvoient 403 sans User-Agent.
        'User-Agent': 'AlerteNC-EducationalBot/1.0 (+jeu pédagogique de littératie médiatique)',
        Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*',
      },
    })
    if (!res.ok) {
      console.warn(`  ✗ ${source.id} — HTTP ${res.status}`)
      return []
    }
    const xml = await res.text()
    const items = splitEntries(xml).map((block) => {
      const description =
        tag(block, 'description') || tag(block, 'summary') || tag(block, 'content:encoded') || tag(block, 'content')
      return {
        sourceId: source.id,
        sourceName: source.name,
        trust: source.trust,
        scope: source.scope,
        title: stripHtml(tag(block, 'title')),
        description: stripHtml(description),
        link: extractLink(block),
        pubDate: tag(block, 'pubDate') || tag(block, 'published') || tag(block, 'updated'),
        image: extractImage(block),
        categories: [...block.matchAll(/<category(?:\s[^>]*)?>([\s\S]*?)<\/category>/gi)]
          .map((m) => stripHtml(unwrapCdata(m[1])))
          .filter(Boolean),
      }
    })
    console.log(`  ✓ ${source.id} — ${items.length} articles`)
    return items
  } catch (e) {
    console.warn(`  ✗ ${source.id} — ${e.name === 'AbortError' ? 'délai dépassé' : e.message}`)
    return []
  } finally {
    clearTimeout(timer)
  }
}

/** Filtre : on ne garde que des articles réellement exploitables par le modèle. */
export function isUsable(item) {
  return (
    item.title.length >= 20 &&
    item.description.length >= 80 &&
    item.link.startsWith('http')
  )
}

/** Déduplication par lien puis par similarité de titre. */
export function dedupe(items) {
  const seenLinks = new Set()
  const seenTitles = new Set()
  const out = []
  for (const it of items) {
    const linkKey = it.link.split('?')[0]
    const titleKey = it.title.toLowerCase().replace(/[^a-zà-ÿ0-9 ]/gi, '').split(' ').slice(0, 6).join(' ')
    if (seenLinks.has(linkKey) || seenTitles.has(titleKey)) continue
    seenLinks.add(linkKey)
    seenTitles.add(titleKey)
    out.push(it)
  }
  return out
}

/** « Il y a 3 heures », comme dans le jeu actuel. */
export function relativeDate(pubDate) {
  const d = new Date(pubDate)
  if (Number.isNaN(d.getTime())) return 'Récemment'
  const mins = Math.round((Date.now() - d.getTime()) / 60000)
  if (mins < 2) return "À l'instant"
  if (mins < 60) return `Il y a ${mins} minutes`
  const h = Math.round(mins / 60)
  if (h < 24) return `Il y a ${h} heure${h > 1 ? 's' : ''}`
  const j = Math.round(h / 24)
  if (j === 1) return 'Il y a 1 jour'
  if (j < 8) return `Il y a ${j} jours`
  return 'Il y a plus d’une semaine'
}
