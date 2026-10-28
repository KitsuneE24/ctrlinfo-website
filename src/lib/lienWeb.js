export function lienWeb(url) {
  try {
    return typeof url === 'string' && ['http:', 'https:'].includes(new URL(url).protocol) ? url : null
  } catch {
    return null
  }
}
