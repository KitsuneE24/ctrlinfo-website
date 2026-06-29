import { LayoutGrid, Film, Contact } from 'lucide-react'
import { brand } from '../styles/colors'

// Decorative Instagram-style gallery — the start of a post grid below the
// profile, to make it read as a real user profile. Non-interactive and faded,
// like the sidebar.
const TABS = [
  { Icon: LayoutGrid, active: true },
  { Icon: Film, active: false },
  { Icon: Contact, active: false },
]

const TILES = [
  `linear-gradient(135deg, ${brand.blue}, ${brand.magenta})`,
  `linear-gradient(135deg, ${brand.magenta}, ${brand.magentaLight})`,
  `linear-gradient(135deg, ${brand.magentaLight}, ${brand.blue})`,
  `linear-gradient(135deg, ${brand.blue}, ${brand.magentaLight})`,
  `linear-gradient(135deg, ${brand.magenta}, ${brand.blue})`,
  `linear-gradient(135deg, ${brand.magentaLight}, ${brand.magenta})`,
]

export default function Gallery() {
  return (
    <div aria-hidden="true" className="pointer-events-none mt-6 select-none opacity-50">
      {/* Tabs */}
      <div className="flex items-center justify-center gap-24 border-t border-[#dbdbdb]">
        {TABS.map(({ Icon, active }, i) => (
          <div
            key={i}
            className={`-mt-px flex items-center py-3 ${
              active ? 'border-t border-[#262626] text-[#262626]' : 'text-[#8e8e8e]'
            }`}
          >
            <Icon size={20} strokeWidth={active ? 2 : 1.8} />
          </div>
        ))}
      </div>

      {/* Post grid */}
      <div className="grid grid-cols-3 gap-2 pt-1">
        {TILES.map((bg, i) => (
          <div key={i} className="aspect-square rounded-sm" style={{ background: bg }} />
        ))}
      </div>
    </div>
  )
}
