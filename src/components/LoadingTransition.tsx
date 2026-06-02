import { useEffect, useRef } from 'react'

interface Props {
  onMidpoint: () => void
  onComplete: () => void
  circleColor?: string
  textColor?: string
}

function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

export default function LoadingTransition({ onMidpoint, onComplete, circleColor = '#000000', textColor = '#ffffff' }: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const textRef = useRef<HTMLParagraphElement>(null)
  const onMidpointRef = useRef(onMidpoint)
  const onCompleteRef = useRef(onComplete)

  useEffect(() => { onMidpointRef.current = onMidpoint }, [onMidpoint])
  useEffect(() => { onCompleteRef.current = onComplete }, [onComplete])

  useEffect(() => {
    const canvas = canvasRef.current
    const wrapper = wrapperRef.current
    const text = textRef.current
    if (!canvas || !wrapper || !text) return

    const W = window.innerWidth
    const H = window.innerHeight
    canvas.width = W
    canvas.height = H

    const ctx = canvas.getContext('2d')!

    // Cercles positionnés sur les bords — delays et speeds variés pour un effet organique
    const circles = [
      // Côté gauche
      { x: 0,  y: H * 0.15, delay: 0.00, speed: 1.00 },
      { x: 0,  y: H * 0.50, delay: 0.04, speed: 1.12 },
      { x: 0,  y: H * 0.85, delay: 0.08, speed: 0.95 },
      // Côté droit
      { x: W,  y: H * 0.20, delay: 0.06, speed: 1.05 },
      { x: W,  y: H * 0.55, delay: 0.02, speed: 1.00 },
      { x: W,  y: H * 0.80, delay: 0.10, speed: 1.08 },
      // Haut
      { x: W * 0.28, y: 0, delay: 0.11, speed: 1.15 },
      { x: W * 0.72, y: 0, delay: 0.07, speed: 1.02 },
      // Bas
      { x: W * 0.35, y: H, delay: 0.14, speed: 1.10 },
      { x: W * 0.65, y: H, delay: 0.17, speed: 0.97 },
    ]

    const maxRadius = Math.sqrt(W * W + H * H)

    const FILL = 2300  // ms — croissance des cercles
    const HOLD = 700   // ms — pause sur le noir
    const FADE = 1000  // ms — fondu pour révéler Memory3D

    let startTime: number | null = null
    let midpointFired = false
    let textShown = false
    let frame: number

    const tick = (ts: number) => {
      if (!startTime) startTime = ts
      const elapsed = ts - startTime

      if (elapsed < FILL) {
        const p = elapsed / FILL

        ctx.clearRect(0, 0, W, H)
        ctx.fillStyle = circleColor

        circles.forEach((c) => {
          const localP = Math.max(0, (p - c.delay) / (1 - c.delay))
          const r = easeOut(Math.min(localP * c.speed, 1)) * maxRadius
          ctx.beginPath()
          ctx.arc(c.x, c.y, r, 0, Math.PI * 2)
          ctx.fill()
        })

        // Texte apparaît quand l'écran est presque couvert
        if (p > 0.78 && !textShown) {
          textShown = true
          text.style.transition = 'opacity 0.45s ease'
          text.style.opacity = '1'
        }

        frame = requestAnimationFrame(tick)
      } else if (elapsed < FILL + HOLD) {
        // Écran totalement couvert
        ctx.fillStyle = circleColor
        ctx.fillRect(0, 0, W, H)

        if (!textShown) {
          textShown = true
          text.style.opacity = '1'
        }

        if (!midpointFired) {
          midpointFired = true
          onMidpointRef.current()
        }

        frame = requestAnimationFrame(tick)
      } else {
        if (!midpointFired) {
          midpointFired = true
          onMidpointRef.current()
        }

        const fadeP = Math.min((elapsed - FILL - HOLD) / FADE, 1)
        wrapper.style.opacity = String(1 - easeInOut(fadeP))

        if (fadeP >= 1) {
          onCompleteRef.current()
          return
        }

        frame = requestAnimationFrame(tick)
      }
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  return (
    <div
      ref={wrapperRef}
      style={{ position: 'fixed', inset: 0, zIndex: 9999, pointerEvents: 'none' }}
    >
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0 }} />
      <p
        ref={textRef}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: textColor,
          fontSize: '17px',
          fontFamily: 'var(--font-family)',
          letterSpacing: '0.3em',
          fontWeight: 300,
          opacity: 0,
          margin: 0,
          whiteSpace: 'nowrap',
          zIndex: 1,
        }}
      >
        Mimnesko
      </p>
    </div>
  )
}
