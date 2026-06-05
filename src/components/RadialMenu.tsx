import { useState, useRef, useEffect, useCallback } from 'react'
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

// 4 items evenly spread in a 150° arc (165°→15°), R = 90px
const R = 90
const ANGLES = [165, 115, 65, 15]
const ITEMS: MenuItem[] = [
  { id: 'intro',     label: 'Accueil',    Icon: IconHome,  x: Math.cos((ANGLES[0] * Math.PI) / 180) * R, y: -Math.sin((ANGLES[0] * Math.PI) / 180) * R },
  { id: 'souvenirs', label: 'Souvenirs',  Icon: IconPhoto, x: Math.cos((ANGLES[1] * Math.PI) / 180) * R, y: -Math.sin((ANGLES[1] * Math.PI) / 180) * R },
  { id: 'balades',   label: 'Balades',    Icon: IconRoute, x: Math.cos((ANGLES[2] * Math.PI) / 180) * R, y: -Math.sin((ANGLES[2] * Math.PI) / 180) * R },
  { id: 'settings',  label: 'Paramètres', Icon: IconGear,  x: Math.cos((ANGLES[3] * Math.PI) / 180) * R, y: -Math.sin((ANGLES[3] * Math.PI) / 180) * R },
]

interface RadialMenuProps {
  active: NavScreen
  onNavigate: (screen: NavScreen) => void
}

export default function RadialMenu({ active, onNavigate }: RadialMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const busy      = useRef(false)
  const dotRef    = useRef<HTMLButtonElement>(null)
  const itemRefs  = useRef<(HTMLButtonElement | null)[]>([])
  const labelRefs = useRef<(HTMLSpanElement | null)[]>([])

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
  }, [])

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
  }, [])

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
