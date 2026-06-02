import { useEffect, useRef, useState, lazy, Suspense } from 'react'
import gsap from 'gsap'
import Intro from './screens/Intro'
import LoadingTransition from './components/LoadingTransition'
import './App.css'

const Memory3D = lazy(() => import('./screens/Memory3D'))

type ExperienceType = 'intro' | 'gallery2d'

function App() {
  const [showIntro, setShowIntro] = useState(true)
  const [experience, setExperience] = useState<ExperienceType>('intro')
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isReturning, setIsReturning] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const titleRef = useRef<HTMLParagraphElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // AUDIO REF
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Text split by words
  const splitTextByWords = (element: HTMLElement | null) => {
    if (!element) return []
    const text = element.textContent || ''
    const words = text.split(/\s+/)

    element.innerHTML = words
      .map((word) => `<span class="text-word">${word}</span>`)
      .join(' ')

    return gsap.utils.toArray('.text-word')
  }

  // 🎵 INIT AUDIO ONCE
  useEffect(() => {
    audioRef.current = new Audio('/mp3/mimnesko.MP3')
    audioRef.current.preload = 'auto'
    audioRef.current.loop = true

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current.currentTime = 0
      }
    }
  }, [])

  useEffect(() => {
    if (showIntro) return

    const subtitleWords = splitTextByWords(subtitleRef.current)
    const titleWords = splitTextByWords(titleRef.current)

    const tl = gsap.timeline()

    gsap.set([subtitleWords, titleWords, buttonRef.current], { opacity: 0 })
    gsap.set(subtitleWords, { y: 10 })
    gsap.set(titleWords, { y: 10 })

    tl.to(
      subtitleWords,
      {
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: 'power2.out',
        stagger: { amount: 0.3 },
      },
      0
    )

    tl.to(
      titleWords,
      {
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: 'power2.out',
        stagger: { amount: 0.4 },
      },
      0.5
    )

    tl.to(
      buttonRef.current,
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.6,
        ease: 'back.out(1.5)',
      },
      1.1
    )

    const button = buttonRef.current
    if (button) {
      const handleMouseEnter = () => {
        gsap.to(button, {
          y: -4,
          boxShadow: '0px 12px 20px rgba(0, 0, 0, 0.18)',
          duration: 0.3,
          overwrite: 'auto',
        })
      }

      const handleMouseLeave = () => {
        gsap.to(button, {
          y: 0,
          boxShadow: '0px 8px 12px rgba(0, 0, 0, 0.12)',
          duration: 0.3,
          overwrite: 'auto',
        })
      }

      button.addEventListener('mouseenter', handleMouseEnter)
      button.addEventListener('mouseleave', handleMouseLeave)

      return () => {
        button.removeEventListener('mouseenter', handleMouseEnter)
        button.removeEventListener('mouseleave', handleMouseLeave)
      }
    }
  }, [showIntro])


  const handleCreateWalk = () => {
    gsap
      .timeline()
      .to(buttonRef.current, { scale: 0.95, duration: 0.1 })
      .to(buttonRef.current, { scale: 1, duration: 0.1 }, 0.1)

    if (audioRef.current) {
      audioRef.current.currentTime = 0
      audioRef.current.play().catch((error) => {
        console.log('Audio playback failed:', error)
      })
    }

    setIsTransitioning(true)
  }

  const handleBackFromExperience = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }

    setIsReturning(true)
  }

  return (
    <>
      {isTransitioning && (
        <LoadingTransition
          onMidpoint={() => setExperience('gallery2d')}
          onComplete={() => setIsTransitioning(false)}
        />
      )}

      {isReturning && (
        <LoadingTransition
          circleColor="#ffffff"
          textColor="#000000"
          onMidpoint={() => { setExperience('intro'); setShowIntro(false) }}
          onComplete={() => setIsReturning(false)}
        />
      )}

      {experience === 'gallery2d' && (
        <Suspense fallback={null}>
          <Memory3D onBack={handleBackFromExperience} />
        </Suspense>
      )}

      {experience !== 'gallery2d' && (
        <>
          {showIntro && <Intro onComplete={() => setShowIntro(false)} />}

          <div
            className="app-container"
            ref={containerRef}
            style={{
              opacity: showIntro ? 0 : 1,
              pointerEvents: showIntro ? 'none' : 'auto',
            }}
          >
            <div className="content-wrapper">
              <div className="card-container">
                <div className="text-section">
                  <p className="subtitle" ref={subtitleRef}>
                    C'est ici que tout commence.
                  </p>

                  <p className="title" ref={titleRef}>
                    Marche, ressens, capture… et laisse tes souvenirs prendre vie.
                  </p>
                </div>

                <button
                  className="primary-button"
                  ref={buttonRef}
                  onClick={handleCreateWalk}
                  style={
                    showIntro
                      ? { opacity: 0, pointerEvents: 'none' }
                      : undefined
                  }
                >
                  Créer une balade Mimnesko
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default App