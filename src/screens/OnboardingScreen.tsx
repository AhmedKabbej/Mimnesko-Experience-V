import { useState, useEffect, useRef, useCallback } from 'react'
import type { ReactNode } from 'react'
import gsap from 'gsap'
import { Draggable } from 'gsap/Draggable'
import './OnboardingScreen.css'

gsap.registerPlugin(Draggable)

interface OnboardingScreenProps {
  onComplete: () => void
}

function InfomaniakLogo() {
  return (
    <svg viewBox="0 0 316 52" fill="none" className="ob-infologo-svg" aria-label="infomaniak">
      <text
        x="158" y="42"
        textAnchor="middle"
        fontFamily="'Nunito', 'Arial Black', Arial, sans-serif"
        fontSize="46"
        fontWeight="900"
        fill="#0EA5E9"
        letterSpacing="-0.8"
      >
        infomaniak
      </text>
    </svg>
  )
}

// ─────────────────── Polaroids souvenirs (écran d'accueil) ───────────────────

const POLAROIDS = [
  '/memories/memory-15.jpg', // 1-3 : mobile + PC
  '/memories/memory-8.jpg',
  '/memories/memory-5.jpg',
  '/memories/memory-7.jpg',  // 4 : à partir de 768px
  '/memories/memory-3.jpg',  // 5 : à partir de 1280px
]

