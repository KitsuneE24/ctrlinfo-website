/** L'adresse si elle est en http(s), sinon null (écarte javascript:, data:…). */
export function lienWeb(url) {
  try {
    return typeof url === 'string' && ['http:', 'https:'].includes(new URL(url).protocol) ? url : null
  } catch {
    return null
  }
}
