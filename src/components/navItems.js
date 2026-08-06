import { House, SquarePlay, Send, Search, ScanSearch } from 'lucide-react'

/**
 * Source unique des onglets, partagée par la barre du bas (mobile) et le rail
 * latéral (desktop) : les deux navigations ne peuvent pas diverger.
 */
export const NAV_ITEMS = [
  { id: 'home',      Icon: House,      label: 'Accueil' },
  { id: 'game',      Icon: SquarePlay, label: 'Jouer' },
  { id: 'chat',      Icon: Send,       label: 'Conversations' },
  { id: 'resources', Icon: Search,     label: 'Ressources' },
  { id: 'detect',    Icon: ScanSearch, label: 'Repère les indices' },
]
