const PREFIXE = 'ctrl-info:vu:'

function stockage() {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export function dejaVu(cle) {
  try {
    return stockage()?.getItem(PREFIXE + cle) === '1'
  } catch {
    return false
  }
}

export function marquerVu(cle) {
  try {
    stockage()?.setItem(PREFIXE + cle, '1')
  } catch {
    // Stockage indisponible.
  }
}

const today = () => new Date().toISOString().slice(0, 10)

export function seenToday(key) {
  try {
    return stockage()?.getItem(PREFIXE + key) === today()
  } catch {
    return false
  }
}

export function markSeenToday(key) {
  try {
    stockage()?.setItem(PREFIXE + key, today())
  } catch {
    // Stockage indisponible.
  }
}
