import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import './Home.css'

interface HomeProps {
  onNavigate: (page: string) => void
}

export default function Home({ onNavigate }: HomeProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLParagraphElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const buttonsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const tl = gsap.timeline()

    // Reset initial state
    gsap.set([titleRef.current, subtitleRef.current, buttonsRef.current], {
      opacity: 0,
      y: 20,
    })

    // Animate in
    tl.to(titleRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.6,
      ease: 'power2.out',
    }, 0)

    tl.to(
      subtitleRef.current,
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out',
      },
      0.2
    )

    tl.to(
      buttonsRef.current,
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        ease: 'power2.out',
      },
      0.4
    )
  }, [])

  const handleButtonHover = (e: React.MouseEvent<HTMLButtonElement>) => {
    gsap.to(e.currentTarget, {
      y: -4,
      boxShadow: '0px 12px 24px rgba(0, 0, 0, 0.15)',
      duration: 0.3,
    })
  }

  const handleButtonLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    gsap.to(e.currentTarget, {
      y: 0,
      boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
      duration: 0.3,
    })
  }

  const handleNavigation = (page: string) => {
    gsap.to(containerRef.current, {
      opacity: 0,
      duration: 0.4,
      ease: 'power2.in',
      onComplete: () => onNavigate(page),
    })
  }

  return (
    <div className="home-container" ref={containerRef}>
      <div className="home-content">
        <h1 className="home-title" ref={titleRef}>
          Mimnesko
        </h1>
        <p className="home-subtitle" ref={subtitleRef}>
          Explorez vos souvenirs de manière immersive
        </p>

        <div className="home-buttons" ref={buttonsRef}>
          <button
            className="nav-button memory-btn"
            onClick={() => handleNavigation('memory')}
            onMouseEnter={handleButtonHover}
            onMouseLeave={handleButtonLeave}
          >
            <span className="btn-icon">🏠</span>
            <span className="btn-text">Galerie de Souvenirs</span>
            <span className="btn-description">Naviguez à travers vos photos</span>
          </button>

          <button
            className="nav-button walk-btn"
            onClick={() => handleNavigation('walk')}
            onMouseEnter={handleButtonHover}
            onMouseLeave={handleButtonLeave}
          >
            <span className="btn-icon">🚶</span>
            <span className="btn-text">Créer une Balade</span>
            <span className="btn-description">Lancez une nouvelle expérience</span>
          </button>
        </div>
      </div>
    </div>
  )
}
