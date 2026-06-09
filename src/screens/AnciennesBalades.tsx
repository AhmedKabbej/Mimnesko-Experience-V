import { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import {
  IconArrowLeft, IconClock, IconSearch, IconShare, IconCloud, IconSync, IconStar, IconMapPin, IconCalendar
} from '../components/icons'
import './AnciennesBalades.css'

interface AnciennesBaladeProps {
  onBack: () => void
  onOpenGallery: () => void
  onLaunchExperience: () => void
}

type FilterId = 'toutes' | 'recentes' | 'partagees' | 'favoris' | 'hors-ligne'

const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'toutes',     label: 'Toutes'     },
  { id: 'recentes',   label: 'Récentes'   },
  { id: 'partagees',  label: 'Partagées'  },
  { id: 'favoris',    label: 'Favoris'    },
  { id: 'hors-ligne', label: 'Hors ligne' },
]

interface ListItem {
  type: 'shared' | 'link' | 'balade'
  id: string | number
  // shared
  title?: string
  by?: string
  // balade
  location?: string
  date?: string
  duration?: string
  souvenirs?: number
  tag?: string
  starred?: boolean
  synced?: boolean | 'offline'
}

const buildList = (): ListItem[] => [
  // Shared balades header row
  { type: 'shared', id: 'sh1', title: 'Balade Seine', by: 'Marie' },
  { type: 'shared', id: 'sh2', title: 'Nuit Paris',   by: 'Thomas' },
  // My balades link
  { type: 'link', id: 'link' },
  // Personal balades
  { type: 'balade', id: 1, title: 'Balade dans le parc',      location: 'Montmartre, Paris',       date: '15 mars 2026', duration: '1 min',  souvenirs: 5, tag: 'Calme',      starred: false, synced: true      },
  { type: 'balade', id: 2, title: 'Promenade en forêt',        location: 'Forêt de Fontainebleau', date: '8 mars 2026',  duration: '3 min',  souvenirs: 8, tag: 'Immersive', starred: true,  synced: true      },
  { type: 'balade', id: 3, title: 'Exploration urbaine',       location: 'Le Marais, Paris',        date: '1 mars 2026',  duration: '25 min', souvenirs: 3, tag: 'Calme',      starred: false, synced: 'offline' },
  { type: 'balade', id: 4, title: 'Forêt de Fontainebleau',   location: 'Fontainebleau',           date: '18 avr 2026',  duration: '2h30',   souvenirs: 8, tag: 'Immersive', starred: true,  synced: true      },
  { type: 'balade', id: 5, title: 'Montmartre au crépuscule', location: 'Paris',                   date: '15 avr 2026',  duration: '1h20',   souvenirs: 5, tag: 'Nostalgie', starred: false, synced: true      },
  { type: 'balade', id: 6, title: 'Canal Saint-Martin',        location: 'Paris',                   date: '3 avr 2026',   duration: '1h40',   souvenirs: 6, tag: 'Immersive', starred: false, synced: true      },
]

