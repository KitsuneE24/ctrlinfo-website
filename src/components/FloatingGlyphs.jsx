import { useEffect, useRef } from 'react'

// Decorative, non-interactive social-media reaction glyphs that drift slowly
// upward at low opacity. Subtle "atmosphere" only — respects reduced motion.
const GLYPHS = ['❤️', '💬', '🚨']

export default function FloatingGlyphs() {
  const ref = useRef(null)

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return

    if (!document.getElementById('alert-nc-glyph-floatup')) {
      const style = document.createElement('style')
      style.id = 'alert-nc-glyph-floatup'
      style.textContent = `
        @keyframes glyphFloatUp {
          0%   { transform: translateY(0);      opacity: 0; }
          15%  { opacity: 0.16; }
          85%  { opacity: 0.16; }
          100% { transform: translateY(-60vh);  opacity: 0; }
        }
      `
      document.head.appendChild(style)
    }

    const container = ref.current
    if (!container) return

    function spawn() {
      const span = document.createElement('span')
      const duration = 10 + Math.random() * 6
      const left = 6 + Math.random() * 88
      const size = 18 + Math.floor(Math.random() * 12)
      span.textContent = GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
      span.style.cssText = `
        position: absolute;
        bottom: -40px;
        left: ${left}%;
        font-size: ${size}px;
        animation: glyphFloatUp ${duration}s linear forwards;
        pointer-events: none;
        user-select: none;
        line-height: 1;
        filter: grayscale(0.1);
      `
      container.appendChild(span)
      span.addEventListener('animationend', () => span.remove())
    }

    // Sparse: one glyph every few seconds, never crowded.
    spawn()
    const id = setInterval(spawn, 2600)
    return () => clearInterval(id)
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ zIndex: 1 }}
    />
  )
}