function Polaroids() {
  return (
    <div className="ob-polaroids" aria-hidden="true">
      {POLAROIDS.map((src, i) => (
        <div key={i} className={`ob-polaroid ob-polaroid--${i + 1} ob-anim`}>
          {/* float = couche d'animation flottante (séparée du transform GSAP d'entrée) */}
          <div className="ob-polaroid-float">
            <div className="ob-polaroid-inner">
              <img src={src} alt="" loading="eager" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─────────────────── Slides data (mes illustrations) ───────────────────

const SLIDES: { caption: string; title: ReactNode; body: string; img: string; rse?: boolean }[] = [
  {
    caption: "Découvrez l'expérience virale !",
    title: <>Revivre<br />tes souvenirs</>,
    body: "Découvre une nouvelle façon de revivre tes souvenirs, grâce à Mimneskō.",
    img: '/onboarding/illu1.png',
  },
  {
    caption: "Découvrez nos actions dans notre",
    title: <><span className="ob-title-xl">Go</span><br />Green</>,
    body: "La chaleur de notre data center chauffe 6 000 foyers en Suisse.",
    img: '/onboarding/illu2.png',
    rse: true,
  },
  {
    caption: "Toutes vos photos à un endroit, à portée de main.",
    title: <>Éthique<br />&amp; Sécurisé</>,
    body: "Nous n'exploitons pas vos données. Elles restent sous votre contrôle total.",
    img: '/onboarding/illu3.png',
  },
]

// ─────────────────── Main component ───────────────────
// Écrans : 0 = intro Mimneskō · 1 = accueil · 2..N+1 = slides · N+2 = final

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const [step, setStep]                     = useState(0)
  const [showInfomaniak, setShowInfomaniak] = useState(false)
  const [showPermission, setShowPermission] = useState(false)
  const [finalWarm, setFinalWarm]           = useState(false)
  const [showRSE, setShowRSE]               = useState(false)
  const [showReadyChip, setShowReadyChip]   = useState(false)
  const [lightbox, setLightbox]             = useState<string | null>(null)
  const splashRef  = useRef<HTMLDivElement>(null)
  const welcomeRef = useRef<HTMLDivElement>(null)
  const slideRef   = useRef<HTMLDivElement>(null)
  const finalRef   = useRef<HTMLDivElement>(null)
  const sheetRef   = useRef<HTMLDivElement>(null)
  const permRef    = useRef<HTMLDivElement>(null)

  const SLIDE_COUNT = SLIDES.length
  const FIRST_SLIDE = 2
  const LAST_SLIDE  = FIRST_SLIDE + SLIDE_COUNT - 1
  const FINAL_STEP  = LAST_SLIDE + 1

  const isSlide = step >= FIRST_SLIDE && step <= LAST_SLIDE

  // L'élément actuellement à l'écran (pour les transitions)
  const currentEl = useCallback(() => {
    if (step === 1) return welcomeRef.current
    if (step >= FIRST_SLIDE && step <= LAST_SLIDE) return slideRef.current
    if (step === FINAL_STEP) return finalRef.current
    return splashRef.current
  }, [step, FIRST_SLIDE, LAST_SLIDE, FINAL_STEP])

  // Intro Mimneskō : entrée + auto-avance
  useEffect(() => {
    const el = splashRef.current
    if (!el || step !== 0) return
    const logo = el.querySelector('.ob-splash-logo') as HTMLElement
    const sub  = el.querySelector('.ob-splash-sub') as HTMLElement
    gsap.set([logo, sub], { opacity: 0, y: 24 })
    const tl = gsap.timeline()
    tl.to(logo, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0.3)
    tl.to(sub,  { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0.8)
    const t = setTimeout(() => goToStep(1), 4000)
    return () => { clearTimeout(t); tl.kill() }
  }, [step])

  // Welcome / slide / final entrance
  useEffect(() => {
    const el = step === 1 ? welcomeRef.current
      : (step >= FIRST_SLIDE && step <= LAST_SLIDE) ? slideRef.current
      : step === FINAL_STEP ? finalRef.current : null
    if (!el) return
    const children = el.querySelectorAll('.ob-anim')
    gsap.set(children, { opacity: 0, y: 16 })
    gsap.to(children, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out', stagger: 0.09 })
  }, [step])

  // Final : on laisse le sauge s'installer, puis le fond glisse vers l'orange (1,5 s)
  useEffect(() => {
    if (step !== FINAL_STEP) { setFinalWarm(false); return }
    const t = setTimeout(() => setFinalWarm(true), 1500)
    return () => clearTimeout(t)
  }, [step, FINAL_STEP])

  // Lightbox : fermeture à la touche Échap
  useEffect(() => {
    if (!lightbox) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightbox(null) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox])

  // Final : chip « Cloud Mimneskō ready » qui apparaît à l'arrivée puis disparaît
  useEffect(() => {
    if (step !== FINAL_STEP) { setShowReadyChip(false); return }
    setShowReadyChip(true)
    const t = setTimeout(() => setShowReadyChip(false), 3400)
    return () => clearTimeout(t)
  }, [step, FINAL_STEP])

  // Drag des polaroids — PC uniquement (GSAP Draggable)
  useEffect(() => {
    if (step !== 1) return
    if (typeof window === 'undefined' || !window.matchMedia('(min-width: 768px)').matches) return
    const root = welcomeRef.current
    if (!root) return
    const instances: Draggable[] = []
    // on laisse l'animation d'entrée se terminer avant d'activer le drag
    const delayed = gsap.delayedCall(0.7, () => {
      root.querySelectorAll<HTMLElement>('.ob-polaroid').forEach((card) => {
        if (getComputedStyle(card).display === 'none') return // ignore les photos masquées
        const inner = card.querySelector<HTMLElement>('.ob-polaroid-inner')
        instances.push(...Draggable.create(card, {
          type: 'x,y',
          trigger: inner ?? card,
          bounds: root,
          edgeResistance: 0.7,
          dragResistance: 0.18,
          cursor: 'grab',
          activeCursor: 'grabbing',
        }))
      })
    })
    return () => { delayed.kill(); instances.forEach((d) => d.kill()) }
  }, [step])

  useEffect(() => {
    if (!showInfomaniak || !sheetRef.current) return
    gsap.fromTo(sheetRef.current, { y: '100%' }, { y: '0%', duration: 0.45, ease: 'power3.out' })
  }, [showInfomaniak])

  useEffect(() => {
    if (!showPermission || !permRef.current) return
    gsap.fromTo(permRef.current, { scale: 1.12, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.6)' })
  }, [showPermission])

  const goToStep = useCallback((nextStep: number, dir: 1 | -1 = 1) => {
    const el = currentEl()
    if (!el) { setStep(nextStep); return }
    gsap.to(el, {
      opacity: 0, x: dir * -30, duration: 0.22, ease: 'power2.in',
      onComplete: () => {
        setStep(nextStep)
        gsap.fromTo(el, { x: dir * 30 }, { x: 0, opacity: 1, duration: 0.28, ease: 'power2.out' })
      },
    })
  }, [currentEl])

  const next = () => {
    // Sur « Éthique & Sécurisé » (dernière slide), le clic « Continuer » joue le son serveur.
    if (step === LAST_SLIDE) {
      try { new Audio('/mp3/serverload.MP3').play().catch(() => {}) } catch { /* audio non bloquant */ }
    }
    if (step < FINAL_STEP) goToStep(step + 1, 1)
    else onComplete()
  }
  const back = () => goToStep(step - 1, -1) // slide 1 → accueil

  const closeInfomaniak = () => {
    if (!sheetRef.current) return setShowInfomaniak(false)
    gsap.to(sheetRef.current, { y: '100%', duration: 0.35, ease: 'power3.in', onComplete: () => setShowInfomaniak(false) })
  }

  const dismissPermission = (granted: boolean) => {
    if (!permRef.current) { setShowPermission(false); if (granted) onComplete(); return }
    gsap.to(permRef.current, {
      scale: 0.92, opacity: 0, duration: 0.2, ease: 'power2.in',
      onComplete: () => { setShowPermission(false); if (granted) onComplete() },
    })
  }

  const slideIndex = step - FIRST_SLIDE
  const slide = SLIDES[slideIndex]

  return (
    <div className="ob-screen">

      {/* ── INTRO MIMNESKŌ (step 0) ── */}
      {step === 0 && (
        <div className="ob-splash" ref={splashRef} onClick={() => goToStep(1)}>
          <div className="ob-splash-content">
            <h1 className="ob-splash-logo">Mimneskō</h1>
            <p className="ob-splash-sub">Vos souvenirs, votre monde</p>
          </div>
        </div>
      )}

      {/* ── ACCUEIL (step 1) ── */}
      {step === 1 && (
        <div className="ob-welcome" ref={welcomeRef}>
          <Polaroids />

          <div className="ob-welcome-text">
            <h1 className="ob-welcome-title ob-anim">Une autre manière de revivre tes souvenirs</h1>
            <p className="ob-welcome-sub ob-anim">Ton Cloud éthique à portée de main.</p>
          </div>

          <div className="ob-welcome-actions">
            <button className="ob-welcome-cta ob-anim" onClick={() => goToStep(FIRST_SLIDE, 1)}>
              Démarrer
            </button>
            <button className="ob-welcome-login ob-anim" onClick={onComplete}>
              J'ai déjà un compte
            </button>
          </div>
        </div>
      )}

      {/* ── SLIDES (steps 2..N+1) ── */}
      {isSlide && slide && (
        <div className="ob-slide" ref={slideRef}>
          <div className="ob-dots ob-anim">
            {SLIDES.map((_, i) => (
              <span key={i} className={`ob-dot${i === slideIndex ? ' ob-dot--active' : ''}`} />
            ))}
          </div>

          <button
            type="button"
            className="ob-card ob-anim"
            onClick={() => setLightbox(slide.img)}
            aria-label="Agrandir l'image"
          >
            <img src={slide.img} alt="" className="ob-illu-img" />
          </button>
          <p className="ob-caption ob-anim">
            {slide.caption}
            {slide.rse && (
              <>
                {' '}
                <button type="button" className="ob-rse-link" onClick={() => setShowRSE(true)}>
                  rubrique RSE
                </button>
              </>
            )}
          </p>

          <div className="ob-spacer" />

          <h2 className="ob-slide-title ob-anim">{slide.title}</h2>
          <p className="ob-slide-body ob-anim">{slide.body}</p>

          <div className="ob-actions">
            <button className="ob-btn-light ob-anim" onClick={next}>
              Continuer <span className="ob-arrow">→</span>
            </button>
            <button className="ob-link ob-anim" onClick={back}>Revenir en arrière</button>
          </div>
        </div>
      )}

      {/* ── FINAL (step N+2) ── */}
      {step === FINAL_STEP && (
        <div className={`ob-final${finalWarm ? ' is-warm' : ''}`} ref={finalRef}>
          <div className={`ob-ready-chip${showReadyChip ? ' is-visible' : ''}`} aria-live="polite">
            <span className="ob-ready-dot" />
            Cloud Mimneskō ready
          </div>

          <div className="ob-final-brand ob-anim">
            <span>MIMNESKŌ © 2026</span>
            <span>A POETIC RESISTANCE</span>
          </div>

          <div className="ob-check-wrap ob-anim">
            <div className="ob-check-glow" />
            <div className="ob-check-circle">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M7 16l7 7 11-13" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          <h1 className="ob-final-title ob-anim">Bienvenue dans<br />votre Cloud</h1>

          <div className="ob-final-sub ob-anim">
            <p>Prêt à commencer ?</p>
            <p>Déposez vos fichiers, on s'occupe du reste.</p>
          </div>

          <button className="ob-final-cta ob-anim" onClick={() => setShowPermission(true)}>
            Accéder au Cloud
          </button>

          <button className="ob-final-info ob-anim" onClick={() => setShowInfomaniak(true)}>
            En partenariat avec Infomaniak <span className="ob-arrow">→</span>
          </button>

          <div className="ob-final-meta ob-anim">
            <span>Beta privée · Lancement 30.06.2026</span>
            <span>Low-tech / High care</span>
          </div>
        </div>
      )}

      {/* ── INFOMANIAK SHEET ── */}
      {showInfomaniak && (
        <>
          <div className="ob-sheet-backdrop" onClick={closeInfomaniak} />
          <div className="ob-sheet" ref={sheetRef}>
            <div className="ob-sheet-handle" />
            <span className="ob-sheet-eyebrow">EN PARTENARIAT AVEC</span>
            <InfomaniakLogo />
            <div className="ob-sheet-body">
              <p>Hébergeur suisse 100% renouvelable. Leurs serveurs chauffent des habitations en Suisse grâce à la récupération de chaleur. Zéro climatisation.</p>
              <p>Mimneskō s'appuie sur leur expertise pour concevoir des serveurs privés dans cette même démarche éthique.</p>
            </div>
            <div className="ob-sheet-stats">
              <div className="ob-stat"><span className="ob-stat-val">0</span><span className="ob-stat-label">Climatisation</span></div>
              <div className="ob-stat"><span className="ob-stat-val">100%</span><span className="ob-stat-label">Renouvelable</span></div>
              <div className="ob-stat"><span className="ob-stat-val">🇨🇭</span><span className="ob-stat-label">Suisse</span></div>
            </div>
            <button className="ob-sheet-cta" onClick={closeInfomaniak}>Compris</button>
          </div>
        </>
      )}

      {/* ── MINI POP-UP RSE ── */}
      {showRSE && (
        <div className="ob-rse-overlay" onClick={() => setShowRSE(false)}>
          <div className="ob-rse-pop" onClick={(e) => e.stopPropagation()}>
            <span className="ob-rse-badge">RSE</span>
            <h3 className="ob-rse-title">Responsabilité Sociétale</h3>
            <p className="ob-rse-text">
              Chez Mimneskō, un cloud bas-carbone et éthique : data centers qui chauffent des foyers,
              énergie 100 % renouvelable, et zéro exploitation de vos données.
            </p>
            <button type="button" className="ob-rse-close" onClick={() => setShowRSE(false)}>
              Compris
            </button>
          </div>
        </div>
      )}

      {/* ── LIGHTBOX (photo plein écran) ── */}
      {lightbox && (
        <div className="ob-lightbox" onClick={() => setLightbox(null)}>
          <button type="button" className="ob-lightbox-close" aria-label="Fermer" onClick={() => setLightbox(null)}>
            ×
          </button>
          <img
            src={lightbox}
            alt=""
            className="ob-lightbox-img"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* ── PERMISSION ALERT (iOS style) ── */}
      {showPermission && (
        <div className="ob-perm-overlay">
          <div className="ob-perm-alert" ref={permRef}>
            <div className="ob-perm-icon">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="5" width="18" height="14" rx="2.4" stroke="white" strokeWidth="1.8"/>
                <circle cx="8.5" cy="10" r="1.6" fill="white"/>
                <path d="M5 17l4.5-4.5 3 3L16 11l3 3.5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="ob-perm-title">« Mimneskō » souhaite accéder à vos photos</h3>
            <p className="ob-perm-msg">
              L'accès à votre galerie et à vos médias permet à votre cloud privé d'importer vos photos et vidéos pour créer vos souvenirs. Vos fichiers sont chiffrés sur votre appareil — personne d'autre n'y accède.
            </p>
            <div className="ob-perm-actions">
              <button className="ob-perm-btn ob-perm-btn--deny" onClick={() => dismissPermission(false)}>Ne pas autoriser</button>
              <button className="ob-perm-btn ob-perm-btn--allow" onClick={() => dismissPermission(true)}>Autoriser l'accès</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
