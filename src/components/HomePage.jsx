import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { BadgeCheck } from 'lucide-react'
import { brand } from '../styles/colors'
import ProfileHeader from './ProfileHeader'
import Sidebar from './Sidebar'
import Gallery from './Gallery'
import FloatingGlyphs from './FloatingGlyphs'
import Modal from './Modal'
import GameModal from './GameModal'

export default function HomePage() {
  const [activeModal, setActiveModal] = useState(null) // null|'about'|'video'|'how'|'game'

  useEffect(() => {
    document.body.style.overflow = activeModal ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [activeModal])

  const close = () => setActiveModal(null)
  const openGame = () => setActiveModal('game')

  return (
    <div
      className="relative flex min-h-[100dvh] w-full flex-col items-center justify-center overflow-hidden text-[#262626]"
      style={{
        fontFamily: 'system-ui, -apple-system, sans-serif',
        background: `linear-gradient(135deg, ${brand.blue}, ${brand.magenta})`,
      }}
    >
      {/* Subtle social-media atmosphere */}
      <FloatingGlyphs />

      {/* Centered desktop-format window */}
      <div className="relative z-10 flex w-full max-w-[1040px] flex-col items-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 24 }}
          className="w-full overflow-hidden rounded-2xl border border-black/5 bg-white shadow-[0_24px_64px_rgba(0,0,0,0.35)]"
        >
          {/* Window title bar */}
          <div className="flex items-center gap-2 bg-[#363636] px-5 py-3 text-white">
            <span className="text-sm font-medium">alert_nc</span>
            <BadgeCheck size={16} className="text-[#3897f0]" fill="#3897f0" stroke="#fff" />
          </div>

          {/* Window body: Instagram left rail + profile */}
          <div className="flex max-h-[78vh] overflow-hidden">
            <Sidebar />
            <div className="min-w-0 flex-1 overflow-y-auto no-scrollbar">
              <ProfileHeader onPlay={openGame} onOpen={setActiveModal} />
              <Gallery />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {activeModal === 'about' && (
          <Modal key="about" title="À propos" onClose={close}>
            <p style={{ marginTop: 0 }}>
              <strong>Alert NC</strong> est un mini-jeu pour apprendre à repérer les fausses
              informations dans ton fil d'actualité.
            </p>
            <p style={{ marginBottom: 0 }}>
              Tu fais défiler des publications comme sur tes réseaux préférés et tu décides, pour
              chacune, s'il faut l'aimer, la partager ou la signaler. À toi de démêler le vrai du
              faux le plus vite possible !
            </p>
          </Modal>
        )}

        {activeModal === 'video' && (
          <Modal key="video" title="Vidéo" onClose={close}>
            <div
              style={{
                position: 'relative',
                aspectRatio: '16 / 9',
                borderRadius: 12,
                background: `linear-gradient(135deg, ${brand.blue}, ${brand.magenta})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: 'rgba(255,250,249,0.92)',
                  color: brand.blue,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                }}
              >
                ▶
              </span>
            </div>
            <p style={{ marginBottom: 0, fontSize: 13, opacity: 0.7 }}>
            </p>
          </Modal>
        )}

        {activeModal === 'how' && (
          <Modal key="how" title="Comment jouer" onClose={close}>
            <ol style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <li>Lis chaque post comme sur ton réseau préféré.</li>
              <li>
                Choisis : <strong>J'aime</strong>, <strong>Partager</strong> ou{' '}
                <strong>Signaler</strong>.
              </li>
              <li>Gagne des abonnés en faisant les bons choix… mais attention au chrono !</li>
            </ol>
          </Modal>
        )}

        {activeModal === 'game' && <GameModal key="game" onClose={close} />}
      </AnimatePresence>
    </div>
  )
}