export default function AnciennesBalades({ onBack, onOpenGallery, onLaunchExperience }: AnciennesBaladeProps) {
  const [activeFilter, setActiveFilter] = useState<FilterId>('toutes')
  const [query, setQuery]               = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [starred, setStarred]           = useState<Set<string | number>>(
    new Set(buildList().filter(i => i.type === 'balade' && i.starred).map(i => i.id))
  )
  const screenRef = useRef<HTMLDivElement>(null)

  const allItems = buildList()
  const baladeItems = allItems.filter(i => i.type === 'balade')

  const [selectedId, setSelectedId] = useState<string | number>(baladeItems[0]?.id ?? 1)
  const [isPlaying, setIsPlaying]   = useState(false)
  const selected = baladeItems.find(b => b.id === selectedId) ?? baladeItems[0]

  const visibleItems = allItems.filter(item => {
    if (item.type === 'shared' && activeFilter === 'hors-ligne') return false
    if (item.type === 'link'   && activeFilter !== 'toutes') return false
    if (item.type === 'balade') {
      if (activeFilter === 'favoris'    && !starred.has(item.id))          return false
      if (activeFilter === 'hors-ligne' && item.synced !== 'offline')       return false
      if (activeFilter === 'partagees') return false
      if (query && !item.title?.toLowerCase().includes(query.toLowerCase())) return false
    }
    return true
  })

  const toggleStar = (id: string | number) => {
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

    const titleEl = root.querySelector('.ab-title') as HTMLElement
    if (titleEl) {
      titleEl.innerHTML = (titleEl.textContent ?? '').split('').map(c =>
        c === ' '
          ? '<span style="display:inline-block;width:0.3em"> </span>'
          : `<span class="ab-char" style="display:inline-block;transform-origin:bottom center">${c}</span>`
      ).join('')
    }

    const chars      = root.querySelectorAll('.ab-char')
    const searchEl   = root.querySelector('.ab-search-wrap')
    const filtersEl  = root.querySelector('.ab-filters-wrap')
    const filterBtns = root.querySelectorAll('.ab-filter-btn')
    const listItems  = root.querySelectorAll('.ab-item')
    const ctaBtn     = root.querySelector('.ab-cta-btn')

    gsap.set(chars,      { opacity: 0, y: 20, rotationX: 80, transformPerspective: 600 })
    gsap.set(searchEl,   { opacity: 0, y: -10 })
    gsap.set(filtersEl,  { opacity: 0 })
    gsap.set(filterBtns, { opacity: 0, x: -12 })
    gsap.set(listItems,  { opacity: 0, y: 16 })
    gsap.set(ctaBtn,     { opacity: 0, y: 10, scale: 0.97 })

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

    tl.to(chars, { opacity: 1, y: 0, rotationX: 0, duration: 0.5, ease: 'back.out(1.6)', stagger: { amount: 0.45, from: 'center' } }, 0)
    tl.to(searchEl, { opacity: 1, y: 0, duration: 0.35 }, 0.22)
    tl.to(filtersEl, { opacity: 1, duration: 0.1 }, 0.36)
    tl.to(filterBtns, { opacity: 1, x: 0, duration: 0.32, ease: 'back.out(1.4)', stagger: 0.065 }, 0.38)
    tl.to(listItems, { opacity: 1, y: 0, duration: 0.4, stagger: { amount: 0.4 } }, 0.62)
    tl.to(ctaBtn, { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'back.out(2)' }, 1.1)

    return () => { tl.kill() }
  }, [])

  const handleItemEnter = (e: React.MouseEvent) =>
    gsap.to(e.currentTarget, { y: -2, boxShadow: '0 4px 16px rgba(0,0,0,0.1)', duration: 0.2, overwrite: 'auto' })
  const handleItemLeave = (e: React.MouseEvent) =>
    gsap.to(e.currentTarget, { y: 0, boxShadow: 'none', duration: 0.2, overwrite: 'auto' })

  return (
    <div className="ab-screen" ref={screenRef}>

      {/* Header */}
      <div className="ab-header">
        <button className="ab-icon-btn" onClick={onBack}><IconArrowLeft size={18} /></button>
        <h1 className="ab-title">Anciennes balades</h1>
        <button className="ab-icon-btn"><IconClock size={19} /></button>
      </div>

      {/* Search */}
      <div className="ab-search-wrap">
        <div className={`ab-search${searchFocused ? ' ab-search--focused' : ''}`}>
          <IconSearch size={15} className="ab-search-icon" />
          <input
            className="ab-search-input"
            placeholder="Rechercher une balade..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>
        {searchFocused && !query && (
          <div className="ab-hints">
            <span>Par lieu (ex : Montmartre, forêt…)</span>
            <span>Par émotion (ex : calme, nostalgie…)</span>
            <span>Par moment (ex : été, nuit, pluie…)</span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="ab-filters-wrap">
        <div className="ab-filters">
          {FILTERS.map(f => (
            <button
              key={f.id}
              className={`ab-filter-btn${activeFilter === f.id ? ' ab-filter-btn--active' : ''}`}
              onClick={() => setActiveFilter(f.id)}
            >{f.label}</button>
          ))}
        </div>
      </div>

      {/* Flat list */}
      <div className="ab-content">
        <div className="ab-list">
          {visibleItems.map(item => {

            if (item.type === 'shared') return (
              <div key={item.id} className="ab-item ab-item--shared" onMouseEnter={handleItemEnter} onMouseLeave={handleItemLeave}>
                <div className="ab-item-avatar">{(item.by ?? '?')[0]}</div>
                <div className="ab-item-body">
                  <span className="ab-item-title">{item.title}</span>
                  <span className="ab-item-sub">Partagée par {item.by}</span>
                </div>
                <span className="ab-item-badge ab-item-badge--shared">Partagée</span>
              </div>
            )

            if (item.type === 'link') return (
              <button key="link" className="ab-item ab-item--link" onClick={onOpenGallery}>
                <span>Voir mes balades Mimnesko</span>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )

            // type === 'balade'
            const isStarred = starred.has(item.id)
            const isSelected = item.id === selectedId
            return (
              <div
                key={item.id}
                className={`ab-item ab-item--balade${isSelected ? ' ab-item--selected' : ''}`}
                onMouseEnter={handleItemEnter}
                onMouseLeave={handleItemLeave}
                onClick={() => { setSelectedId(item.id); setIsPlaying(false) }}
              >
                <div className="ab-item-body">
                  <div className="ab-item-row1">
                    <span className="ab-item-title">{item.title}</span>
                    <div className="ab-item-actions">
                      <button className="ab-action" onClick={() => toggleStar(item.id)} aria-label="Favori">
                        <IconStar size={15} filled={isStarred} />
                      </button>
                      <button className="ab-action" aria-label="Partager">
                        <IconShare size={14} />
                      </button>
                      {item.synced === 'offline'
                        ? <span className="ab-sync ab-sync--offline"><IconCloud size={13} /></span>
                        : <span className="ab-sync"><IconSync size={13} /></span>
                      }
                    </div>
                  </div>
                  <div className="ab-item-row2">
                    <span className="ab-item-meta">
                      <IconMapPin size={11} />
                      {item.location}
                    </span>
                    <span className="ab-item-meta">
                      <IconCalendar size={11} />
                      {item.date}
                    </span>
                    <span className="ab-item-meta">
                      <IconClock size={11} />
                      {item.duration}
                    </span>
                  </div>
                  <div className="ab-item-row3">
                    <span className="ab-item-souvenirs">{item.souvenirs} souvenir{(item.souvenirs ?? 0) > 1 ? 's' : ''}</span>
                    <span className="ab-item-tag">{item.tag}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Sticky CTA */}
      <div className="ab-cta-wrap">
        <button className="ab-cta-btn" onClick={onOpenGallery}>Voir mes balades Mimnesko 3D →</button>
      </div>

      {/* ── Experience viewer (PC only) ── */}
      <aside className="ab-viewer">
        <div className="ab-viewer-label">Aperçu de l'expérience</div>

        <div className={`ab-viewer-stage${isPlaying ? ' ab-viewer-stage--playing' : ''}`}>
          {/* immersive scene */}
          <div className="ab-viewer-scene">
            <span className="ab-viewer-scene-tag">{selected?.tag}</span>
            <div className="ab-viewer-glow" />
            {/* grid floor suggestion */}
            <div className="ab-viewer-floor" />

            {/* centered play */}
            <button
              className="ab-viewer-play"
              onClick={() => setIsPlaying(p => !p)}
              aria-label={isPlaying ? 'Pause' : 'Lecture'}
            >
              {isPlaying ? (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="5" width="4" height="14" rx="1.5"/>
                  <rect x="14" y="5" width="4" height="14" rx="1.5"/>
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5.5v13l11-6.5z"/>
                </svg>
              )}
            </button>
          </div>

          {/* timeline controls */}
          <div className="ab-viewer-controls">
            <span className="ab-viewer-time">0:00</span>
            <div className="ab-viewer-timeline">
              <div className={`ab-viewer-progress${isPlaying ? ' ab-viewer-progress--run' : ''}`} />
            </div>
            <span className="ab-viewer-time">{selected?.duration}</span>
          </div>
        </div>

        {/* info */}
        <div className="ab-viewer-info">
          <div className="ab-viewer-info-head">
            <h3 className="ab-viewer-title">{selected?.title}</h3>
            <span className="ab-viewer-badge">{selected?.tag}</span>
          </div>
          <div className="ab-viewer-meta">
            <span><IconMapPin size={12} />{selected?.location}</span>
            <span><IconCalendar size={12} />{selected?.date}</span>
            <span><IconClock size={12} />{selected?.duration}</span>
          </div>
          <div className="ab-viewer-stats">
            <div className="ab-viewer-stat">
              <span className="ab-viewer-stat-val">{selected?.souvenirs}</span>
              <span className="ab-viewer-stat-label">Souvenirs</span>
            </div>
            <div className="ab-viewer-stat">
              <span className="ab-viewer-stat-val">{selected?.synced === 'offline' ? 'Local' : 'Sync'}</span>
              <span className="ab-viewer-stat-label">Stockage</span>
            </div>
          </div>
          <button className="ab-viewer-launch" onClick={onLaunchExperience}>Lancer l'expérience →</button>
        </div>
      </aside>

    </div>
  )
}
