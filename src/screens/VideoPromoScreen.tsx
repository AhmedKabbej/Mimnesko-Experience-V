import { useEffect, useRef, useState } from 'react'
import BackButton from '../components/BackButton'
import './VideoPromoScreen.css'

// ── Séquences d'images (frames) jouées au scroll, enchaînées en continu ──
const pad5 = (n: number) => String(n).padStart(5, '0')

interface Sequence {
  dir: string
  prefix: string
  count: number
}

const SEQUENCES: Sequence[] = [
  { dir: 'video01', prefix: 'video01_', count: 189 },
  { dir: 'video02', prefix: 'video02_', count: 120 },
  { dir: 'video03', prefix: 'video03_', count: 320 },
]

// Noms 100% ASCII → pas de souci d'encodage/accents (Vite, Vercel, GitHub).
const FRAMES: string[] = SEQUENCES.flatMap((s) =>
  Array.from({ length: s.count }, (_, i) =>
    `/memories/videoPromo/${s.dir}/${s.prefix}${pad5(i)}.webp`
  )
)
const TOTAL = FRAMES.length

// Hauteur de scroll allouée par frame (px). Plus haut = défilé plus lent/fluide.
const SCROLL_PER_FRAME = 14
// On débloque le scroll dès ce tampon d'avance chargé ; le reste continue en fond.
const START_BUFFER = Math.min(80, TOTAL)

interface VideoPromoScreenProps {
  onBack: () => void
}

export default function VideoPromoScreen({ onBack }: VideoPromoScreenProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  // On garde des <img> : c'est le NAVIGATEUR qui gère le décodage et la mémoire
  // (il évince les frames hors-vue). Pas de 1,3 Go de bitmaps retenus → plus de plantage.
  const imagesRef = useRef<(HTMLImageElement | null)[]>(new Array(TOTAL).fill(null))
  const lastDrawn = useRef(-1)
  const rafRef = useRef<number | null>(null)

  const [loadedCount, setLoadedCount] = useState(0)
  const [ready, setReady] = useState(false)

  // ── Préchargement GLOBAL : toutes les frames téléchargées AVANT de débloquer ──
  useEffect(() => {
    let cancelled = false
    let next = 0
    const CONCURRENCY = 8
    let done = 0

    // On télécharge chaque frame, avec retries : on ne compte "fait" qu'une fois
    // réellement chargée → tout le dossier est prêt avant de débloquer.
    const loadOne = (index: number) =>
      new Promise<void>((resolve) => {
        let attempt = 0
        const tryLoad = () => {
          if (cancelled) return resolve()
          const img = new Image()
          img.decoding = 'async'
          img.onload = () => {
            if (cancelled) return resolve()
            imagesRef.current[index] = img
            done += 1
            setLoadedCount(done)
            resolve()
          }
          img.onerror = () => {
            attempt += 1
            if (attempt < 4 && !cancelled) {
              setTimeout(tryLoad, 150 * attempt)
            } else {
              // Échec définitif : on compte quand même pour ne pas bloquer.
              if (!cancelled) { done += 1; setLoadedCount(done) }
              resolve()
            }
          }
          img.src = FRAMES[index]
        }
        tryLoad()
      })

    const worker = async () => {
      while (!cancelled && next < TOTAL) {
        const i = next++
        await loadOne(i)
      }
    }

    // On lance tous les workers : le chargement complet continue en arrière-plan.
    Promise.all(Array.from({ length: CONCURRENCY }, () => worker()))

    return () => { cancelled = true }
  }, [])

  // Dès que le tampon d'avance est prêt, on débloque le scroll (le reste streame).
  useEffect(() => {
    if (!ready && loadedCount >= START_BUFFER) setReady(true)
  }, [loadedCount, ready])

  // ── Dessin "cover" : l'image remplit tout l'écran (recadrage si besoin) ──
  const drawFrame = (index: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    // Frame demandée, sinon la plus proche déjà chargée → le scroll ne fige jamais.
    let img = imagesRef.current[index]
    if (!img) {
      for (let d = 1; d < TOTAL; d++) {
        const lo = index - d >= 0 ? imagesRef.current[index - d] : null
        if (lo) { img = lo; break }
        const hi = index + d < TOTAL ? imagesRef.current[index + d] : null
        if (hi) { img = hi; break }
      }
    }
    if (!img || !img.complete || img.naturalWidth === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const cw = canvas.width
    const ch = canvas.height
    // cover : l'image couvre tout le canvas (on garde le ratio, on rogne le surplus).
    const scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight)
    const dw = img.naturalWidth * scale
    const dh = img.naturalHeight * scale
    const dx = (cw - dw) / 2
    const dy = (ch - dh) / 2
    ctx.drawImage(img, dx, dy, dw, dh)
  }

  // ── Canvas plein écran (résolution = devicePixelRatio) ──
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.floor(window.innerWidth * dpr)
      canvas.height = Math.floor(window.innerHeight * dpr)
      drawFrame(Math.max(0, lastDrawn.current))
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Scroll → index de frame ──
  useEffect(() => {
    const scroller = scrollRef.current
    if (!scroller) return

    const onScroll = () => {
      if (rafRef.current != null) return
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null
        const max = scroller.scrollHeight - scroller.clientHeight
        const p = max > 0 ? scroller.scrollTop / max : 0
        const index = Math.min(TOTAL - 1, Math.max(0, Math.round(p * (TOTAL - 1))))
        if (index !== lastDrawn.current) {
          lastDrawn.current = index
          drawFrame(index)
        }
      })
    }

    scroller.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      scroller.removeEventListener('scroll', onScroll)
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Tout est chargé → on affiche la première frame.
  useEffect(() => {
    if (ready && lastDrawn.current < 0) {
      lastDrawn.current = 0
      drawFrame(0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready])

  // Pendant le préchargement, la barre suit le tampon de démarrage (pas le total).
  const pct = Math.min(100, Math.round((loadedCount / START_BUFFER) * 100))

  return (
    <div className="promo-root">
      <canvas ref={canvasRef} className="promo-canvas" />

      <div
        ref={scrollRef}
        className="promo-scroll"
        style={{
          overflowY: ready ? 'scroll' : 'hidden',
          pointerEvents: ready ? 'auto' : 'none',
        }}
      >
        <div className="promo-spacer" style={{ height: `${TOTAL * SCROLL_PER_FRAME}px` }} />
      </div>

      {!ready && (
        <div className="promo-loader">
          <p className="promo-loader-title">Préparation de la séquence</p>
          <div className="promo-loader-bar">
            <div className="promo-loader-fill" style={{ width: `${pct}%` }} />
          </div>
          <p className="promo-loader-pct">{pct}%</p>
        </div>
      )}

      {ready && lastDrawn.current <= 0 && (
        <div className="promo-hint">Faites défiler ↓</div>
      )}

      <BackButton onClick={onBack} />
    </div>
  )
}
