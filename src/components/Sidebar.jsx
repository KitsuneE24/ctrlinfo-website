import {
  Home,
  Search,
  Compass,
  Film,
  MessageCircle,
  Heart,
  PlusSquare,
  Menu,
} from 'lucide-react'

// Alert NC brand logo (replaces the former Instagram glyph).
function BrandLogo({ size = 30 }) {
  return (
    <img
      src="/Logo_alerte_NC-02.png"
      alt="Alert NC"
      width={size}
      height={size}
      style={{ objectFit: 'contain' }}
      aria-hidden="true"
    />
  )
}

// Vertical icon rail shown on the left of the desktop window.
// Decorative only — non-interactive and faded.
const RAIL = [
  { Icon: Home, label: 'Accueil' },
  { Icon: Film, label: 'Reels' },
  { Icon: MessageCircle, label: 'Messages', badge: 1 },
  { Icon: Search, label: 'Recherche' },
  { Icon: Compass, label: 'Explorer' },
  { Icon: Heart, label: "J'aime", dot: true },
  { Icon: PlusSquare, label: 'Créer' },
  { logo: true, label: 'Profil' },
]

export default function Sidebar() {
  return (
    <aside
      aria-hidden="true"
      className="pointer-events-none hidden shrink-0 cursor-default select-none flex-col justify-between gap-2 overflow-y-auto border-r border-[#dbdbdb] bg-white px-3 py-3 text-[#262626] opacity-50 no-scrollbar md:flex md:w-[72px] lg:w-[220px]"
    >
      <div className="flex flex-col gap-0.5">
        {RAIL.map(({ Icon, label, badge, dot, logo }) => (
          <div
            key={label}
            className="relative flex items-center gap-4 rounded-lg px-2 py-3 lg:px-3"
          >
            <span className="relative">
              {logo ? (
                <BrandLogo size={26} />
              ) : (
                <Icon size={26} strokeWidth={1.8} />
              )}
              {badge && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {badge}
                </span>
              )}
              {dot && (
                <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-red-500" />
              )}
            </span>
            <span className="hidden text-[15px] lg:inline">{label}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 rounded-lg px-2 py-3 lg:px-3">
        <Menu size={26} strokeWidth={1.8} />
        <span className="hidden text-[15px] lg:inline">Plus</span>
      </div>
    </aside>
  )
}
