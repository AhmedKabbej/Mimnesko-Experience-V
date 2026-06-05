import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import gsap from 'gsap'
import { IconHome, IconPhoto, IconRoute, IconGear } from './icons'
import './RadialMenu.css'

export type NavScreen = 'intro' | 'souvenirs' | 'balades' | 'settings'

interface MenuItem {
  id: NavScreen
  label: string
  Icon: React.FC<{ size?: number }>
  x: number
  y: number
}

const BASE = [
  { id: 'intro'     as NavScreen, label: 'Accueil',    Icon: IconHome },
  { id: 'souvenirs' as NavScreen, label: 'Souvenirs',  Icon: IconPhoto },
  { id: 'balades'   as NavScreen, label: 'Balades',    Icon: IconRoute },
  { id: 'settings'  as NavScreen, label: 'Paramètres', Icon: IconGear },
]

// Desktop: centered bottom, 150° fan (165°→15°)
// Mobile: bottom-right corner, quarter fan up-left (180°→90°) so nothing clips off-screen
function buildItems(isMobile: boolean): MenuItem[] {
  const angles = isMobile ? [180, 150, 120, 90] : [165, 115, 65, 15]
  const R = isMobile ? 82 : 90
  return BASE.map((b, i) => ({
    ...b,
    x: Math.cos((angles[i] * Math.PI) / 180) * R,
    y: -Math.sin((angles[i] * Math.PI) / 180) * R,
  }))
}

interface RadialMenuProps {
  active: NavScreen
  onNavigate: (screen: NavScreen) => void
}

export default function RadialMenu({ active, onNavigate }: RadialMenuProps) {
  const [isOpen, setIsOpen]   = useState(false)
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 900)
  const busy      = useRef(false)
  const dotRef    = useRef<HTMLButtonElement>(null)
  const itemRefs  = useRef<(HTMLButtonElement | null)[]>([])
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([])

  const ITEMS = useMemo(() => buildItems(isMobile), [isMobile])

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 900)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    itemRefs.current.forEach(el => {
      if (el) gsap.set(el, { x: 0, y: 0, scale: 0, opacity: 0 })
    })
    labelRefs.current.forEach(el => {
      if (el) gsap.set(el, { opacity: 0, y: 4 })
    })
  }, [])

  const open = useCallback(() => {
    if (busy.current) return
    busy.current = true
    setIsOpen(true)

    gsap.killTweensOf(dotRef.current)
    gsap.to(dotRef.current, { scale: 1.5, duration: 0.18, ease: 'back.out(3)' })

    ITEMS.forEach((item, i) => {
      const el  = itemRefs.current[i]
      const lbl = labelRefs.current[i]
      if (el) gsap.fromTo(el,
        { x: 0, y: 0, scale: 0, opacity: 0 },
        {
          x: item.x, y: item.y, scale: 1, opacity: 1,
          duration: 0.5, ease: 'back.out(2.5)', delay: i * 0.06,
          onComplete: i === ITEMS.length - 1 ? () => { busy.current = false } : undefined,
        }
      )
      if (lbl) gsap.to(lbl, { opacity: 1, y: 0, duration: 0.22, delay: 0.26 + i * 0.06 })
    })
  }, [ITEMS])

  const close = useCallback((cb?: () => void) => {
    if (busy.current) return
    busy.current = true

    labelRefs.current.forEach(el => {
      if (el) gsap.to(el, { opacity: 0, y: 4, duration: 0.1 })
    })

    ITEMS.forEach((_item, i) => {
      const el = itemRefs.current[i]
      if (!el) return
      const isLast = i === ITEMS.length - 1
      gsap.to(el, {
        x: 0, y: 0, scale: 0, opacity: 0,
        duration: 0.28, ease: 'back.in(2)',
        delay: (ITEMS.length - 1 - i) * 0.045,
        onComplete: isLast ? () => {
          setIsOpen(false)
          busy.current = false
          cb?.()
        } : undefined,
      })
    })
    gsap.to(dotRef.current, { scale: 1, duration: 0.18, ease: 'power2.out' })
  }, [ITEMS])

  const toggle = () => isOpen ? close() : open()

  const handleNav = (screen: NavScreen) => {
    if (screen === active) { close(); return }
    close(() => onNavigate(screen))
  }

  return (
    <>
      {isOpen && <div className="rm-backdrop" onClick={() => close()} />}

      <div className="rm-wrap">
        {ITEMS.map((item, i) => {
          const isActive = item.id === active
          return (
            <button
              key={item.id}
              ref={el => { itemRefs.current[i] = el }}
              className={`rm-item${isActive ? ' rm-item--active' : ''}`}
              onClick={() => handleNav(item.id)}
              aria-label={item.label}
            >
              <item.Icon size={17} />
              <span ref={el => { labelRefs.current[i] = el }} className="rm-label">
                {item.label}
              </span>
            </button>
          )
        })}

        <button
          ref={dotRef}
          className={`rm-dot${isOpen ? ' rm-dot--open' : ''}`}
          onClick={toggle}
          aria-label={isOpen ? 'Fermer' : 'Navigation'}
          aria-expanded={isOpen}
        >
          <span className="rm-dot-inner" />
        </button>
      </div>
    </>
  )
}
