import { useState, useEffect, useRef, useCallback } from 'react'
import gsap from 'gsap'
import './OnboardingScreen.css'

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

// ─────────────────── Slides data ───────────────────

const SLIDES = [
  //rajouter la bold bricolage grotesque pour le titre
  {
    title: "Redécouvrir vos souvenirs",
    body: "Découvrez une nouvelle façon de revivre vos souvenirs dans une expérience immersive. \n Notre interface narrative honore vos souvenirs au lieu de les monétiser en les regroupant en un récap.",
    img: "/onboarding/illu1.png",
  },
  {
    title: "Reprendre le contrôle",
    body: "Vos photos et vidéos méritent mieux que des plateformes opaques qui exploitent vos données personnelles.",
    img: "/onboarding/illu2.png",
  },
  {
    title: "Éthique et sécurisé",
    body: "Vos fichiers sont chiffrés avant même de quitter votre appareil. Personne, pas même nous, ne peut y accéder.\nEn partenariat avec Infomaniak, hébergeur suisse 100% renouvelable. Propriété totale de vos données. Zéro exploitation, transparence absolue, code open-source.",
    img: "/onboarding/illu3.png",
  },
  {
    title: "Votre cloud privé",
    body: "En partenariat avec Infomaniak, hébergeur suisse 100% renouvelable. Un serveur compact, silencieux, chez vous.",
    img: "/onboarding/illu4.png",
  },
  {
    title: "Expérience poétique",
    body: "Une expérience immersive où l’on explore des espaces liminaux vides et silencieux, qui évoquent des lieux familiers mais étrangement déformés, comme des souvenirs flous. En s’y promenant, on ressent une nostalgie profonde.",
    img: "/onboarding/illu5.png",
  },
]

