import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import './Intro.css'

interface IntroProps {
  onComplete: () => void
}

export default function Intro({ onComplete }: IntroProps) {
  const logoRef = useRef<HTMLDivElement>(null)
  const progressBarRef = useRef<HTMLDivElement>(null)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    const tl = gsap.timeline()

    // Logo fade in + scale
    tl.to(logoRef.current, {
      opacity: 1,
      scale: 1,
      duration: 0.6,
      ease: 'back.out(1.2)',
    }, 0)

    // Progress bar animation (fast: 2 seconds)
    tl.to(
      progressBarRef.current,
      {
        width: '100%',
        duration: 2,
        ease: 'power1.inOut',
      },
      0.2
    )

    // Fade out after progress complete
    tl.to(
      [logoRef.current, progressBarRef.current],
      {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.inOut',
      },
      1.9
    )

    tl.add(() => {
      setIsComplete(true)
      onComplete()
    })
  }, [onComplete])

  return (
    <div className={`intro-container ${isComplete ? 'intro-hidden' : ''}`}>
      <div className="intro-content">
        <div className="intro-logo" ref={logoRef}>
          MIMNESKÕ
        </div>
        <div className="progress-container">
          <div className="progress-bar" ref={progressBarRef}></div>
        </div>
      </div>
    </div>
  )
}
