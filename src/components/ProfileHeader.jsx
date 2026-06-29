import { motion } from 'framer-motion'
import { BadgeCheck, Play } from 'lucide-react'
import { brand } from '../styles/colors'

const STATS = [
  { value: '374', label: 'publications' },
  { value: '1,2k', label: 'abonnés' },
  { value: '∞', label: 'posts à démêler' },
]

const SECONDARY = [
  { key: 'about', label: 'À propos' },
  { key: 'video', label: 'Vidéo' },
  { key: 'how', label: 'Comment jouer' },
]

export default function ProfileHeader({ onPlay, onOpen }) {
  return (
    <section className="flex shrink-0 flex-col gap-4 px-4 py-5 md:flex-row md:items-start md:gap-12 md:px-10">
      {/* Avatar */}
      <div className="flex justify-center md:block">
        <div
          className="flex h-[120px] w-[120px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-white md:h-[150px] md:w-[150px]"
          style={{
            border: '3px solid #fff',
            boxShadow: '0 0 0 1px #dbdbdb',
          }}
        >
          <img
            src="/Logo_alerte_NC-02.png"
            alt="Alert NC"
            className="h-full w-full object-contain p-3"
          />
        </div>
      </div>

      {/* Info column */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 md:justify-start">
          <h1 className="text-xl font-normal">alert_nc</h1>
          <BadgeCheck size={20} className="text-[#3897f0]" fill="#3897f0" stroke="#fff" />
        </div>

        {/* Stats */}
        <ul className="my-5 flex justify-center gap-8 text-[15px] md:justify-start">
          {STATS.map((s) => (
            <li key={s.label}>
              <b>{s.value}</b> {s.label}
            </li>
          ))}
        </ul>

        {/* Bio */}
        <div className="text-center text-[15px] leading-snug md:text-left">
          <p className="font-semibold">Alert NC</p>
          <p>
            Le jeu anti fake&nbsp;news. Aime, partage ou signale et démêle le vrai du faux
            dans ton fil d'actu.
          </p>
          <p className="mt-1 font-semibold" style={{ color: '#00376b' }}>
            #StopFakeNews
          </p>
        </div>

        {/* Primary action */}
        <motion.button
          onClick={onPlay}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.99 }}
          transition={{ type: 'spring', stiffness: 400, damping: 18 }}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg py-3 text-white transition-colors md:w-auto md:px-16"
          style={{
            fontFamily: "'Archivo Black', sans-serif",
            fontSize: 16,
            background: brand.blue,
            boxShadow: '0 8px 22px rgba(24,0,173,0.30)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#2a10c4')}
          onMouseLeave={(e) => (e.currentTarget.style.background = brand.blue)}
        >
          <Play size={16} fill="#fff" /> Jouer
        </motion.button>

        {/* Secondary actions — separate row underneath */}
        <div className="mt-3 grid grid-cols-3 gap-2 md:max-w-md">
          {SECONDARY.map((b) => (
            <motion.button
              key={b.key}
              onClick={() => onOpen(b.key)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              className="rounded-lg px-2 py-2.5 text-sm font-semibold text-white transition-colors"
              style={{
                background: brand.magenta,
                boxShadow: '0 6px 16px rgba(121,21,97,0.30)',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = brand.magentaLight)}
              onMouseLeave={(e) => (e.currentTarget.style.background = brand.magenta)}
            >
              {b.label}
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  )
}