// ─────────────────── Main component ───────────────────

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  // step: 0=splash, 1-5=slides, 6=final
  const [step, setStep]                     = useState(0)
  const [showInfomaniak, setShowInfomaniak] = useState(false)
  const [showPermission, setShowPermission] = useState(false)
  const splashRef = useRef<HTMLDivElement>(null)
  const slideRef  = useRef<HTMLDivElement>(null)
  const finalRef  = useRef<HTMLDivElement>(null)
  const sheetRef  = useRef<HTMLDivElement>(null)
  const permRef   = useRef<HTMLDivElement>(null)

  // Splash entrance animation
  useEffect(() => {
    const el = splashRef.current
    if (!el || step !== 0) return
    const logo = el.querySelector('.ob-splash-logo') as HTMLElement
    const sub  = el.querySelector('.ob-splash-sub') as HTMLElement
    gsap.set([logo, sub], { opacity: 0, y: 24 })
    const tl = gsap.timeline()
    tl.to(logo, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }, 0.3)
    tl.to(sub,  { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 0.8)
    // Auto-advance after 4s
    const t = setTimeout(() => goToStep(1), 4000)
    return () => { clearTimeout(t); tl.kill() }
  }, [step])

  // Slide/final entrance
  useEffect(() => {
    const el = step >= 1 && step <= 5 ? slideRef.current : step === 6 ? finalRef.current : null
    if (!el) return
    const children = el.querySelectorAll('.ob-anim')
    gsap.set(children, { opacity: 0, y: 16 })
    gsap.to(children, { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out', stagger: 0.09 })
  }, [step])

  // Infomaniak sheet open
  useEffect(() => {
    if (!showInfomaniak || !sheetRef.current) return
    gsap.fromTo(sheetRef.current,
      { y: '100%' },
      { y: '0%', duration: 0.45, ease: 'power3.out' }
    )
  }, [showInfomaniak])

  // Permission alert pop-in (iOS style)
  useEffect(() => {
    if (!showPermission || !permRef.current) return
    gsap.fromTo(permRef.current,
      { scale: 1.12, opacity: 0 },
      { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(1.6)' }
    )
  }, [showPermission])

  const goToStep = useCallback((next: number, dir: 1 | -1 = 1) => {
    const el = step >= 1 && step <= 5 ? slideRef.current : step === 6 ? finalRef.current : null
    const doTransition = (cb: () => void) => {
      if (!el) { cb(); return }
      gsap.to(el, {
        opacity: 0, x: dir * -30, duration: 0.22, ease: 'power2.in',
        onComplete: () => { cb(); gsap.fromTo(el, { x: dir * 30 }, { x: 0, opacity: 1, duration: 0.28, ease: 'power2.out' }) }
      })
    }
    doTransition(() => setStep(next))
  }, [step])

  const next = () => {
    if (step < 5) goToStep(step + 1, 1)
    else if (step === 5) goToStep(6, 1)
    else onComplete()
  }

  const back = () => {
    if (step > 1) goToStep(step - 1, -1)
  }

  const closeInfomaniak = () => {
    if (!sheetRef.current) return
    gsap.to(sheetRef.current, { y: '100%', duration: 0.35, ease: 'power3.in', onComplete: () => setShowInfomaniak(false) })
  }

  // Dismiss permission alert, then optionally finish onboarding
  const dismissPermission = (granted: boolean) => {
    if (!permRef.current) { setShowPermission(false); if (granted) onComplete(); return }
    gsap.to(permRef.current, {
      scale: 0.92, opacity: 0, duration: 0.2, ease: 'power2.in',
      onComplete: () => { setShowPermission(false); if (granted) onComplete() }
    })
  }

  const slideIndex = step - 1 // 0-4 for slides 1-5
  const slide = SLIDES[slideIndex]

  return (
    <div className="ob-screen">

      {/* ── SPLASH (step 0) ── */}
      {step === 0 && (
        <div className="ob-splash" ref={splashRef} onClick={() => goToStep(1)}>
          <div className="ob-splash-content">
            <h1 className="ob-splash-logo">Mimneskō</h1>
            <p className="ob-splash-sub">Vos souvenirs, votre monde</p>
          </div>
        </div>
      )}

      {/* ── SLIDES (steps 1–5) ── */}
      {step >= 1 && step <= 5 && (
        <div className="ob-slide" ref={slideRef}>
          <div className="ob-illu-wrap ob-anim">
            <img src={slide.img} alt={slide.title} className="ob-illu-img" />
          </div>

          <div className="ob-text-area">
            <h2 className="ob-slide-title ob-anim">{slide.title}</h2>
            <p className="ob-slide-body ob-anim">
              {slide.body.split('\n').map((line, i) => <span key={i}>{line}<br /></span>)}
            </p>
          </div>

          {/* Dots + Nav — always pinned at bottom */}
          <div className="ob-bottom">
            <div className="ob-dots ob-anim">
              {SLIDES.map((_, i) => (
                <span key={i} className={`ob-dot${i === slideIndex ? ' ob-dot--active' : ''}`} />
              ))}
            </div>
            <div className="ob-nav ob-anim">
              {step > 1
                ? <button className="ob-btn-back" onClick={back}>Revenir</button>
                : <span />
              }
              <button className="ob-btn-next" onClick={next}>Continuer</button>
            </div>
          </div>
        </div>
      )}

      {/* ── FINAL (step 6) ── */}
      {step === 6 && (
        <div className="ob-final" ref={finalRef}>
          <div className="ob-check-wrap ob-anim">
            <div className="ob-check-glow" />
            <div className="ob-check-circle">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <path d="M7 16l7 7 11-13" stroke="white" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          <h1 className="ob-final-title ob-anim">Bienvenue dans<br />Mimneskō</h1>

          <div className="ob-final-sub ob-anim">
            <p>Prêt à commencer ?</p>
            <p>Déposer vos images, on s'occupe du reste.</p>
          </div>

          <button className="ob-final-cta ob-anim" onClick={() => setShowPermission(true)}>
            Accéder au cloud
          </button>

          <div className="ob-final-meta ob-anim">
            <span>Beta privée · Lancement 30.06.2026</span>
            <span>Low-tech / High care</span>
          </div>

          <button
            className="ob-infomaniak-btn ob-anim"
            onClick={() => setShowInfomaniak(true)}
          >
            En partenariat avec Infomaniak →
          </button>

          <div className="ob-final-footer ob-anim">
            <span>MIMNESKŌ © 2026</span>
            <span>A POETIC RESISTANCE</span>
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
              <div className="ob-stat">
                <span className="ob-stat-val">0</span>
                <span className="ob-stat-label">Climatisation</span>
              </div>
              <div className="ob-stat">
                <span className="ob-stat-val">100%</span>
                <span className="ob-stat-label">Renouvelable</span>
              </div>
              <div className="ob-stat">
                <span className="ob-stat-val">🇨🇭</span>
                <span className="ob-stat-label">Suisse</span>
              </div>
            </div>
            <button className="ob-sheet-cta" onClick={closeInfomaniak}>Compris</button>
          </div>
        </>
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
              <button className="ob-perm-btn ob-perm-btn--deny" onClick={() => dismissPermission(false)}>
                Ne pas autoriser
              </button>
              <button className="ob-perm-btn ob-perm-btn--allow" onClick={() => dismissPermission(true)}>
                Autoriser l'accès
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
