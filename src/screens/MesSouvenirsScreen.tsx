import { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { IconArrowLeft, IconCloud, IconSearch, IconStar, IconPlus } from '../components/icons'
import './MesSouvenirsScreen.css'

interface MesSouvenirsScreenProps {
  onBack: () => void
}

interface Souvenir {
  id: number
  title: string
  date: string
  starred: boolean
  synced: boolean
}

const SOUVENIRS: Souvenir[] = [
  { id: 1, title: 'Vacances été 2026',    date: '15 mars 2026',  starred: true,  synced: true  },
  { id: 2, title: 'Randonnée montagne',   date: '12 mars 2026',  starred: false, synced: true  },
  { id: 3, title: 'Anniversaire Lucas',   date: '8 mars 2026',   starred: true,  synced: false },
  { id: 4, title: 'Anniversaire Sophie',  date: '5 mars 2026',   starred: false, synced: true  },
  { id: 5, title: 'Week-end Espagne',     date: '2 mars 2026',   starred: true,  synced: true  },
  { id: 6, title: 'Première maison',      date: '28 fév 2026',   starred: false, synced: true  },
  { id: 7, title: 'Noël en famille',      date: '25 déc 2025',   starred: true,  synced: true  },
  { id: 8, title: 'Concert jazz',         date: '20 déc 2025',   starred: false, synced: true  },
]

export default function MesSouvenirsScreen({ onBack }: MesSouvenirsScreenProps) {
  const [activeFilter, setActiveFilter] = useState<'tous' | 'favoris'>('tous')
  const [query, setQuery]               = useState('')
  const [starred, setStarred]           = useState<Set<number>>(
    new Set(SOUVENIRS.filter(s => s.starred).map(s => s.id))
  )
  const screenRef = useRef<HTMLDivElement>(null)

  const displayed = SOUVENIRS.filter(s => {
    if (activeFilter === 'favoris' && !starred.has(s.id)) return false
    if (query && !s.title.toLowerCase().includes(query.toLowerCase())) return false
    return true
  })

  const toggleStar = (id: number) => {
    setStarred(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  // ── Entrance animation ──
  useEffect(() => {
    const root = screenRef.current
    if (!root) return

    // Split title into chars
    const titleEl = root.querySelector('.ms-title') as HTMLElement
    if (titleEl) {
      titleEl.innerHTML = (titleEl.textContent ?? '').split('').map(c =>
        c === ' ' ? '<span style="display:inline-block;width:0.3em"> </span>'
                  : `<span class="ms-char" style="display:inline-block">${c}</span>`
      ).join('')
    }

    const chars      = root.querySelectorAll('.ms-char')
    const syncBar    = root.querySelector('.ms-sync-bar')
    const tokenArea  = root.querySelector('.ms-token-bar')
    const tokenNum   = root.querySelector('.ms-token-num')
    const tokenFill  = root.querySelector('.ms-token-fill') as HTMLElement
    const searchEl   = root.querySelector('.ms-search-wrap')
    const filters    = root.querySelectorAll('.ms-filter-btn')
    const cards      = root.querySelectorAll('.ms-card')
    const addBtn     = root.querySelector('.ms-add-btn')

    // Initial state
    gsap.set(chars,     { opacity: 0, y: 18, filter: 'blur(6px)' })
    gsap.set(syncBar,   { opacity: 0, x: -24 })
    gsap.set(tokenArea, { opacity: 0, y: 10 })
    gsap.set(searchEl,  { opacity: 0, y: 10 })
    gsap.set(filters,   { opacity: 0, scale: 0.8, x: -8 })
    gsap.set(cards,     { opacity: 0, y: 28, scale: 0.94 })
    gsap.set(addBtn,    { opacity: 0, y: 22 })

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    // Title chars cascade with blur clear
    tl.to(chars, {
      opacity: 1, y: 0, filter: 'blur(0px)',
      duration: 0.55,
      stagger: { amount: 0.45 }
    }, 0)

    // Sync bar slides from left
    tl.to(syncBar, { opacity: 1, x: 0, duration: 0.4 }, 0.3)

    // Token area appears + counter + fill
    tl.to(tokenArea, { opacity: 1, y: 0, duration: 0.4 }, 0.45)
    if (tokenNum) {
      const obj = { n: 0 }
      tl.to(obj, {
        n: 127, duration: 1.1, ease: 'power2.out',
        onUpdate() { tokenNum.textContent = String(Math.round(obj.n)) },
      }, 0.5)
    }
    if (tokenFill) {
      tl.fromTo(tokenFill, { width: '0%' }, { width: '63.5%', duration: 1.1, ease: 'power2.out' }, 0.5)
    }

    // Search
    tl.to(searchEl, { opacity: 1, y: 0, duration: 0.4 }, 0.6)

    // Filter pills pop in
    tl.to(filters, {
      opacity: 1, scale: 1, x: 0, duration: 0.4,
      ease: 'back.out(2)',
      stagger: 0.09
    }, 0.7)

    // Cards materialize in grid order
    tl.to(cards, {
      opacity: 1, y: 0, scale: 1, duration: 0.5,
      stagger: { amount: 0.55, grid: 'auto', from: 'start' }
    }, 0.88)

    // Add button rises last
    tl.to(addBtn, { opacity: 1, y: 0, duration: 0.5, ease: 'back.out(2)' }, 1.15)

    return () => { tl.kill() }
  }, [])

  // Card hover micro-interaction
  const handleCardEnter = (e: React.MouseEvent) => {
    gsap.to(e.currentTarget, { y: -4, boxShadow: '0 8px 24px rgba(0,0,0,0.14)', duration: 0.25, overwrite: 'auto' })
  }
  const handleCardLeave = (e: React.MouseEvent) => {
    gsap.to(e.currentTarget, { y: 0, boxShadow: 'none', duration: 0.25, overwrite: 'auto' })
  }

  return (
    <div className="ms-screen" ref={screenRef}>

      {/* Header */}
      <div className="ms-header">
        <button className="ms-icon-btn" onClick={onBack} aria-label="Retour">
          <IconArrowLeft size={18} />
        </button>
        <h1 className="ms-title">Mes souvenirs</h1>
        <button className="ms-icon-btn" aria-label="Cloud">
          <IconCloud size={22} />
        </button>
      </div>

      {/* Sync status */}
      <div className="ms-sync-bar">
        <span className="ms-sync-label">Synchronisé avec le Cloud (Infomaniak)</span>
        <span className="ms-sync-status">
          <span className="ms-sync-dot" />
          Connecté
        </span>
      </div>

      {/* Token bar */}
      <div className="ms-token-bar">
        <span className="ms-token-label">Souvenirs disponibles (TOKEN)</span>
        <div className="ms-token-right">
          <span className="ms-token-pill">
            <span className="ms-token-num">127</span> / 200
          </span>
          <div className="ms-token-track">
            <div className="ms-token-fill" />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="ms-search-wrap">
        <div className="ms-search">
          <IconSearch size={16} className="ms-search-icon" />
          <input
            type="text"
            className="ms-search-input"
            placeholder="Rechercher un souvenir..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="ms-filters">
        <button
          className={`ms-filter-btn${activeFilter === 'tous' ? ' ms-filter-btn--active' : ''}`}
          onClick={() => setActiveFilter('tous')}
        >Tous</button>
        <button
          className={`ms-filter-btn${activeFilter === 'favoris' ? ' ms-filter-btn--active' : ''}`}
          onClick={() => setActiveFilter('favoris')}
        >Favoris</button>
      </div>

      {/* Grid */}
      <div className="ms-grid">
        {displayed.map(souvenir => (
          <div
            key={souvenir.id}
            className="ms-card"
            onMouseEnter={handleCardEnter}
            onMouseLeave={handleCardLeave}
          >
            <div className="ms-card-img">
              {souvenir.synced && (
                <span className="ms-card-cloud"><IconCloud size={13} /></span>
              )}
              <button
                className="ms-card-star"
                onClick={() => toggleStar(souvenir.id)}
                aria-label={starred.has(souvenir.id) ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              >
                <IconStar size={15} filled={starred.has(souvenir.id)} />
              </button>
              <svg className="ms-card-placeholder" viewBox="0 0 48 48" fill="none">
                <rect x="6" y="8" width="36" height="32" rx="4" stroke="currentColor" strokeWidth="2"/>
                <circle cx="18" cy="20" r="4" stroke="currentColor" strokeWidth="2"/>
                <path d="M6 34l10-10 8 8 6-6 12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="ms-card-caption">
              <span className="ms-card-title">{souvenir.title}</span>
              <span className="ms-card-date">{souvenir.date}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add button */}
      <div className="ms-add-wrap">
        <button className="ms-add-btn">
          <IconPlus size={18} />
          Ajouter un souvenir
        </button>
      </div>

    </div>
  )
}
