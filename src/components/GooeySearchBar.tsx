import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import './GooeySearchBar.css'

const BAR_W = 340      // largeur de la barre ouverte
const CIRCLE = 58      // diamètre de la pastille fermée

const FILTERS = ['Il y a 3 mois', 'Il y a 1 an', 'Il y a 5 ans', 'Il y a 10 ans']

interface GooeySearchBarProps {
  onSelectFilter?: (label: string) => void
  onStart?: (query: string) => void
  onOpenChange?: (open: boolean) => void
}

export default function GooeySearchBar({ onSelectFilter, onStart, onOpenChange }: GooeySearchBarProps) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')
  const didMount = useRef(false)
  const startRef = useRef<HTMLButtonElement>(null)

  const showStart = open && value.trim().length > 0

  // Notifie le parent (pour basculer le fond plasma).
  useEffect(() => { onOpenChange?.(open) }, [open, onOpenChange])

  const rootRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const fillRef = useRef<HTMLDivElement>(null)
  const iconRef = useRef<HTMLSpanElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const datesWrapRef = useRef<HTMLDivElement>(null)
  const datesRef = useRef<HTMLDivElement>(null)

  // Animation ouverture / fermeture.
  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true
      return
    }

    const chips = datesRef.current ? Array.from(datesRef.current.children) : []
    const tl = gsap.timeline()

    if (open) {
      const h = datesRef.current?.offsetHeight ?? 0
      tl.to(barRef.current, { width: BAR_W, duration: 0.5, ease: 'back.out(1.5)' }, 0)
        .to(fillRef.current, { opacity: 0, duration: 0.3, ease: 'power2.out' }, 0)
        .to(iconRef.current, { color: '#FF6A00', duration: 0.3 }, 0.05)
        .to(inputRef.current, { opacity: 1, duration: 0.3 }, 0.2)
        .to(datesWrapRef.current, {
          height: h,
          duration: 0.42,
          ease: 'power3.out',
          onComplete: () => { if (datesWrapRef.current) datesWrapRef.current.style.height = 'auto' },
        }, 0.22)
        .fromTo(
          chips,
          { opacity: 0, y: 12, scale: 0.85 },
          { opacity: 1, y: 0, scale: 1, stagger: 0.06, duration: 0.38, ease: 'back.out(2)' },
          0.3
        )
      inputRef.current?.focus()
    } else {
      gsap.set(datesWrapRef.current, { height: datesRef.current?.offsetHeight ?? 0 })
      tl.to(chips, { opacity: 0, y: 10, scale: 0.85, duration: 0.18, stagger: 0.03 }, 0)
        .to(datesWrapRef.current, { height: 0, duration: 0.35, ease: 'power3.inOut' }, 0.05)
        .to(inputRef.current, { opacity: 0, duration: 0.15 }, 0)
        .to(iconRef.current, { color: '#ffffff', duration: 0.25 }, 0.05)
        .to(fillRef.current, { opacity: 1, duration: 0.3, ease: 'power2.in' }, 0.05)
        .to(barRef.current, { width: CIRCLE, duration: 0.42, ease: 'power3.inOut' }, 0.08)
      inputRef.current?.blur()
    }
  }, [open])

  // Apparition du bouton « Commencer votre voyage mémoriel » dès qu'on écrit :
  // comme un souvenir qui remonte — fondu + montée + flou qui se dissipe.
  useEffect(() => {
    if (showStart && startRef.current) {
      gsap.fromTo(
        startRef.current,
        { opacity: 0, y: 22, scale: 0.96, filter: 'blur(9px)' },
        { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.7, ease: 'power3.out' }
      )
    }
  }, [showStart])

  // Clic en dehors → on referme.
  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  return (
    <div className={`msearch${open ? ' is-open' : ''}`} ref={rootRef}>
      <div
        className="msearch-bar"
        ref={barRef}
        onClick={() => { if (!open) setOpen(true) }}
      >
        <div className="msearch-fill" ref={fillRef} />
        <button
          className="msearch-icon-btn"
          onClick={(e) => { e.stopPropagation(); setOpen((o) => !o) }}
          aria-label={open ? 'Fermer la recherche' : 'Ouvrir la recherche'}
        >
          <span className="msearch-icon" ref={iconRef}>
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <line x1="16.5" y1="16.5" x2="21" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </span>
        </button>
        <input
          className="msearch-input"
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && value.trim()) onStart?.(value) }}
          placeholder="Rechercher un souvenir…"
          aria-label="Rechercher un souvenir"
        />
      </div>

      <div className="msearch-dates-wrap" ref={datesWrapRef}>
        <div className="msearch-dates" ref={datesRef}>
          {FILTERS.map((d) => (
            <button
              key={d}
              className="msearch-date-chip"
              onClick={() => onSelectFilter?.(d)}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {showStart && (
        <button
          className="primary-button msearch-start"
          ref={startRef}
          onClick={() => onStart?.(value)}
        >
          Commencer votre voyage mémoriel
        </button>
      )}
    </div>
  )
}
