import { useEffect, useRef } from 'react'

const EMOJIS = [
  '❤️','🔥','👏','😮','😂','💬','🎯','👀','💡','⚡','😱','🤔','💀','🙌','😍',
  '🫶','📢','🚨','💯','🤯','👇','🫠','😤','🗣️','📲','🤝','💥','🧠','🔔','😅',
  '❓','👁️','📣','🌀','✅','❌','🫣','😬','🤦',
]

const GRADIENTS = [
  'linear-gradient(135deg, #1800ad, #791561)',
  'linear-gradient(135deg, #791561, #1800ad)',
  'linear-gradient(135deg, #2a10c4, #9a1a7a)',
  'linear-gradient(135deg, #0d0080, #791561)',
  'linear-gradient(135deg, #1800ad, #4a0e8f)',
]

export default function StartScreen({ onStart }) {
  const collageRef = useRef(null)
  const reactionsRef = useRef(null)

  // Inject keyframes once
  useEffect(() => {
    if (document.getElementById('alert-nc-floatup')) return
    const style = document.createElement('style')
    style.id = 'alert-nc-floatup'
    style.textContent = `
      @keyframes floatUp {
        0%   { transform: translateY(0);       opacity: 1; }
        80%  { opacity: 0.7; }
        100% { transform: translateY(-540px);  opacity: 0; }
      }
      @keyframes pulseRing {
        0%   { transform: scale(1);    opacity: 0.6; }
        100% { transform: scale(1.04); opacity: 0; }
      }
    `
    document.head.appendChild(style)
  }, [])

  // Build feed collage
  useEffect(() => {
    const container = collageRef.current
    if (!container) return
    container.innerHTML = ''
    for (let i = 0; i < 20; i++) {
      const card = document.createElement('div')
      card.style.cssText = `
        background: ${GRADIENTS[i % GRADIENTS.length]};
        border-radius: 10px;
        padding: 10px;
        display: flex;
        flex-direction: column;
        gap: 6px;
        overflow: hidden;
      `

      const header = document.createElement('div')
      header.style.cssText = 'display:flex; align-items:center; gap:6px;'

      const avatar = document.createElement('div')
      avatar.style.cssText = `
        width: 22px; height: 22px; border-radius: 50%;
        background: rgba(255,250,249,0.35); flex-shrink: 0;
      `

      const nameLine = document.createElement('div')
      nameLine.style.cssText = `
        height: 7px; border-radius: 4px;
        background: rgba(255,250,249,0.4); width: ${40 + (i * 7) % 40}px;
      `

      header.appendChild(avatar)
      header.appendChild(nameLine)

      for (let l = 0; l < 3; l++) {
        const line = document.createElement('div')
        line.style.cssText = `
          height: 6px; border-radius: 3px;
          background: rgba(255,250,249,0.25);
          width: ${60 + ((i + l) * 13) % 35}%;
        `
        card.appendChild(line)
      }

      const img = document.createElement('div')
      img.style.cssText = `
        height: 48px; border-radius: 6px;
        background: rgba(255,250,249,0.15);
        margin-top: 2px;
      `

      card.prepend(header)
      card.appendChild(img)
      container.appendChild(card)
    }
  }, [])

  // Floating emoji reactions
  useEffect(() => {
    const container = reactionsRef.current
    if (!container) return

    function spawnReaction() {
      const count = 1 + Math.floor(Math.random() * 3)
      for (let i = 0; i < count; i++) {
        const span = document.createElement('span')
        const duration = 4.5 + Math.random() * 3.5
        const left = 4 + Math.random() * 90
        const size = 16 + Math.floor(Math.random() * 13)
        const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)]

        span.textContent = emoji
        span.style.cssText = `
          position: absolute;
          bottom: 0;
          left: ${left}%;
          font-size: ${size}px;
          animation: floatUp ${duration}s ease-out forwards;
          pointer-events: none;
          user-select: none;
          line-height: 1;
        `
        container.appendChild(span)
        span.addEventListener('animationend', () => span.remove())
      }
    }

    spawnReaction()
    const id = setInterval(spawnReaction, 900)
    return () => clearInterval(id)
  }, [])

  return (
    <div style={{
      minHeight: '100vh',
      overflow: 'hidden',
      position: 'relative',
      background: '#1800ad',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>

      {/* Layer 1 — Feed collage */}
      <div
        ref={collageRef}
        style={{
          position: 'absolute',
          inset: 0,
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gridTemplateRows: 'repeat(4, 1fr)',
          gap: '6px',
          padding: '6px',
          opacity: 0.22,
          filter: 'blur(2px) saturate(0.7)',
          transform: 'scale(1.06)',
        }}
      />

      {/* Layer 2 — Gradient overlay */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'linear-gradient(to bottom, rgba(24,0,173,0.55) 0%, rgba(24,0,173,0.70) 40%, rgba(121,21,97,0.80) 100%)',
      }} />

      {/* Layer 3 — Floating emoji reactions */}
      <div
        ref={reactionsRef}
        style={{
          position: 'absolute',
          inset: 0,
          overflow: 'hidden',
          pointerEvents: 'none',
          zIndex: 5,
        }}
      />

      {/* Layer 4 — Content */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        maxWidth: 480,
        width: '100%',
        padding: '2rem 2.5rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>

        {/* Title */}
        <h1 style={{
          fontSize: 52,
          fontWeight: 900,
          letterSpacing: '-1px',
          margin: '0 0 0.5rem',
          lineHeight: 1.05,
        }}>
          <span style={{ color: '#fffaf9' }}>Alert</span>
          <span style={{ color: '#ff6ab5' }}> NC</span>
        </h1>

        {/* Tagline */}
        <p style={{
          fontSize: 15,
          color: 'rgba(255,250,249,0.75)',
          marginBottom: '1.8rem',
          lineHeight: 1.5,
        }}>
          Sauras-tu repérer le vrai du faux dans ton fil d'actu ?
        </p>

        {/* Stat pill */}
        <div style={{
          background: 'rgba(255,250,249,0.12)',
          border: '1px solid rgba(255,250,249,0.2)',
          borderRadius: 10,
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: '1.6rem',
          textAlign: 'left',
          width: '100%',
        }}>
          <span style={{ fontSize: 20, flexShrink: 0 }}>⚡</span>
          <p style={{ margin: 0, fontSize: 13, color: 'rgba(255,250,249,0.75)', lineHeight: 1.4 }}>
            <strong style={{ color: '#fffaf9' }}>60 %</strong>
            {' '}des jeunes ont déjà partagé une fake news sans le savoir
          </p>
        </div>

        {/* Rules list */}
        <ol style={{
          listStyle: 'none',
          margin: '0 0 2rem',
          padding: 0,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}>
          {[
            <>Lis chaque post comme sur ton réseau préféré</>,
            <>Choisis : <strong style={{ color: '#fffaf9' }}>J'aime</strong>, <strong style={{ color: '#fffaf9' }}>Partager</strong> ou <strong style={{ color: '#fffaf9' }}>Signaler</strong></>,
            <>Gagne des abonnés en faisant les bons choix</>,
          ].map((text, i) => (
            <li key={i} style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              textAlign: 'left',
            }}>
              <span style={{
                width: 22,
                height: 22,
                borderRadius: '50%',
                background: 'rgba(255,250,249,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 700,
                color: '#fffaf9',
                flexShrink: 0,
                marginTop: 1,
              }}>
                {i + 1}
              </span>
              <span style={{ fontSize: 13.5, color: 'rgba(255,250,249,0.8)', lineHeight: 1.5 }}>
                {text}
              </span>
            </li>
          ))}
        </ol>

        {/* Start button */}
        <div style={{ position: 'relative', width: '100%' }}>
          {/* Pulsing ring */}
          <div style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 10,
            background: 'rgba(255,250,249,0.35)',
            animation: 'pulseRing 2s ease-out infinite',
            pointerEvents: 'none',
          }} />
          <button
            onClick={onStart}
            style={{
              position: 'relative',
              width: '100%',
              padding: '16px',
              borderRadius: 10,
              background: '#fffaf9',
              color: '#1800ad',
              fontWeight: 700,
              fontSize: 16,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              transition: 'transform 0.12s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
            onMouseUp={e => e.currentTarget.style.transform = 'scale(1.02)'}
          >
            <span style={{ fontSize: 14 }}>▶</span>
            Commencer à jouer
          </button>
        </div>

      </div>
    </div>
  )
}
