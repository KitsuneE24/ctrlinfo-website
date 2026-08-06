/**
 * Client LM Studio (API compatible OpenAI).
 *
 * Prérequis dans LM Studio :
 *   1. Onglet « Developer » (icône </>)  →  bouton « Start Server »
 *   2. Charger un modèle instruct (voir agent/README.md pour les recommandations)
 *   3. Le serveur écoute par défaut sur http://localhost:1234
 *
 * Surcharge possible : LMSTUDIO_URL / LMSTUDIO_MODEL dans l'environnement.
 */

const BASE_URL = (process.env.LMSTUDIO_URL || 'http://localhost:1234').replace(/\/$/, '')
const MODEL = process.env.LMSTUDIO_MODEL || null // null → premier modèle chargé

let cachedModel = null
let structuredOutputSupported = true

/** Vérifie que le serveur répond et récupère le modèle chargé. */
export async function checkServer() {
  try {
    const res = await fetch(`${BASE_URL}/v1/models`, { signal: AbortSignal.timeout(5000) })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const { data } = await res.json()
    if (!data?.length) throw new Error('aucun modèle chargé dans LM Studio')
    cachedModel = MODEL || data[0].id
    return { ok: true, model: cachedModel, available: data.map((m) => m.id) }
  } catch (e) {
    return {
      ok: false,
      error:
        e.name === 'TimeoutError' || e.message.includes('fetch')
          ? `LM Studio est injoignable sur ${BASE_URL}.\n` +
            `      → Ouvre LM Studio, onglet Developer (</>), clique « Start Server »,\n` +
            `        et vérifie qu'un modèle est chargé.`
          : e.message,
    }
  }
}

/** Retire les blocs de raisonnement des modèles type DeepSeek-R1 / Qwen-thinking. */
function stripReasoning(text) {
  return text
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/<\|?channel\|?>[\s\S]*?<\|?message\|?>/gi, '')
    .trim()
}

/** Extrait le premier objet JSON équilibré d'une réponse bavarde. */
function extractJson(text) {
  const clean = stripReasoning(text)
  const fenced = clean.match(/```(?:json)?\s*([\s\S]*?)```/)
  const body = fenced ? fenced[1] : clean

  const start = body.indexOf('{')
  if (start === -1) throw new Error('aucun JSON trouvé dans la réponse')

  let depth = 0
  let inStr = false
  let esc = false
  for (let i = start; i < body.length; i++) {
    const c = body[i]
    if (esc) { esc = false; continue }
    if (c === '\\') { esc = true; continue }
    if (c === '"') { inStr = !inStr; continue }
    if (inStr) continue
    if (c === '{') depth++
    else if (c === '}' && --depth === 0) {
      return JSON.parse(body.slice(start, i + 1))
    }
  }
  throw new Error('JSON incomplet (le modèle a probablement été coupé — augmente maxTokens)')
}

/**
 * Appelle le modèle et renvoie un objet JSON conforme au schéma.
 * Réessaie automatiquement, en désactivant la sortie structurée si le modèle
 * ne la gère pas.
 */
export async function generateJson({
  system,
  user,
  schema,
  schemaName = 'response',
  temperature = 0.7,
  maxTokens = 1400,
  retries = 3,
}) {
  if (!cachedModel) {
    const chk = await checkServer()
    if (!chk.ok) throw new Error(chk.error)
  }

  let lastErr
  for (let attempt = 1; attempt <= retries; attempt++) {
    const body = {
      model: cachedModel,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      // On réduit un peu la température à chaque échec : plus déterministe,
      // donc plus susceptible de respecter le format.
      temperature: Math.max(0.1, temperature - (attempt - 1) * 0.25),
      max_tokens: maxTokens,
      stream: false,
    }

    if (schema && structuredOutputSupported) {
      body.response_format = {
        type: 'json_schema',
        json_schema: { name: schemaName, strict: true, schema },
      }
    }

    try {
      const res = await fetch(`${BASE_URL}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(180000), // un modèle local sur CPU est lent
      })

      if (!res.ok) {
        const detail = await res.text()
        // Modèle sans support du JSON structuré → on repasse en mode texte.
        if (res.status === 400 && body.response_format) {
          structuredOutputSupported = false
          throw new Error('sortie structurée non supportée — repli en mode texte')
        }
        throw new Error(`HTTP ${res.status} — ${detail.slice(0, 200)}`)
      }

      const json = await res.json()
      const content = json.choices?.[0]?.message?.content
      if (!content) throw new Error('réponse vide du modèle')
      return extractJson(content)
    } catch (e) {
      lastErr = e
      if (attempt < retries) {
        console.log(`      … tentative ${attempt}/${retries} échouée (${e.message}), on réessaie`)
        await new Promise((r) => setTimeout(r, 600 * attempt))
      }
    }
  }
  throw new Error(`échec après ${retries} tentatives : ${lastErr.message}`)
}

export const getModelName = () => cachedModel
